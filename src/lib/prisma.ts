import { PrismaClient } from '@prisma/client'

// Prisma Client singleton for Supabase
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Create Prisma Client optimized for Supabase + Vercel
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  })
}

// Use global singleton pattern to prevent connection exhaustion
export const prisma = global.prisma ?? createPrismaClient()

// Store in global for hot module replacement in development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}