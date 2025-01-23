import { prisma } from '@/lib/prisma';
import type { User, Profile } from '@prisma/client';
import { hash } from 'bcryptjs';

/**
 * 用户服务
 * @description 提供用户相关的数据库操作方法
 */
export class UserService {
  /**
   * 创建新用户
   * @param data - 用户数据
   * @returns 创建的用户对象
   */
  static async createUser(data: {
    email: string;
    password: string;
    name?: string;
    profile?: Omit<Profile, 'id' | 'userId'>;
  }): Promise<User> {
    const hashedPassword = await hash(data.password, 12);
    
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        profile: data.profile ? {
          create: data.profile
        } : undefined
      },
      include: {
        profile: true
      }
    });
  }

  /**
   * 根据ID查找用户
   * @param id - 用户ID
   * @returns 用户对象
   */
  static async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true
      }
    });
  }

  /**
   * 根据邮箱查找用户
   * @param email - 用户邮箱
   * @returns 用户对象
   */
  static async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        profile: true
      }
    });
  }

  /**
   * 更新用户信息
   * @param id - 用户ID
   * @param data - 更新的数据
   * @returns 更新后的用户对象
   */
  static async updateUser(
    id: string,
    data: Partial<Omit<User, 'id' | 'email'>> & {
      profile?: Partial<Omit<Profile, 'id' | 'userId'>>;
    }
  ): Promise<User> {
    const { profile, ...userData } = data;
    
    return prisma.user.update({
      where: { id },
      data: {
        ...userData,
        profile: profile ? {
          upsert: {
            create: profile,
            update: profile
          }
        } : undefined
      },
      include: {
        profile: true
      }
    });
  }

  /**
   * 删除用户
   * @param id - 用户ID
   * @returns 删除的用户对象
   */
  static async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
      include: {
        profile: true
      }
    });
  }

  /**
   * 获取用户列表
   * @param page - 页码
   * @param limit - 每页数量
   * @returns 用户列表和总数
   */
  static async getUsers(page = 1, limit = 10): Promise<{
    users: User[];
    total: number;
  }> {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          profile: true
        }
      }),
      prisma.user.count()
    ]);

    return {
      users,
      total
    };
  }
} 