/**
 * 标签服务单元测试
 * @jest-environment node
 */

import { TagService } from '../tagService'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tag: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    tagsOnArticles: {
      findMany: jest.fn(),
    },
  },
}))

describe('TagService', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createTag', () => {
    const mockTagData = {
      name: 'Test Tag',
    }

    const mockCreatedTag = {
      id: '1',
      name: mockTagData.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该正确创建标签', async () => {
      mockPrisma.tag.create.mockResolvedValue(mockCreatedTag)

      const result = await TagService.createTag(mockTagData)

      expect(mockPrisma.tag.create).toHaveBeenCalledWith({
        data: mockTagData,
      })
      expect(result).toEqual(mockCreatedTag)
    })

    it('应该处理创建错误', async () => {
      mockPrisma.tag.create.mockRejectedValue(new Error('Database error'))

      await expect(TagService.createTag(mockTagData)).rejects.toThrow('Database error')
    })
  })

  describe('updateTag', () => {
    const mockUpdateData = {
      name: 'Updated Tag',
    }

    const mockUpdatedTag = {
      id: '1',
      name: mockUpdateData.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该正确更新标签', async () => {
      mockPrisma.tag.update.mockResolvedValue(mockUpdatedTag)

      const result = await TagService.updateTag('1', mockUpdateData)

      expect(mockPrisma.tag.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: mockUpdateData,
      })
      expect(result).toEqual(mockUpdatedTag)
    })

    it('应该处理更新错误', async () => {
      mockPrisma.tag.update.mockRejectedValue(new Error('Update failed'))

      await expect(TagService.updateTag('1', mockUpdateData)).rejects.toThrow('Update failed')
    })
  })

  describe('deleteTag', () => {
    const mockTag = {
      id: '1',
      name: 'Test Tag',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该正确删除标签', async () => {
      mockPrisma.tag.delete.mockResolvedValue(mockTag)

      const result = await TagService.deleteTag('1')

      expect(mockPrisma.tag.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(mockTag)
    })

    it('应该处理删除错误', async () => {
      mockPrisma.tag.delete.mockRejectedValue(new Error('Delete failed'))

      await expect(TagService.deleteTag('1')).rejects.toThrow('Delete failed')
    })
  })

  describe('getTags', () => {
    const mockTags = [
      {
        id: '1',
        name: 'Tag 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Tag 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    it('应该获取标签列表和总数', async () => {
      mockPrisma.tag.findMany.mockResolvedValue(mockTags)
      mockPrisma.tag.count.mockResolvedValue(2)

      const result = await TagService.getTags()

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        where: undefined,
        skip: 0,
        take: 10,
        orderBy: {
          name: 'asc',
        },
      })
      expect(mockPrisma.tag.count).toHaveBeenCalledWith({ where: undefined })
      expect(result).toEqual({
        tags: mockTags,
        total: 2,
      })
    })

    it('应该使用搜索参数过滤标签', async () => {
      const queryParams = {
        searchQuery: 'test',
        page: 2,
        limit: 5,
      }

      mockPrisma.tag.findMany.mockResolvedValue(mockTags)
      mockPrisma.tag.count.mockResolvedValue(2)

      await TagService.getTags(queryParams)

      const expectedWhere = {
        name: {
          contains: 'test',
        },
      }

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: 5,
        take: 5,
        orderBy: {
          name: 'asc',
        },
      })
      expect(mockPrisma.tag.count).toHaveBeenCalledWith({
        where: expectedWhere,
      })
    })
  })

  describe('getTag', () => {
    const mockTag = {
      id: '1',
      name: 'Test Tag',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该通过ID获取标签', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(mockTag)

      const result = await TagService.getTag('1')

      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(mockTag)
    })

    it('当标签不存在时应该返回null', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(null)

      const result = await TagService.getTag('999')

      expect(result).toBeNull()
    })
  })

  describe('getTagByName', () => {
    const mockTag = {
      id: '1',
      name: 'Test Tag',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该通过名称获取标签', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(mockTag)

      const result = await TagService.getTagByName('Test Tag')

      expect(mockPrisma.tag.findUnique).toHaveBeenCalledWith({
        where: { name: 'Test Tag' },
      })
      expect(result).toEqual(mockTag)
    })

    it('当标签不存在时应该返回null', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(null)

      const result = await TagService.getTagByName('Nonexistent Tag')

      expect(result).toBeNull()
    })
  })

  describe('getArticleTags', () => {
    const mockTagsOnArticles = [
      {
        articleId: '1',
        tagId: '1',
        tag: {
          id: '1',
          name: 'Tag 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        articleId: '1',
        tagId: '2',
        tag: {
          id: '2',
          name: 'Tag 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ]

    it('应该获取文章的所有标签', async () => {
      mockPrisma.tagsOnArticles.findMany.mockResolvedValue(mockTagsOnArticles)

      const result = await TagService.getArticleTags('1')

      expect(mockPrisma.tagsOnArticles.findMany).toHaveBeenCalledWith({
        where: { articleId: '1' },
        include: {
          tag: true,
        },
      })
      expect(result).toEqual(mockTagsOnArticles.map(item => item.tag))
    })

    it('当文章没有标签时应该返回空数组', async () => {
      mockPrisma.tagsOnArticles.findMany.mockResolvedValue([])

      const result = await TagService.getArticleTags('1')

      expect(result).toEqual([])
    })
  })

  describe('getPopularTags', () => {
    const mockTags = [
      {
        id: '1',
        name: 'Popular Tag 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          articles: 10,
        },
      },
      {
        id: '2',
        name: 'Popular Tag 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          articles: 8,
        },
      },
    ]

    it('应该获取热门标签列表', async () => {
      mockPrisma.tag.findMany.mockResolvedValue(mockTags)

      const result = await TagService.getPopularTags(5)

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
        orderBy: {
          articles: {
            _count: 'desc',
          },
        },
        take: 5,
      })
      expect(result).toEqual(
        mockTags.map(tag => ({
          tag,
          articleCount: tag._count.articles,
        }))
      )
    })

    it('应该使用默认限制获取热门标签', async () => {
      mockPrisma.tag.findMany.mockResolvedValue(mockTags)

      await TagService.getPopularTags()

      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
        orderBy: {
          articles: {
            _count: 'desc',
          },
        },
        take: 10,
      })
    })
  })
}) 