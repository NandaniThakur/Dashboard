import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/user/userModel.js';

dotenv.config();

async function createFirstAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const adminEmail = 'admin@example.com';
        
        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('❌ Admin already exists:', adminEmail);
            await mongoose.connection.close();
            return;
        }
        
        // Create first admin
        const admin = await User.create({
            firstName: 'Super',
            lastName: 'Admin',
            email: adminEmail,
            password: 'admin123', // Will be hashed automatically
            role: 'admin-sup'
        });
        
        console.log('✅ First admin created successfully!');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password: admin123');
        console.log('👤 Role:', admin.role);
        console.log('\n⚠️  Please change the password after first login!');
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createFirstAdmin();
