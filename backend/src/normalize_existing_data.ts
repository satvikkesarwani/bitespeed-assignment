import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting data normalization migration...');

    // Fetch all contacts
    const contacts = await prisma.contact.findMany();
    console.log(`Found ${contacts.length} records to process.`);

    let updatedCount = 0;

    for (const contact of contacts) {
        if (contact.phoneNumber) {
            // Strip non-numeric characters
            const normalized = contact.phoneNumber.replace(/\D/g, '');

            if (normalized !== contact.phoneNumber) {
                await prisma.contact.update({
                    where: { id: contact.id },
                    data: { phoneNumber: normalized }
                });
                updatedCount++;
            }
        }
    }

    console.log(`Migration complete. Updated ${updatedCount} records.`);
}

main()
    .catch((e) => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
