/**
 * Upload profile image and assign to admin accounts (Chiel + Miki/Mihaela).
 * Run: node scripts/set-admin-profile-pictures.js [path-to-image]
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

const ADMIN_EMAILS = ['chiel@media2net.nl', 'info@mihaelafitness.com'];

const DEFAULT_IMAGE = path.join(
  process.env.HOME,
  '.cursor/projects/Users-gebruiker-Desktop-MIHAELAFITNESS/assets/557369736_122106864519009401_8914734593798868220_n-91bb2e40-18c2-476c-b7bb-60babcef06b2.png',
);

async function main() {
  const imagePath = path.resolve(process.argv[2] || DEFAULT_IMAGE);
  if (!fs.existsSync(imagePath)) {
    console.error('Image not found:', imagePath);
    process.exit(1);
  }

  const buffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).slice(1) || 'png';
  const filename = `profile-pictures/admin-shared_${Date.now()}.${ext}`;

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png',
  });

  console.log('Uploaded:', blob.url);

  for (const email of ADMIN_EMAILS) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn('User not found, skipping:', email);
      continue;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { profilePicture: blob.url },
      select: { id: true, name: true, email: true, profilePicture: true },
    });

    console.log(`\nUpdated ${updated.name} (${updated.email})`);
    console.log('  URL:', updated.profilePicture);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
