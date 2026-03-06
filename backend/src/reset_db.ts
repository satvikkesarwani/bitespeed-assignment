import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting database...');

    const deleteCount = await prisma.contact.deleteMany();

    console.log(`Database reset complete. Deleted ${deleteCount.count} records.`);
}

main()
    .catch((e) => {
        console.error('Reset failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
