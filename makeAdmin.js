import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function makeAdmin() {
  const email = "bhopalpropertyking@gmail.com";
  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true }
  });
  console.log(`${user.email} is now an admin!`);
  process.exit();
}

makeAdmin();