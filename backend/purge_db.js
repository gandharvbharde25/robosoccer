const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- NUCLEAR RESET STARTED ---');
  try {
    const mCount = await prisma.match.deleteMany();
    console.log(`Deleted ${mCount.count} matches.`);
    
    const tCount = await prisma.team.deleteMany();
    console.log(`Deleted ${tCount.count} teams.`);

    // Reset settings if any
    if (prisma.settings) {
       await prisma.settings.deleteMany().catch(() => {});
       console.log('Cleared settings.');
    }

    console.log('--- RESET COMPLETE ---');
  } catch (err) {
    console.error('Reset failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
