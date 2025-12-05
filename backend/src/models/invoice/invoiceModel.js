import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    clientDetails: {
        companyName: String,
        contactPerson: String,
        email: String,
        phone: String,
        address: {
            street: String,
            area: String,
            city: String,
            state: String,
            pincode: String
        },
        gstin: String
    },
    workOrder: {
        type: String,
        trim: true
    },
    billingPeriod: {
        from: Date,
        to: Date
    },
    items: [{
        description: {
            type: String,
            required: true
        },
        hsnCode: {
            type: String,
            default: '9985'
        },
        rate: {
            type: Number,
            required: true
        },
        workingDays: {
            type: Number,
            default: 0
        },
        persons: {
            type: Number,
            default: 1
        },
        quantity: {
            type: Number,
            default: 1
        },
        amount: {
            type: Number,
            required: true
        }
    }],
    materialCharges: {
        type: Number,
        default: 0
    },
    subtotal: {
        type: Number,
        required: true
    },
    managementCharges: {
        percentage: {
            type: Number,
            default: 10
        },
        amount: {
            type: Number,
            default: 0
        }
    },
    cgst: {
        percentage: {
            type: Number,
            default: 9
        },
        amount: {
            type: Number,
            default: 0
        }
    },
    sgst: {
        percentage: {
            type: Number,
            default: 9
        },
        amount: {
            type: Number,
            default: 0
        }
    },
    total: {
        type: Number,
        required: true
    },
    amountInWords: {
        type: String
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid', 'draft', 'overdue'],
        default: 'draft'
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Auto-generate invoice number
invoiceSchema.pre('save', async function() {
    if (!this.invoiceNumber) {
        // Find the last invoice number to ensure uniqueness
        const lastInvoice = await mongoose.model('Invoice')
            .findOne({}, { invoiceNumber: 1 })
            .sort({ createdAt: -1 })
            .limit(1);
        
        let nextNumber = 13; // Starting number
        
        if (lastInvoice && lastInvoice.invoiceNumber) {
            // Extract number from format "ASF/P/25-26/XXX"
            const match = lastInvoice.invoiceNumber.match(/\/(\d+)$/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }
        
        this.invoiceNumber = `ASF/P/25-26/${nextNumber.toString().padStart(3, '0')}`;
    }
});

export const Invoice = mongoose.model('Invoice', invoiceSchema, 'Invoices');
