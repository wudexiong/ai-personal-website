/**
 * 缓存服务
 * 提供基于 Redis 的缓存功能
 * @module services/cacheService
 */

import Redis from 'ioredis'

/**
 * 缓存键前缀枚举
 */
export enum CachePrefix {
  ARTICLE = 'article:',
  USER = 'user:',
  CATEGORY = 'category:',
  TAG = 'tag:',
  COMMENT = 'comment:',
}

/**
 * 缓存配置接口
 */
interface CacheConfig {
  ttl?: number // 过期时间(秒)
  prefix?: string // 键前缀
}

/**
 * Redis 配置接口
 */
interface RedisConfig {
  host?: string
  port?: number
  password?: string
  db?: number
}

/**
 * 缓存服务类
 */
export class CacheService {
  private redis: Redis
  private defaultTTL: number = 3600 // 默认1小时过期

  constructor(config?: RedisConfig) {
    // 使用默认配置或传入的配置创建 Redis 客户端
    this.redis = new Redis({
      host: config?.host || 'localhost',
      port: config?.port || 6379,
      password: config?.password,
      db: config?.db || 0,
      lazyConnect: true, // 延迟连接，直到第一次使用时
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    // 监听错误事件
    this.redis.on('error', (error: Error) => {
      console.error('Redis connection error:', error)
    })
  }

  /**
   * 生成缓存键
   * @param key - 原始键
   * @param prefix - 前缀
   * @returns 完整的缓存键
   */
  private generateKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}${key}` : key
  }

  /**
   * 设置缓存
   * @param key - 缓存键
   * @param value - 缓存值
   * @param config - 缓存配置
   */
  async set(key: string, value: any, config?: CacheConfig): Promise<void> {
    const cacheKey = this.generateKey(key, config?.prefix)
    const ttl = config?.ttl || this.defaultTTL

    try {
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }
      await this.redis.set(cacheKey, value, 'EX', ttl)
    } catch (error) {
      throw new Error('Failed to set cache')
    }
  }

  /**
   * 获取缓存
   * @param key - 缓存键
   * @param prefix - 键前缀
   * @returns 缓存值
   */
  async get<T>(key: string, prefix?: string): Promise<T | null> {
    const cacheKey = this.generateKey(key, prefix)

    try {
      const value = await this.redis.get(cacheKey)
      if (!value) return null

      try {
        return JSON.parse(value) as T
      } catch {
        return value as T
      }
    } catch (error) {
      return null
    }
  }

  /**
   * 删除缓存
   * @param key - 缓存键
   * @param prefix - 键前缀
   */
  async delete(key: string, prefix?: string): Promise<void> {
    const cacheKey = this.generateKey(key, prefix)

    try {
      await this.redis.del(cacheKey)
    } catch (error) {
      throw new Error('Failed to delete cache')
    }
  }

  /**
   * 检查缓存是否存在
   * @param key - 缓存键
   * @param prefix - 键前缀
   * @returns 是否存在
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    const cacheKey = this.generateKey(key, prefix)

    try {
      return (await this.redis.exists(cacheKey)) === 1
    } catch (error) {
      return false
    }
  }

  /**
   * 设置缓存过期时间
   * @param key - 缓存键
   * @param ttl - 过期时间(秒)
   * @param prefix - 键前缀
   */
  async expire(key: string, ttl: number, prefix?: string): Promise<void> {
    const cacheKey = this.generateKey(key, prefix)

    try {
      await this.redis.expire(cacheKey, ttl)
    } catch (error) {
      throw new Error('Failed to set cache expiration')
    }
  }

  /**
   * 清除所有缓存
   */
  async clear(): Promise<void> {
    try {
      await this.redis.flushall()
    } catch (error) {
      throw new Error('Failed to clear cache')
    }
  }

  /**
   * 获取缓存剩余过期时间
   * @param key - 缓存键
   * @param prefix - 键前缀
   * @returns 剩余时间(秒)
   */
  async ttl(key: string, prefix?: string): Promise<number> {
    const cacheKey = this.generateKey(key, prefix)

    try {
      return await this.redis.ttl(cacheKey)
    } catch (error) {
      return -1
    }
  }

  /**
   * 关闭 Redis 连接
   */
  async disconnect(): Promise<void> {
    await this.redis.quit()
  }
}

// 导出缓存服务实例
export const cacheService = new CacheService() 