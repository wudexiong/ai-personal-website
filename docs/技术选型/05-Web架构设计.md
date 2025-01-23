# AI时代个人网站Web架构设计

## 1. 架构设计原则

### 1.1 核心原则
```
设计原则
├── 可维护性
│   ├── 代码可读性
│   ├── 模块化设计
│   ├── 测试覆盖
│   └── 文档完整
├── 可扩展性
│   ├── 水平扩展
│   ├── 垂直扩展
│   ├── 功能扩展
│   └── 接口扩展
├── 高性能
│   ├── 响应速度
│   ├── 并发处理
│   ├── 资源利用
│   └── 优化策略
└── 高可用性
    ├── 服务容错
    ├── 负载均衡
    ├── 故障恢复
    └── 监控告警
```

### 1.2 技术选型
```
技术栈
├── 前端技术
│   ├── Next.js 14+
│   ├── React 18+
│   ├── TailwindCSS
│   └── TypeScript
├── 后端技术
│   ├── Edge Runtime
│   ├── Node.js Runtime
│   ├── PostgreSQL
│   └── Redis
├── AI技术
│   ├── OpenAI
│   ├── Anthropic
│   ├── Vercel AI
│   └── LangChain
└── 基础设施
    ├── Vercel
    ├── PlanetScale
    ├── Cloudflare
    └── GitHub
```

## 2. 系统架构设计

### 2.1 整体架构
```
系统架构
├── 接入层
│   ├── CDN加速
│   │   ├── Vercel Edge Network
│   │   └── Cloudflare CDN
│   ├── 负载均衡
│   │   ├── 地理分发
│   │   └── 智能路由
│   └── 安全防护
│       ├── DDoS防护
│       ├── WAF防火墙
│       └── Bot防护
├── 应用层
│   ├── Web应用
│   │   ├── SSR渲染
│   │   ├── 静态生成
│   │   └── 客户端渲染
│   ├── API服务
│   │   ├── RESTful API
│   │   ├── GraphQL API
│   │   └── WebSocket
│   └── AI服务
│       ├── 内容生成
│       ├── 智能问答
│       └── 推荐系统
├── 数据层
│   ├── 持久化存储
│   │   ├── 关系型数据库
│   │   ├── 文档数据库
│   │   └── 向量数据库
│   ├── 缓存系统
│   │   ├── 分布式缓存
│   │   ├── 本地缓存
│   │   └── CDN缓存
│   └── 文件存储
│       ├── 对象存储
│       ├── CDN存储
│       └── 边缘存储
└── 基础设施层
    ├── 计算资源
    │   ├── Serverless
    │   ├── Edge Computing
    │   └── Container
    ├── 存储资源
    │   ├── 块存储
    │   ├── 文件存储
    │   └── 对象存储
    └── 网络资源
        ├── CDN网络
        ├── 专用网络
        └── 公共网络
```

### 2.2 核心组件
```
核心组件
├── UI组件
│   ├── 基础组件
│   │   ├── 布局组件
│   │   ├── 导航组件
│   │   └── 表单组件
│   ├── 业务组件
│   │   ├── 文章组件
│   │   ├── 评论组件
│   │   └── 用户组件
│   └── AI组件
│       ├── 对话组件
│       ├── 编辑器组件
│       └── 推荐组件
├── 服务组件
│   ├── 核心服务
│   │   ├── 用户服务
│   │   ├── 内容服务
│   │   └── 搜索服务
│   ├── AI服务
│   │   ├── 生成服务
│   │   ├── 对话服务
│   │   └── 分析服务
│   └── 基础服务
│       ├── 认证服务
│       ├── 存储服务
│       └── 缓存服务
└── 中间件
    ├── 请求处理
    │   ├── 认证中间件
    │   ├── 限流中间件
    │   └── 日志中间件
    ├── 缓存处理
    │   ├── 页面缓存
    │   ├── API缓存
    │   └── 数据缓存
    └── 业务处理
        ├── 错误处理
        ├── 权限控制
        └── 数据转换
```

## 3. 前端架构设计

### 3.1 应用架构
```typescript
// app/layout.tsx
import { Providers } from '@/components/providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

// components/providers.tsx
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
```

### 3.2 状态设计
```typescript
// lib/store/post.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PostState {
  posts: Post[]
  drafts: Draft[]
  addPost: (post: Post) => void
  updatePost: (id: string, post: Post) => void
  deleteDraft: (id: string) => void
}

export const usePostStore = create<PostState>()(
  persist(
    (set) => ({
      posts: [],
      drafts: [],
      addPost: (post) => 
        set((state) => ({ posts: [...state.posts, post] })),
      updatePost: (id, post) =>
        set((state) => ({
          posts: state.posts.map((p) => 
            p.id === id ? post : p
          )
        })),
      deleteDraft: (id) =>
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== id)
        }))
    }),
    {
      name: 'post-storage'
    }
  )
)
```

### 3.3 路由设计
```
路由结构
├── (auth)
│   ├── login
│   └── register
├── (main)
│   ├── blog
│   │   ├── [slug]
│   │   └── page/[page]
│   ├── projects
│   └── about
└── api
    ├── auth
    │   ├── [...nextauth]
    │   └── callback
    ├── posts
    │   ├── [id]
    │   └── search
    └── ai
        ├── chat
        ├── generate
        └── analyze
```

## 4. 后端架构设计

### 4.1 API设计
```typescript
// app/api/posts/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '10')
  
  const cacheKey = `posts:${page}:${limit}`
  const cached = await redis.get(cacheKey)
  if (cached) return NextResponse.json(JSON.parse(cached))
  
  const posts = await prisma.post.findMany({
    take: limit,
    skip: (page - 1) * limit,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          name: true,
          image: true
        }
      }
    }
  })
  
  await redis.set(cacheKey, JSON.stringify(posts), 'EX', 300)
  
  return NextResponse.json(posts)
}
```

### 4.2 中间件设计
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  // 性能监控
  const requestStart = Date.now()
  
  // 限流检查
  const limiter = await rateLimit.check(request.ip ?? 'anonymous')
  if (!limiter.success) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
  
  // 认证检查
  const token = request.cookies.get('token')
  if (!token && request.nextUrl.pathname.startsWith('/api')) {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  
  // 响应处理
  const response = NextResponse.next()
  
  // 添加安全头
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  
  // 性能监控
  response.headers.set(
    'Server-Timing',
    `total;dur=${Date.now() - requestStart}`
  )
  
  return response
}
```

### 4.3 服务设计
```typescript
// lib/services/post.ts
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { openai } from '@/lib/openai'

export class PostService {
  // 创建文章
  async create(data: CreatePostInput) {
    // 生成向量
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: data.content
    })
    
    // 创建文章
    const post = await prisma.post.create({
      data: {
        ...data,
        contentVector: embedding.data[0].embedding
      }
    })
    
    // 清除缓存
    await redis.del('posts:*')
    
    return post
  }
  
  // 相似文章推荐
  async findSimilar(id: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { contentVector: true }
    })
    
    if (!post?.contentVector) return []
    
    return prisma.$queryRaw`
      SELECT id, title, slug,
             1 - (content_vector <=> ${post.contentVector}::vector) as similarity
      FROM posts
      WHERE id != ${id}
        AND published = true
      ORDER BY similarity DESC
      LIMIT 5
    `
  }
}
```

## 5. AI服务架构

### 5.1 服务集成
```typescript
// lib/ai/index.ts
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PromptTemplate } from 'langchain/prompts'
import { LLMChain } from 'langchain/chains'

// 聊天模型
export const chatModel = new ChatOpenAI({
  modelName: 'gpt-4-turbo-preview',
  temperature: 0.7,
  streaming: true,
})

// 向量模型
export const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small',
})

// 提示模板
export const blogPrompt = new PromptTemplate({
  template: `
    作为一个专业的技术博主，请帮我写一篇关于 {topic} 的技术博客文章。
    要求：
    1. 深入浅出的技术讲解
    2. 实用的代码示例
    3. 最佳实践建议
    4. 性能优化技巧
    
    文章结构：
    1. 背景介绍
    2. 核心概念
    3. 实现方案
    4. 示例代码
    5. 最佳实践
    6. 总结展望
  `,
  inputVariables: ['topic'],
})

// 生成链
export const blogChain = new LLMChain({
  llm: chatModel,
  prompt: blogPrompt,
})
```

### 5.2 应用集成
```typescript
// app/api/ai/generate/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { blogChain } from '@/lib/ai'
import { auth } from '@/lib/auth'

export const runtime = 'edge'

export async function POST(req: Request) {
  // 认证检查
  const user = await auth()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // 参数验证
  const { topic } = await req.json()
  if (!topic) {
    return new Response('Missing topic', { status: 400 })
  }
  
  // 生成内容
  const stream = await blogChain.stream({
    topic,
  })
  
  // 返回流式响应
  return new StreamingTextResponse(stream)
}
```

## 6. 性能优化

### 6.1 前端优化
```typescript
// next.config.js
module.exports = {
  // 图片优化
  images: {
    domains: ['cdn.your-domain.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // 构建优化
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@headlessui/react'],
  },
  
  // 缓存优化
  generateEtags: true,
  
  // 压缩优化
  compress: true,
}

// components/image.tsx
import Image from 'next/image'
import { useState } from 'react'

export function OptimizedImage({ src, alt, ...props }) {
  const [isLoading, setLoading] = useState(true)
  
  return (
    <Image
      src={src}
      alt={alt}
      loading="lazy"
      quality={75}
      onLoadingComplete={() => setLoading(false)}
      className={`
        duration-700 ease-in-out
        ${isLoading ? 'blur-lg' : 'blur-0'}
      `}
      {...props}
    />
  )
}
```

### 6.2 后端优化
```typescript
// lib/cache.ts
import { redis } from './redis'

export async function cache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  // 尝试获取缓存
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)
  
  // 执行函数
  const data = await fn()
  
  // 设置缓存
  await redis.set(key, JSON.stringify(data), 'EX', ttl)
  
  return data
}

// lib/db/query.ts
import { prisma } from './prisma'

export async function optimizedQuery<T>(
  queryFn: () => Promise<T>,
  options: {
    timeout?: number
    retries?: number
  } = {}
) {
  const { timeout = 5000, retries = 3 } = options
  
  // 添加超时控制
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Query timeout'))
    }, timeout)
  })
  
  // 重试逻辑
  let lastError: Error | null = null
  for (let i = 0; i < retries; i++) {
    try {
      return await Promise.race([
        queryFn(),
        timeoutPromise
      ])
    } catch (error) {
      lastError = error as Error
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 100)
      )
    }
  }
  
  throw lastError
}
```

## 7. 安全架构

### 7.1 认证授权
```typescript
// lib/auth.ts
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function authenticate(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token) {
      throw new Error('Unauthorized')
    }
    return token
  } catch (error) {
    return null
  }
}

export async function authorize(
  req: NextRequest,
  roles: string[]
) {
  const token = await authenticate(req)
  if (!token) {
    return false
  }
  
  return roles.includes(token.role as string)
}
```

### 7.2 数据安全
```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

export class Encryption {
  private readonly algorithm = 'aes-256-gcm'
  private readonly key = Buffer.from(
    process.env.ENCRYPTION_KEY!, 'base64'
  )
  
  // 加密数据
  async encrypt(data: string): Promise<string> {
    const iv = randomBytes(16)
    const cipher = createCipheriv(this.algorithm, this.key, iv)
    
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final()
    ])
    
    const tag = cipher.getAuthTag()
    
    return Buffer.concat([iv, tag, encrypted])
      .toString('base64')
  }
  
  // 解密数据
  async decrypt(data: string): Promise<string> {
    const buf = Buffer.from(data, 'base64')
    
    const iv = buf.subarray(0, 16)
    const tag = buf.subarray(16, 32)
    const encrypted = buf.subarray(32)
    
    const decipher = createDecipheriv(this.algorithm, this.key, iv)
    decipher.setAuthTag(tag)
    
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]).toString('utf8')
  }
}
```

## 8. 监控告警

### 8.1 性能监控
```typescript
// lib/monitoring.ts
import { metrics } from './metrics'

// 请求监控
export async function monitorRequest(
  name: string,
  fn: () => Promise<any>
) {
  const start = Date.now()
  try {
    const result = await fn()
    
    metrics.histogram('request.duration', Date.now() - start, {
      name,
      status: 'success'
    })
    
    return result
  } catch (error) {
    metrics.histogram('request.duration', Date.now() - start, {
      name,
      status: 'error'
    })
    
    throw error
  }
}

// 资源监控
export function monitorResources() {
  setInterval(() => {
    const used = process.memoryUsage()
    
    metrics.gauge('memory.heapUsed', used.heapUsed)
    metrics.gauge('memory.heapTotal', used.heapTotal)
    metrics.gauge('memory.rss', used.rss)
    
    const cpuUsage = process.cpuUsage()
    metrics.gauge('cpu.user', cpuUsage.user)
    metrics.gauge('cpu.system', cpuUsage.system)
  }, 5000)
}
```

### 8.2 错误监控
```typescript
// lib/error.ts
import * as Sentry from '@sentry/nextjs'

export function initErrorMonitoring() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  })
}

export function captureError(
  error: Error,
  context?: Record<string, any>
) {
  console.error(error)
  
  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context)
    }
    Sentry.captureException(error)
  })
}
```

## 9. 更新历史

### v1.0.0 (2024-03-21)
- 初始版本
- 架构设计
- 核心实现
- 最佳实践 