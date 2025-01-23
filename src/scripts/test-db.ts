import { prisma } from '../lib/prisma';

async function main() {
  try {
    // 创建测试用户
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'test123', // 注意：实际应用中应该加密密码
        role: 'USER',
      },
    });

    console.log('Created test user:', user);

    // 查询所有用户
    const users = await prisma.user.findMany();
    console.log('All users:', users);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 