import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/user/userModel.js';

dotenv.config();

async function testSignup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Test creating a user WITHOUT specifying a role (should default to 'sup')
        const testUser = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'test123'
            // NOTE: No role field specified
        });
        
        console.log('\n✅ Test user created successfully!');
        console.log('   Name:', testUser.firstName, testUser.lastName);
        console.log('   Email:', testUser.email);
        console.log('   Role:', testUser.role);
        console.log('   Expected: sup');
        console.log('   Result:', testUser.role === 'sup' ? '✅ PASS' : '❌ FAIL');
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
    }
}

testSignup();
