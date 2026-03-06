const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const res = await prisma.contact.count();
    console.log("Contact count:", res);
  } catch (e) {
    console.error("DB Error:", e);
  }
}
run();
