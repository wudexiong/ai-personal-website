import { PrismaClient } from '@prisma/client';

/**
 * 全局Prisma实例
 * @description 用于数据库操作的全局Prisma客户端实例
 * @example
 * ```ts
 * import { prisma } from '@/lib/prisma';
 * 
 * // 查询用户
 * const user = await prisma.user.findUnique({
 *   where: { id: 'user_id' }
 * });
 * ```
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 