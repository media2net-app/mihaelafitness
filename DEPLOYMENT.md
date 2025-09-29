# Mihaela Fitness - Deployment Guide

## 🚀 Deployment Opties

### 1. Vercel (Aanbevolen)

**Stappen:**
1. Ga naar [vercel.com](https://vercel.com)
2. Maak een account aan of log in
3. Klik op "New Project"
4. Importeer je GitHub repository
5. Vercel detecteert automatisch dat het een Next.js project is
6. Voeg environment variables toe (zie hieronder)
7. Klik op "Deploy"

**Environment Variables voor Vercel:**
```
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza183UkxGelFDMmU0bEIwdXVBZ0l6UlYiLCJhcGlfa2V5IjoiMDFLNjhZNTUzU0RaNUtNMkZEWTQzRkRLTTAiLCJ0ZW5hbnRfaWQiOiIyYzAxN2NiZWFmY2ZlOWUwNjViYzFjNDIyNGY2OGYxNTRjMDEyZmQxYWYzYThjZDNkMzcwNzc3ZDUzMTc4Y2FjIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzBmNTc4YWMtODlhMy00MGUyLWJkMmQtZTRlMzExZDhmZjg4In0.CGXndBzIhhtw4jIGEGXEdrYI_DYOQ7mAEo3_J84GkM4
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_BDEIjRMqxsTZRKa8_24ZkD97dbXRvynyDlTAFkRHmagcicX
JWT_SECRET=mihaela_fitness_super_secret_jwt_key_2024_production
NEXTAUTH_SECRET=mihaela_fitness_nextauth_secret_2024_production
NODE_ENV=production
```

**Voordelen:**
- Automatische deployments
- Optimale Next.js ondersteuning
- Gratis tier
- Custom domain ondersteuning
- Prisma Accelerate geïntegreerd

### 2. Netlify

**Stappen:**
1. Ga naar [netlify.com](https://netlify.com)
2. Maak een account aan of log in
3. Klik op "New site from Git"
4. Kies je repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Klik op "Deploy site"

### 3. Manual Deployment

**Voor productie server:**
```bash
# Build de applicatie
npm run build

# Start de productie server
npm start
```

**Environment variabelen:**
- `NODE_ENV=production`
- `PORT=3000` (of gewenste poort)

## 📁 Build Output

De build genereert:
- `.next/` - Optimized production build
- Static assets
- Server-side rendering files

## 🔧 Pre-deployment Checklist

- [x] Build succesvol voltooid
- [x] Alle TypeScript errors opgelost
- [x] ESLint warnings geminimaliseerd
- [x] Production build getest
- [x] Deployment configuratie bestanden toegevoegd

## 🌐 Domain Setup

Na deployment kun je:
1. Een custom domain toevoegen
2. SSL certificaat configureren
3. CDN instellingen aanpassen

## 📊 Performance

De applicatie is geoptimaliseerd voor:
- Fast loading times
- SEO vriendelijk
- Mobile responsive
- Progressive Web App features
