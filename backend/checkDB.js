import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/user/userModel.js';

dotenv.config();

async function checkDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Get database name
        const dbName = mongoose.connection.db.databaseName;
        console.log('\n📊 Database Name:', dbName);
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📁 Collections:');
        collections.forEach(col => console.log(`  - ${col.name}`));
        
        // Count users
        const userCount = await User.countDocuments();
        console.log(`\n👥 Total Users: ${userCount}`);
        
        // List all users
        if (userCount > 0) {
            const users = await User.find().select('-password');
            console.log('\n👤 Users in database:');
            users.forEach((user, index) => {
                console.log(`\n  ${index + 1}. ${user.firstName} ${user.lastName}`);
                console.log(`     Email: ${user.email}`);
                console.log(`     Role: ${user.role}`);
                console.log(`     ID: ${user._id}`);
                console.log(`     Created: ${user.createdAt}`);
            });
        }
        
        await mongoose.connection.close();
        console.log('\n✅ Connection closed');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkDatabase();
