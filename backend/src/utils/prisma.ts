// backend/src/utils/prisma.ts

import { PrismaClient } from '../generated/client';

// 2. ป้องกันการสร้าง Client ใหม่ทุกครั้งที่ code reload ในโหมด development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // (Optional) Uncomment บรรทัดนี้ถ้าอยากเห็น Query ใน console
    // log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;