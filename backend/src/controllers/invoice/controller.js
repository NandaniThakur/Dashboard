import { Invoice } from '../../models/invoice/invoiceModel.js';
import Client from '../../models/client/clientModel.js';

// Get all invoices with optional filters
export const getAllInvoices = async (req, res) => {
    try {
        const { status, search } = req.query;
        
        let query = {};
        
        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Search functionality
        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { 'clientDetails.companyName': { $regex: search, $options: 'i' } },
                { 'clientDetails.email': { $regex: search, $options: 'i' } }
            ];
        }
        
        const invoices = await Invoice.find(query)
            .populate('client')
            .populate('createdBy', 'firstName lastName email')
            .sort({ invoiceDate: -1 });
        
        // Calculate statistics
        const allInvoices = await Invoice.find({});
        const stats = {
            overdue: 0,
            dueWithin30Days: 0,
            upcomingPayout: 0,
            avgTimeToGetPaid: 24
        };
        
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        
        allInvoices.forEach(invoice => {
            if (invoice.status === 'unpaid' && invoice.dueDate < now) {
                stats.overdue += invoice.total;
            }
            if (invoice.status === 'unpaid' && invoice.dueDate <= thirtyDaysFromNow && invoice.dueDate >= now) {
                stats.dueWithin30Days += invoice.total;
            }
            if (invoice.status === 'paid') {
                stats.upcomingPayout += invoice.total;
            }
        });
        
        res.status(200).json({
            message: 'Invoices retrieved successfully',
            count: invoices.length,
            stats,
            invoices
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching invoices', 
            error: error.message 
        });
    }
};

// Get single invoice by ID
export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('client')
            .populate('createdBy', 'firstName lastName email');
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        
        res.status(200).json({
            message: 'Invoice retrieved successfully',
            invoice
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching invoice', 
            error: error.message 
        });
    }
};

// Create new invoice
export const createInvoice = async (req, res) => {
    try {
        // Fetch client details and populate invoice data
        const client = await Client.findById(req.body.client);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        const invoiceData = {
            ...req.body,
            clientDetails: {
                companyName: client.companyName,
                contactPerson: client.contactPerson,
                email: client.email,
                phone: client.phone,
                address: client.address,
                gstin: client.gstin
            },
            createdBy: req.user.id
        };
        
        const invoice = await Invoice.create(invoiceData);
        
        res.status(201).json({
            message: 'Invoice created successfully',
            invoice
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating invoice', 
            error: error.message 
        });
    }
};

// Update invoice
export const updateInvoice = async (req, res) => {
    try {
        // If client is being changed, update client details
        if (req.body.client) {
            const client = await Client.findById(req.body.client);
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }
            
            req.body.clientDetails = {
                companyName: client.companyName,
                contactPerson: client.contactPerson,
                email: client.email,
                phone: client.phone,
                address: client.address,
                gstin: client.gstin
            };
        }
        
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        
        res.status(200).json({
            message: 'Invoice updated successfully',
            invoice
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating invoice', 
            error: error.message 
        });
    }
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        
        res.status(200).json({
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting invoice', 
            error: error.message 
        });
    }
};
