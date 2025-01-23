/**
 * 用户服务单元测试
 * @jest-environment node
 */

import { UserService } from '../userService'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import type { User, Profile } from '@prisma/client'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

describe('UserService', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>
  const mockHash = hash as jest.MockedFunction<typeof hash>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createUser', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      profile: {
        bio: 'Test bio',
        location: 'Test location',
      },
    }

    const mockCreatedUser = {
      id: '1',
      email: mockUserData.email,
      name: mockUserData.name,
      password: 'hashedPassword',
      image: null,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: '1',
        userId: '1',
        bio: mockUserData.profile.bio,
        location: mockUserData.profile.location,
        website: null,
        github: null,
        twitter: null,
      },
    }

    it('应该正确创建用户', async () => {
      mockHash.mockResolvedValue('hashedPassword')
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser)

      const result = await UserService.createUser(mockUserData)

      expect(mockHash).toHaveBeenCalledWith(mockUserData.password, 12)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: mockUserData.email,
          password: 'hashedPassword',
          name: mockUserData.name,
          profile: {
            create: mockUserData.profile,
          },
        },
        include: {
          profile: true,
        },
      })
      expect(result).toEqual(mockCreatedUser)
    })

    it('应该创建没有个人资料的用户', async () => {
      const userDataWithoutProfile = {
        email: mockUserData.email,
        password: mockUserData.password,
        name: mockUserData.name,
      }

      mockHash.mockResolvedValue('hashedPassword')
      mockPrisma.user.create.mockResolvedValue({
        ...mockCreatedUser,
        profile: null,
      })

      await UserService.createUser(userDataWithoutProfile)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userDataWithoutProfile.email,
          password: 'hashedPassword',
          name: userDataWithoutProfile.name,
          profile: undefined,
        },
        include: {
          profile: true,
        },
      })
    })

    it('应该处理创建错误', async () => {
      mockHash.mockResolvedValue('hashedPassword')
      mockPrisma.user.create.mockRejectedValue(new Error('Database error'))

      await expect(UserService.createUser(mockUserData)).rejects.toThrow('Database error')
    })
  })

  describe('findUserById', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
      image: null,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: null,
    }

    it('应该通过ID找到用户', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await UserService.findUserById('1')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { profile: true },
      })
      expect(result).toEqual(mockUser)
    })

    it('当用户不存在时应该返回null', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await UserService.findUserById('999')

      expect(result).toBeNull()
    })
  })

  describe('findUserByEmail', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
      image: null,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: null,
    }

    it('应该通过邮箱找到用户', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await UserService.findUserByEmail('test@example.com')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { profile: true },
      })
      expect(result).toEqual(mockUser)
    })

    it('当用户不存在时应该返回null', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await UserService.findUserByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('updateUser', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Updated Name',
      password: 'hashedPassword',
      image: 'new-image.jpg',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: '1',
        userId: '1',
        bio: 'Updated bio',
        location: 'Updated location',
        website: null,
        github: null,
        twitter: null,
      },
    }

    it('应该更新用户信息', async () => {
      const updateData = {
        name: 'Updated Name',
        image: 'new-image.jpg',
        profile: {
          bio: 'Updated bio',
          location: 'Updated location',
        },
      }

      mockPrisma.user.update.mockResolvedValue(mockUser)

      const result = await UserService.updateUser('1', updateData)

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: updateData.name,
          image: updateData.image,
          profile: {
            upsert: {
              create: updateData.profile,
              update: updateData.profile,
            },
          },
        },
        include: { profile: true },
      })
      expect(result).toEqual(mockUser)
    })

    it('应该处理更新错误', async () => {
      mockPrisma.user.update.mockRejectedValue(new Error('Update failed'))

      await expect(UserService.updateUser('1', { name: 'New Name' })).rejects.toThrow('Update failed')
    })
  })

  describe('deleteUser', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
      image: null,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: null,
    }

    it('应该删除用户', async () => {
      mockPrisma.user.delete.mockResolvedValue(mockUser)

      const result = await UserService.deleteUser('1')

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { profile: true },
      })
      expect(result).toEqual(mockUser)
    })

    it('应该处理删除错误', async () => {
      mockPrisma.user.delete.mockRejectedValue(new Error('Delete failed'))

      await expect(UserService.deleteUser('1')).rejects.toThrow('Delete failed')
    })
  })

  describe('getUsers', () => {
    const mockUsers = [
      {
        id: '1',
        email: 'user1@example.com',
        name: 'User 1',
        password: 'hashedPassword',
        image: null,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: null,
      },
      {
        id: '2',
        email: 'user2@example.com',
        name: 'User 2',
        password: 'hashedPassword',
        image: null,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: null,
      },
    ]

    it('应该获取用户列表和总数', async () => {
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)
      mockPrisma.user.count.mockResolvedValue(2)

      const result = await UserService.getUsers(1, 10)

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: { profile: true },
      })
      expect(mockPrisma.user.count).toHaveBeenCalled()
      expect(result).toEqual({
        users: mockUsers,
        total: 2,
      })
    })

    it('应该使用正确的分页参数', async () => {
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)
      mockPrisma.user.count.mockResolvedValue(2)

      await UserService.getUsers(2, 5)

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        include: { profile: true },
      })
    })

    it('应该处理查询错误', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Query failed'))

      await expect(UserService.getUsers()).rejects.toThrow('Query failed')
    })
  })
}) 