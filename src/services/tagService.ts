import { prisma } from '@/lib/prisma';
import type { Tag } from '@prisma/client';

/**
 * 标签服务类
 * @description 提供标签相关的数据库操作方法
 */
export class TagService {
  /**
   * 创建新标签
   * @param data - 标签数据
   * @returns 创建的标签对象
   */
  static async createTag(data: {
    name: string;
  }): Promise<Tag> {
    return prisma.tag.create({
      data
    });
  }

  /**
   * 更新标签
   * @param id - 标签ID
   * @param data - 更新的数据
   * @returns 更新后的标签对象
   */
  static async updateTag(
    id: string,
    data: Partial<Omit<Tag, 'id'>>
  ): Promise<Tag> {
    return prisma.tag.update({
      where: { id },
      data
    });
  }

  /**
   * 删除标签
   * @param id - 标签ID
   * @returns 删除的标签对象
   */
  static async deleteTag(id: string): Promise<Tag> {
    return prisma.tag.delete({
      where: { id }
    });
  }

  /**
   * 获取标签列表
   * @param params - 查询参数
   * @returns 标签列表和总数
   */
  static async getTags(params?: {
    page?: number;
    limit?: number;
    searchQuery?: string;
  }): Promise<{
    tags: Tag[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 10,
      searchQuery
    } = params || {};

    const where = searchQuery ? {
      name: {
        contains: searchQuery
      }
    } : undefined;

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.tag.count({ where })
    ]);

    return {
      tags,
      total
    };
  }

  /**
   * 获取单个标签
   * @param id - 标签ID
   * @returns 标签对象
   */
  static async getTag(id: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { id }
    });
  }

  /**
   * 根据名称获取标签
   * @param name - 标签名称
   * @returns 标签对象
   */
  static async getTagByName(name: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { name }
    });
  }

  /**
   * 获取文章的所有标签
   * @param articleId - 文章ID
   * @returns 标签列表
   */
  static async getArticleTags(articleId: string): Promise<Tag[]> {
    const result = await prisma.tagsOnArticles.findMany({
      where: { articleId },
      include: {
        tag: true
      }
    });

    return result.map(item => item.tag);
  }

  /**
   * 获取热门标签
   * @param limit - 限制数量
   * @returns 标签列表和文章数量
   */
  static async getPopularTags(limit = 10): Promise<Array<{
    tag: Tag;
    articleCount: number;
  }>> {
    const tags = await prisma.tag.findMany({
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

    return tags.map(tag => ({
      tag,
      articleCount: tag._count.articles
    }));
  }
} 