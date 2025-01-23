import { prisma } from '@/lib/prisma';
import type { Article, Tag, Category } from '@prisma/client';

/**
 * 文章服务类
 * @description 提供文章相关的数据库操作方法
 */
export class ArticleService {
  /**
   * 创建新文章
   * @param data - 文章数据
   * @returns 创建的文章对象
   */
  static async createArticle(data: {
    title: string;
    content: string;
    authorId: string;
    categoryId?: string;
    tagIds?: string[];
    published?: boolean;
    excerpt?: string;
    coverImage?: string;
    slug: string;
  }): Promise<Article> {
    const { tagIds, ...articleData } = data;

    return prisma.article.create({
      data: {
        ...articleData,
        tags: tagIds ? {
          create: tagIds.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        } : undefined
      },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  /**
   * 更新文章
   * @param id - 文章ID
   * @param data - 更新的数据
   * @returns 更新后的文章对象
   */
  static async updateArticle(
    id: string,
    data: Partial<Omit<Article, 'id' | 'authorId'>> & {
      tagIds?: string[];
    }
  ): Promise<Article> {
    const { tagIds, ...articleData } = data;

    if (tagIds) {
      // 先删除所有现有标签关联
      await prisma.tagsOnArticles.deleteMany({
        where: { articleId: id }
      });
    }

    return prisma.article.update({
      where: { id },
      data: {
        ...articleData,
        tags: tagIds ? {
          create: tagIds.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        } : undefined
      },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  /**
   * 删除文章
   * @param id - 文章ID
   * @returns 删除的文章对象
   */
  static async deleteArticle(id: string): Promise<Article> {
    return prisma.article.delete({
      where: { id },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  /**
   * 获取文章列表
   * @param params - 查询参数
   * @returns 文章列表和总数
   */
  static async getArticles(params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    tagId?: string;
    authorId?: string;
    published?: boolean;
    searchQuery?: string;
    tags?: string[];
  }): Promise<{
    articles: Article[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 10,
      categoryId,
      tagId,
      authorId,
      published,
      searchQuery,
      tags
    } = params;

    const where = {
      ...(categoryId && { categoryId }),
      ...(authorId && { authorId }),
      ...(published !== undefined && { published }),
      ...(tagId && {
        tags: {
          some: {
            tagId
          }
        }
      }),
      ...(tags && tags.length > 0 && {
        tags: {
          some: {
            tag: {
              name: {
                in: tags
              }
            }
          }
        }
      }),
      ...(searchQuery && {
        OR: [
          { title: { contains: searchQuery } },
          { content: { contains: searchQuery } }
        ]
      })
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.article.count({ where })
    ]);

    return {
      articles,
      total
    };
  }

  /**
   * 获取单篇文章
   * @param params - 查询参数
   * @returns 文章对象
   */
  static async getArticle(params: {
    id?: string;
    slug?: string;
  }): Promise<Article | null> {
    if (!params.id && !params.slug) {
      throw new Error('必须提供id或slug');
    }

    return prisma.article.findUnique({
      where: {
        ...(params.id ? { id: params.id } : { slug: params.slug })
      },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
  }

  /**
   * 增加文章浏览次数
   * @param id - 文章ID
   * @returns 更新后的文章对象
   */
  static async incrementViewCount(id: string): Promise<Article> {
    return prisma.article.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
  }
} 