import Manpower from '../../models/manpower/manpowerModel.js';
import Client from '../../models/client/clientModel.js';

// Get all manpower
export const getAllManpower = async (req, res) => {
    try {
        const { status, designation, client, search } = req.query;
        
        let query = {};
        
        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Filter by designation
        if (designation && designation !== 'all') {
            query.designation = designation;
        }
        
        // Filter by assigned client
        if (client) {
            query.assignedClient = client;
        }
        
        // Search functionality
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        const manpower = await Manpower.find(query)
            .populate('assignedClient', 'companyName email')
            .populate('createdBy', 'firstName lastName email')
            .sort({ createdAt: -1 });
        
        // Calculate statistics
        const stats = {
            total: await Manpower.countDocuments(),
            active: await Manpower.countDocuments({ status: 'Active' }),
            inactive: await Manpower.countDocuments({ status: 'Inactive' }),
            onLeave: await Manpower.countDocuments({ status: 'On Leave' }),
            terminated: await Manpower.countDocuments({ status: 'Terminated' })
        };
        
        res.status(200).json({
            message: 'Manpower retrieved successfully',
            count: manpower.length,
            stats,
            data: manpower
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching manpower', 
            error: error.message 
        });
    }
};

// Get single manpower by ID
export const getManpowerById = async (req, res) => {
    try {
        const manpower = await Manpower.findById(req.params.id)
            .populate('assignedClient')
            .populate('createdBy', 'firstName lastName email');
        
        if (!manpower) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        res.status(200).json({
            message: 'Employee retrieved successfully',
            data: manpower
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching employee', 
            error: error.message 
        });
    }
};

// Create new manpower
export const createManpower = async (req, res) => {
    try {
        // Validate assigned client if provided
        if (req.body.assignedClient) {
            const client = await Client.findById(req.body.assignedClient);
            if (!client) {
                return res.status(404).json({ message: 'Assigned client not found' });
            }
        }
        
        const manpowerData = {
            ...req.body,
            createdBy: req.user.id
        };
        
        const manpower = await Manpower.create(manpowerData);
        
        res.status(201).json({
            message: 'Employee created successfully',
            data: manpower
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating employee', 
            error: error.message 
        });
    }
};

// Update manpower
export const updateManpower = async (req, res) => {
    try {
        // Validate assigned client if being changed
        if (req.body.assignedClient) {
            const client = await Client.findById(req.body.assignedClient);
            if (!client) {
                return res.status(404).json({ message: 'Assigned client not found' });
            }
        }
        
        const manpower = await Manpower.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('assignedClient', 'companyName email');
        
        if (!manpower) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        res.status(200).json({
            message: 'Employee updated successfully',
            data: manpower
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating employee', 
            error: error.message 
        });
    }
};

// Delete manpower
export const deleteManpower = async (req, res) => {
    try {
        const manpower = await Manpower.findByIdAndDelete(req.params.id);
        
        if (!manpower) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        res.status(200).json({
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting employee', 
            error: error.message 
        });
    }
};
