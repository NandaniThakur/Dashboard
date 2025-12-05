import mongoose from 'mongoose';

const manpowerSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      trim: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    alternatePhone: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
    },
    address: {
      street: { type: String, trim: true },
      area: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true }
    },
    aadharNumber: {
      type: String,
      trim: true
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true
    },
    designation: {
      type: String,
      required: true,
      trim: true,
      enum: ['Housekeeper', 'Security Guard', 'Supervisor', 'Technician', 'Driver', 'Cook', 'Gardener', 'Other']
    },
    department: {
      type: String,
      trim: true
    },
    assignedClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    salary: {
      type: Number,
      required: true
    },
    salaryType: {
      type: String,
      enum: ['Monthly', 'Daily', 'Hourly'],
      default: 'Monthly'
    },
    bankDetails: {
      accountHolderName: { type: String, trim: true },
      bankName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true, uppercase: true },
      branch: { type: String, trim: true }
    },
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: { type: String, trim: true }
    },
    documents: [{
      type: {
        type: String,
        enum: ['Aadhar', 'PAN', 'Photo', 'Resume', 'Certificate', 'Other']
      },
      fileName: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave', 'Terminated'],
      default: 'Active'
    },
    notes: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate employee ID
manpowerSchema.pre('save', async function() {
    if (!this.employeeId) {
        const lastEmployee = await mongoose.model('Manpower')
            .findOne({}, { employeeId: 1 })
            .sort({ createdAt: -1 })
            .limit(1);
        
        let nextNumber = 1001; // Starting employee number
        
        if (lastEmployee && lastEmployee.employeeId) {
            const match = lastEmployee.employeeId.match(/EMP(\d+)$/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }
        
        this.employeeId = `EMP${nextNumber}`;
    }
});

const Manpower = mongoose.model('Manpower', manpowerSchema);

export default Manpower;
