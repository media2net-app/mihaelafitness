/**
 * Upload profile image and assign to demo-online@mihaelafitness.com
 * Run: node scripts/set-demo-profile-picture.js [path-to-image]
 */
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

if (process.env.DOTENV_CONFIG_PATH) {
  require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH, override: true });
} else {
  require('dotenv').config();
  require('dotenv').config({ path: '.env.local' });
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAIL = 'demo-online@mihaelafitness.com';
const DEFAULT_IMAGE =
  process.env.HOME +
  '/.cursor/projects/Users-gebruiker-Desktop-MIHAELAFITNESS/assets/557369736_122106864519009401_8914734593798868220_n-f709153b-b1cd-4daf-b68a-dfd96d4dbe03.png';

async function main() {
  const imagePath = path.resolve(process.argv[2] || DEFAULT_IMAGE);
  if (!fs.existsSync(imagePath)) {
    console.error('Image not found:', imagePath);
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) {
    console.error('User not found:', EMAIL);
    process.exit(1);
  }

  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).slice(1) || 'png';
  const filename = `profile-pictures/${user.id}_${Date.now()}.${ext}`;

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png',
  });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { profilePicture: blob.url },
    select: { id: true, name: true, email: true, profilePicture: true },
  });

  console.log('\nProfile picture updated for demo client:\n');
  console.log('  Email:  ', updated.email);
  console.log('  Name:   ', updated.name);
  console.log('  URL:    ', updated.profilePicture);
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
