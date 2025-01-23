import { prisma } from '@/lib/prisma';
import type { Category } from '@prisma/client';

/**
 * 分类服务类
 * @description 提供分类相关的数据库操作方法
 */
export class CategoryService {
  /**
   * 创建新分类
   * @param data - 分类数据
   * @returns 创建的分类对象
   */
  static async createCategory(data: {
    name: string;
    description?: string;
  }): Promise<Category> {
    return prisma.category.create({
      data
    });
  }

  /**
   * 更新分类
   * @param id - 分类ID
   * @param data - 更新的数据
   * @returns 更新后的分类对象
   */
  static async updateCategory(
    id: string,
    data: Partial<Omit<Category, 'id'>>
  ): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data
    });
  }

  /**
   * 删除分类
   * @param id - 分类ID
   * @returns 删除的分类对象
   */
  static async deleteCategory(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id }
    });
  }

  /**
   * 获取分类列表
   * @param params - 查询参数
   * @returns 分类列表和总数
   */
  static async getCategories(params?: {
    page?: number;
    limit?: number;
    searchQuery?: string;
  }): Promise<{
    categories: Category[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 10,
      searchQuery
    } = params || {};

    const where = searchQuery ? {
      OR: [
        { name: { contains: searchQuery } },
        { description: { contains: searchQuery } }
      ]
    } : undefined;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          name: 'asc'
        },
        include: {
          _count: {
            select: {
              articles: true
            }
          }
        }
      }),
      prisma.category.count({ where })
    ]);

    return {
      categories: categories.map(category => ({
        ...category,
        articleCount: category._count.articles
      })),
      total
    };
  }

  /**
   * 获取单个分类
   * @param id - 分类ID
   * @returns 分类对象
   */
  static async getCategory(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });
  }

  /**
   * 根据名称获取分类
   * @param name - 分类名称
   * @returns 分类对象
   */
  static async getCategoryByName(name: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { name }
    });
  }

  /**
   * 获取热门分类
   * @param limit - 限制数量
   * @returns 分类列表和文章数量
   */
  static async getPopularCategories(limit = 10): Promise<Array<{
    category: Category;
    articleCount: number;
  }>> {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: {
        articles: {
          _count: 'desc'
        }
      },
      take: limit
    });

    return categories.map(category => ({
      category,
      articleCount: category._count.articles
    }));
  }
} 