/**
 * 缓存服务单元测试
 * @jest-environment node
 */

import Redis from 'ioredis'
import { CacheService, CachePrefix } from '../cacheService'

// Mock ioredis
jest.mock('ioredis')

describe('CacheService', () => {
  let cacheService: CacheService
  let mockRedis: jest.Mocked<Redis>

  beforeEach(() => {
    // 清除所有模拟
    jest.clearAllMocks()
    
    // 创建新的 Redis 实例模拟
    mockRedis = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      expire: jest.fn(),
      flushall: jest.fn(),
      ttl: jest.fn(),
      quit: jest.fn(),
      on: jest.fn(),
    } as unknown as jest.Mocked<Redis>

    // 模拟 Redis 构造函数
    (Redis as jest.MockedClass<typeof Redis>).mockImplementation(() => mockRedis)
    
    // 创建缓存服务实例
    cacheService = new CacheService()
  })

  afterEach(async () => {
    await cacheService.disconnect()
  })

  describe('set', () => {
    it('应该正确设置字符串值', async () => {
      await cacheService.set('test-key', 'test-value')
      expect(mockRedis.set).toHaveBeenCalledWith('test-key', 'test-value', 'EX', 3600)
    })

    it('应该正确设置对象值', async () => {
      const testObj = { name: 'test' }
      await cacheService.set('test-key', testObj)
      expect(mockRedis.set).toHaveBeenCalledWith('test-key', JSON.stringify(testObj), 'EX', 3600)
    })

    it('应该使用自定义TTL', async () => {
      await cacheService.set('test-key', 'test-value', { ttl: 1800 })
      expect(mockRedis.set).toHaveBeenCalledWith('test-key', 'test-value', 'EX', 1800)
    })

    it('应该使用前缀', async () => {
      await cacheService.set('test-key', 'test-value', { prefix: CachePrefix.USER })
      expect(mockRedis.set).toHaveBeenCalledWith('user:test-key', 'test-value', 'EX', 3600)
    })

    it('应该处理设置错误', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'))
      await expect(cacheService.set('test-key', 'test-value')).rejects.toThrow('Failed to set cache')
    })
  })

  describe('get', () => {
    it('应该正确获取字符串值', async () => {
      mockRedis.get.mockResolvedValue('test-value')
      const result = await cacheService.get('test-key')
      expect(result).toBe('test-value')
      expect(mockRedis.get).toHaveBeenCalledWith('test-key')
    })

    it('应该正确获取对象值', async () => {
      const testObj = { name: 'test' }
      mockRedis.get.mockResolvedValue(JSON.stringify(testObj))
      const result = await cacheService.get('test-key')
      expect(result).toEqual(testObj)
    })

    it('当键不存在时应该返回null', async () => {
      mockRedis.get.mockResolvedValue(null)
      const result = await cacheService.get('non-existent-key')
      expect(result).toBeNull()
    })

    it('应该处理获取错误', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'))
      const result = await cacheService.get('test-key')
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('应该正确删除缓存', async () => {
      await cacheService.delete('test-key')
      expect(mockRedis.del).toHaveBeenCalledWith('test-key')
    })

    it('应该使用前缀删除缓存', async () => {
      await cacheService.delete('test-key', CachePrefix.USER)
      expect(mockRedis.del).toHaveBeenCalledWith('user:test-key')
    })

    it('应该处理删除错误', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'))
      await expect(cacheService.delete('test-key')).rejects.toThrow('Failed to delete cache')
    })
  })

  describe('exists', () => {
    it('当键存在时应该返回true', async () => {
      mockRedis.exists.mockResolvedValue(1)
      const result = await cacheService.exists('test-key')
      expect(result).toBe(true)
    })

    it('当键不存在时应该返回false', async () => {
      mockRedis.exists.mockResolvedValue(0)
      const result = await cacheService.exists('non-existent-key')
      expect(result).toBe(false)
    })

    it('应该处理检查错误', async () => {
      mockRedis.exists.mockRejectedValue(new Error('Redis error'))
      const result = await cacheService.exists('test-key')
      expect(result).toBe(false)
    })
  })

  describe('expire', () => {
    it('应该正确设置过期时间', async () => {
      await cacheService.expire('test-key', 1800)
      expect(mockRedis.expire).toHaveBeenCalledWith('test-key', 1800)
    })

    it('应该处理设置过期时间错误', async () => {
      mockRedis.expire.mockRejectedValue(new Error('Redis error'))
      await expect(cacheService.expire('test-key', 1800)).rejects.toThrow('Failed to set cache expiration')
    })
  })

  describe('clear', () => {
    it('应该清除所有缓存', async () => {
      await cacheService.clear()
      expect(mockRedis.flushall).toHaveBeenCalled()
    })

    it('应该处理清除错误', async () => {
      mockRedis.flushall.mockRejectedValue(new Error('Redis error'))
      await expect(cacheService.clear()).rejects.toThrow('Failed to clear cache')
    })
  })

  describe('ttl', () => {
    it('应该返回正确的剩余时间', async () => {
      mockRedis.ttl.mockResolvedValue(1800)
      const result = await cacheService.ttl('test-key')
      expect(result).toBe(1800)
    })

    it('当发生错误时应该返回-1', async () => {
      mockRedis.ttl.mockRejectedValue(new Error('Redis error'))
      const result = await cacheService.ttl('test-key')
      expect(result).toBe(-1)
    })
  })

  describe('disconnect', () => {
    it('应该正确关闭连接', async () => {
      await cacheService.disconnect()
      expect(mockRedis.quit).toHaveBeenCalled()
    })
  })
}) 