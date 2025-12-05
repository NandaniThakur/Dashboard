import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      shopNo: { type: String, trim: true },
      floor: { type: String, trim: true },
      building: { type: String, trim: true },
      area: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true }
    },
    contact: {
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      website: { type: String, trim: true }
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true
    },
    cinNo: {
      type: String,
      trim: true,
      uppercase: true
    },
    bankDetails: {
      bankName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true, uppercase: true },
      branch: { type: String, trim: true }
    },
    paymentTerms: {
      type: String,
      default: 'Payment can only be done in cheque/DD, NEFT, RTGS'
    },
    logo: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Company = mongoose.model('Company', companySchema);

export default Company;
