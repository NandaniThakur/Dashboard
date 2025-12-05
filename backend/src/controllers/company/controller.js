import Company from '../../models/company/companyModel.js';

// Get company settings (should only have one document)
export const getCompanySettings = async (req, res) => {
  try {
    let company = await Company.findOne();
    
    // If no company settings exist, create default one
    if (!company) {
      company = await Company.create({
        companyName: 'Your Company Name',
        address: {},
        contact: {},
        bankDetails: {}
      });
    }
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company settings',
      error: error.message
    });
  }
};

// Update company settings
export const updateCompanySettings = async (req, res) => {
  try {
    let company = await Company.findOne();
    
    if (!company) {
      // Create if doesn't exist
      company = await Company.create(req.body);
    } else {
      // Update existing
      company = await Company.findByIdAndUpdate(
        company._id,
        req.body,
        { new: true, runValidators: true }
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Company settings updated successfully',
      data: company
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update company settings',
      error: error.message
    });
  }
};
