import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Initialize Prisma Client with proper singleton pattern for Vercel
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

// Store singleton in global to prevent multiple instances (in all environments)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}