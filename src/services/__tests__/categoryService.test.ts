/**
 * 分类服务单元测试
 * @jest-environment node
 */

import { CategoryService } from '../categoryService'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  },
}))

describe('CategoryService', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCategory', () => {
    const mockCategoryData = {
      name: 'Test Category',
      description: 'Test description',
    }

    const mockCreatedCategory = {
      id: '1',
      name: mockCategoryData.name,
      description: mockCategoryData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该正确创建分类', async () => {
      mockPrisma.category.create.mockResolvedValue(mockCreatedCategory)

      const result = await CategoryService.createCategory(mockCategoryData)

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: mockCategoryData,
      })
      expect(result).toEqual(mockCreatedCategory)
    })

    it('应该创建没有描述的分类', async () => {
      const categoryDataWithoutDesc = {
        name: mockCategoryData.name,
      }

      const categoryWithoutDesc = {
        ...mockCreatedCategory,
        description: null,
      }

      mockPrisma.category.create.mockResolvedValue(categoryWithoutDesc)

      const result = await CategoryService.createCategory(categoryDataWithoutDesc)

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: categoryDataWithoutDesc,
      })
      expect(result).toEqual(categoryWithoutDesc)
    })

    it('应该处理创建错误', async () => {
      mockPrisma.category.create.mockRejectedValue(new Error('Database error'))

      await expect(CategoryService.createCategory(mockCategoryData)).rejects.toThrow('Database error')
    })
  })

  describe('updateCategory', () => {
    const mockUpdateData = {
      name: 'Updated Category',
      description: 'Updated description',
    }

    const mockUpdatedCategory = {
      id: '1',
      name: mockUpdateData.name,
      description: mockUpdateData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该正确更新分类', async () => {
      mockPrisma.category.update.mockResolvedValue(mockUpdatedCategory)

      const result = await CategoryService.updateCategory('1', mockUpdateData)

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: mockUpdateData,
      })
      expect(result).toEqual(mockUpdatedCategory)
    })

    it('应该处理更新错误', async () => {
      mockPrisma.category.update.mockRejectedValue(new Error('Update failed'))

      await expect(CategoryService.updateCategory('1', mockUpdateData)).rejects.toThrow('Update failed')
    })
  })

  describe('deleteCategory', () => {
    const mockCategory = {
      id: '1',
      name: 'Test Category',
      description: 'Test description',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该正确删除分类', async () => {
      mockPrisma.category.delete.mockResolvedValue(mockCategory)

      const result = await CategoryService.deleteCategory('1')

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
      expect(result).toEqual(mockCategory)
    })

    it('应该处理删除错误', async () => {
      mockPrisma.category.delete.mockRejectedValue(new Error('Delete failed'))

      await expect(CategoryService.deleteCategory('1')).rejects.toThrow('Delete failed')
    })
  })

  describe('getCategories', () => {
    const mockCategories = [
      {
        id: '1',
        name: 'Category 1',
        description: 'Description 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          articles: 5,
        },
      },
      {
        id: '2',
        name: 'Category 2',
        description: 'Description 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          articles: 3,
        },
      },
    ]

    it('应该获取分类列表和总数', async () => {
      mockPrisma.category.findMany.mockResolvedValue(mockCategories)
      mockPrisma.category.count.mockResolvedValue(2)

      const result = await CategoryService.getCategories()

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: undefined,
        skip: 0,
        take: 10,
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
      })
      expect(mockPrisma.category.count).toHaveBeenCalledWith({ where: undefined })
      expect(result).toEqual({
        categories: mockCategories.map(category => ({
          ...category,
          articleCount: category._count.articles,
        })),
        total: 2,
      })
    })

    it('应该使用搜索参数过滤分类', async () => {
      const queryParams = {
        searchQuery: 'test',
        page: 2,
        limit: 5,
      }

      mockPrisma.category.findMany.mockResolvedValue(mockCategories)
      mockPrisma.category.count.mockResolvedValue(2)

      await CategoryService.getCategories(queryParams)

      const expectedWhere = {
        OR: [
          { name: { contains: 'test' } },
          { description: { contains: 'test' } },
        ],
      }

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: 5,
        take: 5,
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
      })
      expect(mockPrisma.category.count).toHaveBeenCalledWith({
        where: expectedWhere,
      })
    })
  })

  describe('getCategory', () => {
    const mockCategory = {
      id: '1',
      name: 'Test Category',
      description: 'Test description',
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: {
        articles: 5,
      },
    }

    it('应该通过ID获取分类', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)

      const result = await CategoryService.getCategory('1')

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
      })
      expect(result).toEqual(mockCategory)
    })

    it('当分类不存在时应该返回null', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null)

      const result = await CategoryService.getCategory('999')

      expect(result).toBeNull()
    })
  })

  describe('getCategoryByName', () => {
    const mockCategory = {
      id: '1',
      name: 'Test Category',
      description: 'Test description',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('应该通过名称获取分类', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory)

      const result = await CategoryService.getCategoryByName('Test Category')

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: 'Test Category' },
      })
      expect(result).toEqual(mockCategory)
    })

    it('当分类不存在时应该返回null', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null)

      const result = await CategoryService.getCategoryByName('Nonexistent Category')

      expect(result).toBeNull()
    })
  })

  describe('getPopularCategories', () => {
    const mockCategories = [
      {
        id: '1',
        name: 'Popular Category 1',
        description: 'Description 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          articles: 10,
        },
      },
      {
        id: '2',
        name: 'Popular Category 2',
        description: 'Description 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          articles: 8,
        },
      },
    ]

    it('应该获取热门分类列表', async () => {
      mockPrisma.category.findMany.mockResolvedValue(mockCategories)

      const result = await CategoryService.getPopularCategories(5)

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
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
        mockCategories.map(category => ({
          category,
          articleCount: category._count.articles,
        }))
      )
    })

    it('应该使用默认限制获取热门分类', async () => {
      mockPrisma.category.findMany.mockResolvedValue(mockCategories)

      await CategoryService.getPopularCategories()

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
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