/**
 * 文章服务单元测试
 * @jest-environment node
 */

import { ArticleService } from '../articleService'
import { prisma } from '@/lib/prisma'
import type { Article } from '@prisma/client'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    tagsOnArticles: {
      deleteMany: jest.fn(),
    },
  },
}))

describe('ArticleService', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createArticle', () => {
    const mockArticleData = {
      title: 'Test Article',
      content: 'Test content',
      authorId: '1',
      categoryId: '1',
      tagIds: ['1', '2'],
      published: true,
      excerpt: 'Test excerpt',
      coverImage: 'test.jpg',
      slug: 'test-article',
    }

    const mockCreatedArticle = {
      id: '1',
      title: mockArticleData.title,
      content: mockArticleData.content,
      authorId: mockArticleData.authorId,
      categoryId: mockArticleData.categoryId,
      published: mockArticleData.published,
      excerpt: mockArticleData.excerpt,
      coverImage: mockArticleData.coverImage,
      slug: mockArticleData.slug,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: '1', name: 'Test Author' },
      category: { id: '1', name: 'Test Category' },
      tags: [
        { tagId: '1', articleId: '1', tag: { id: '1', name: 'Tag 1' } },
        { tagId: '2', articleId: '1', tag: { id: '2', name: 'Tag 2' } },
      ],
    }

    it('应该正确创建文章', async () => {
      mockPrisma.article.create.mockResolvedValue(mockCreatedArticle)

      const result = await ArticleService.createArticle(mockArticleData)

      expect(mockPrisma.article.create).toHaveBeenCalledWith({
        data: {
          title: mockArticleData.title,
          content: mockArticleData.content,
          authorId: mockArticleData.authorId,
          categoryId: mockArticleData.categoryId,
          published: mockArticleData.published,
          excerpt: mockArticleData.excerpt,
          coverImage: mockArticleData.coverImage,
          slug: mockArticleData.slug,
          tags: {
            create: mockArticleData.tagIds.map(tagId => ({
              tag: {
                connect: { id: tagId },
              },
            })),
          },
        },
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })
      expect(result).toEqual(mockCreatedArticle)
    })

    it('应该创建没有标签的文章', async () => {
      const articleDataWithoutTags = {
        ...mockArticleData,
        tagIds: undefined,
      }

      const articleWithoutTags = {
        ...mockCreatedArticle,
        tags: [],
      }

      mockPrisma.article.create.mockResolvedValue(articleWithoutTags)

      const result = await ArticleService.createArticle(articleDataWithoutTags)

      expect(mockPrisma.article.create).toHaveBeenCalledWith({
        data: {
          title: articleDataWithoutTags.title,
          content: articleDataWithoutTags.content,
          authorId: articleDataWithoutTags.authorId,
          categoryId: articleDataWithoutTags.categoryId,
          published: articleDataWithoutTags.published,
          excerpt: articleDataWithoutTags.excerpt,
          coverImage: articleDataWithoutTags.coverImage,
          slug: articleDataWithoutTags.slug,
          tags: undefined,
        },
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })
      expect(result).toEqual(articleWithoutTags)
    })
  })

  describe('updateArticle', () => {
    const mockUpdateData = {
      title: 'Updated Article',
      content: 'Updated content',
      tagIds: ['3', '4'],
    }

    const mockUpdatedArticle = {
      id: '1',
      title: mockUpdateData.title,
      content: mockUpdateData.content,
      authorId: '1',
      categoryId: '1',
      published: true,
      excerpt: 'Test excerpt',
      coverImage: 'test.jpg',
      slug: 'test-article',
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: '1', name: 'Test Author' },
      category: { id: '1', name: 'Test Category' },
      tags: [
        { tagId: '3', articleId: '1', tag: { id: '3', name: 'Tag 3' } },
        { tagId: '4', articleId: '1', tag: { id: '4', name: 'Tag 4' } },
      ],
    }

    it('应该正确更新文章', async () => {
      mockPrisma.tagsOnArticles.deleteMany.mockResolvedValue({ count: 2 })
      mockPrisma.article.update.mockResolvedValue(mockUpdatedArticle)

      const result = await ArticleService.updateArticle('1', mockUpdateData)

      expect(mockPrisma.tagsOnArticles.deleteMany).toHaveBeenCalledWith({
        where: { articleId: '1' },
      })
      expect(mockPrisma.article.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          title: mockUpdateData.title,
          content: mockUpdateData.content,
          tags: {
            create: mockUpdateData.tagIds.map(tagId => ({
              tag: {
                connect: { id: tagId },
              },
            })),
          },
        },
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })
      expect(result).toEqual(mockUpdatedArticle)
    })

    it('应该更新文章而不修改标签', async () => {
      const updateDataWithoutTags = {
        title: 'Updated Article',
        content: 'Updated content',
      }

      mockPrisma.article.update.mockResolvedValue({
        ...mockUpdatedArticle,
        title: updateDataWithoutTags.title,
        content: updateDataWithoutTags.content,
      })

      await ArticleService.updateArticle('1', updateDataWithoutTags)

      expect(mockPrisma.tagsOnArticles.deleteMany).not.toHaveBeenCalled()
      expect(mockPrisma.article.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateDataWithoutTags,
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })
    })
  })

  describe('deleteArticle', () => {
    const mockArticle = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      authorId: '1',
      categoryId: '1',
      published: true,
      excerpt: 'Test excerpt',
      coverImage: 'test.jpg',
      slug: 'test-article',
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: '1', name: 'Test Author' },
      category: { id: '1', name: 'Test Category' },
      tags: [],
    }

    it('应该正确删除文章', async () => {
      mockPrisma.article.delete.mockResolvedValue(mockArticle)

      const result = await ArticleService.deleteArticle('1')

      expect(mockPrisma.article.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })
      expect(result).toEqual(mockArticle)
    })
  })

  describe('getArticles', () => {
    const mockArticles = [
      {
        id: '1',
        title: 'Article 1',
        content: 'Content 1',
        authorId: '1',
        categoryId: '1',
        published: true,
        excerpt: 'Excerpt 1',
        coverImage: 'image1.jpg',
        slug: 'article-1',
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: '1', name: 'Author 1' },
        category: { id: '1', name: 'Category 1' },
        tags: [],
      },
      {
        id: '2',
        title: 'Article 2',
        content: 'Content 2',
        authorId: '1',
        categoryId: '1',
        published: true,
        excerpt: 'Excerpt 2',
        coverImage: 'image2.jpg',
        slug: 'article-2',
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { id: '1', name: 'Author 1' },
        category: { id: '1', name: 'Category 1' },
        tags: [],
      },
    ]

    it('应该获取文章列表和总数', async () => {
      mockPrisma.article.findMany.mockResolvedValue(mockArticles)
      mockPrisma.article.count.mockResolvedValue(2)

      const result = await ArticleService.getArticles({})

      expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      expect(mockPrisma.article.count).toHaveBeenCalledWith({ where: {} })
      expect(result).toEqual({
        articles: mockArticles,
        total: 2,
      })
    })

    it('应该使用查询参数过滤文章', async () => {
      const queryParams = {
        categoryId: '1',
        tagId: '1',
        authorId: '1',
        published: true,
        searchQuery: 'test',
        page: 2,
        limit: 5,
      }

      mockPrisma.article.findMany.mockResolvedValue(mockArticles)
      mockPrisma.article.count.mockResolvedValue(2)

      await ArticleService.getArticles(queryParams)

      const expectedWhere = {
        categoryId: '1',
        authorId: '1',
        published: true,
        tags: {
          some: {
            tagId: '1',
          },
        },
        OR: [
          { title: { contains: 'test' } },
          { content: { contains: 'test' } },
        ],
      }

      expect(mockPrisma.article.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: 5,
        take: 5,
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      expect(mockPrisma.article.count).toHaveBeenCalledWith({
        where: expectedWhere,
      })
    })
  })

  describe('getArticle', () => {
    const mockArticle = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      authorId: '1',
      categoryId: '1',
      published: true,
      excerpt: 'Test excerpt',
      coverImage: 'test.jpg',
      slug: 'test-article',
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: '1', name: 'Test Author' },
      category: { id: '1', name: 'Test Category' },
      tags: [],
    }

    it('应该通过ID获取文章', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(mockArticle)

      const result = await ArticleService.getArticle({ id: '1' })

      expect(mockPrisma.article.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })
      expect(result).toEqual(mockArticle)
    })

    it('应该通过slug获取文章', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(mockArticle)

      const result = await ArticleService.getArticle({ slug: 'test-article' })

      expect(mockPrisma.article.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-article' },
        include: {
          author: true,
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })
      expect(result).toEqual(mockArticle)
    })

    it('当没有提供id或slug时应该抛出错误', async () => {
      await expect(ArticleService.getArticle({})).rejects.toThrow('必须提供id或slug')
    })

    it('当文章不存在时应该返回null', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null)

      const result = await ArticleService.getArticle({ id: '999' })

      expect(result).toBeNull()
    })
  })

  describe('incrementViewCount', () => {
    const mockArticle = {
      id: '1',
      title: 'Test Article',
      content: 'Test content',
      authorId: '1',
      categoryId: '1',
      published: true,
      excerpt: 'Test excerpt',
      coverImage: 'test.jpg',
      slug: 'test-article',
      viewCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该增加文章浏览次数', async () => {
      mockPrisma.article.update.mockResolvedValue(mockArticle)

      const result = await ArticleService.incrementViewCount('1')

      expect(mockPrisma.article.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })
      expect(result).toEqual(mockArticle)
    })
  })
}) 