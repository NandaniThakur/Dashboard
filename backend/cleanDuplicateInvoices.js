import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: String,
    client: mongoose.Schema.Types.ObjectId,
    createdAt: Date
}, { collection: 'Invoices' });

const Invoice = mongoose.model('Invoice', invoiceSchema);

const cleanDuplicates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all invoices grouped by invoice number
        const duplicates = await Invoice.aggregate([
            {
                $group: {
                    _id: '$invoiceNumber',
                    count: { $sum: 1 },
                    ids: { $push: '$_id' },
                    dates: { $push: '$createdAt' }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        if (duplicates.length === 0) {
            console.log('No duplicate invoices found!');
            await mongoose.connection.close();
            return;
        }

        console.log(`Found ${duplicates.length} duplicate invoice numbers:`);
        
        for (const dup of duplicates) {
            console.log(`\nInvoice Number: ${dup._id}`);
            console.log(`Count: ${dup.count}`);
            console.log(`IDs: ${dup.ids.join(', ')}`);
            
            // Keep the oldest invoice, delete the rest
            const sortedIds = dup.ids.map((id, index) => ({
                id,
                date: dup.dates[index]
            })).sort((a, b) => a.date - b.date);
            
            const toKeep = sortedIds[0].id;
            const toDelete = sortedIds.slice(1).map(item => item.id);
            
            console.log(`Keeping: ${toKeep}`);
            console.log(`Deleting: ${toDelete.join(', ')}`);
            
            const result = await Invoice.deleteMany({ _id: { $in: toDelete } });
            console.log(`Deleted ${result.deletedCount} duplicate invoices`);
        }

        console.log('\n✅ Cleanup complete!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

cleanDuplicates();
