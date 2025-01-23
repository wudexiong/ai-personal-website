/**
 * 文章API测试
 * @jest-environment node
 */

import { ArticleService } from '@/services/articleService'
import { NextRequest } from 'next/server'
import { POST, GET } from '../route'
import { GET as GET_BY_ID, PUT, DELETE } from '../[id]/route'

describe('Articles API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(ArticleService, 'createArticle').mockImplementation(jest.fn())
    jest.spyOn(ArticleService, 'getArticles').mockImplementation(jest.fn())
    jest.spyOn(ArticleService, 'getArticle').mockImplementation(jest.fn())
    jest.spyOn(ArticleService, 'updateArticle').mockImplementation(jest.fn())
    jest.spyOn(ArticleService, 'deleteArticle').mockImplementation(jest.fn())
  })

  describe('POST /api/articles', () => {
    it('应该成功创建文章', async () => {
      const mockArticle = {
        title: '测试文章',
        content: '文章内容',
        authorId: '1',
        slug: 'test-article',
        excerpt: '摘要',
        coverImage: 'cover.jpg',
        categoryId: '1',
        tagIds: ['1', '2'],
        published: false
      }

      ;(ArticleService.createArticle as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockArticle,
      })

      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: JSON.stringify(mockArticle),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)
      
      const responseData = await response.json()
      expect(responseData).toEqual({
        id: '1',
        ...mockArticle,
      })
    })

    it('当请求体为空时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('当请求体格式错误时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('当缺少必填字段时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('当请求体包含无效的字段类型时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: JSON.stringify({
          title: 123, // 应该是字符串
          content: '内容',
          authorId: '1',
          slug: 'test'
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('当请求体包含无效的标签类型时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: JSON.stringify({
          title: '标题',
          content: '内容',
          authorId: '1',
          slug: 'test',
          tagIds: 'invalid-tags', // 应该是数组
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('当请求体包含无效的状态值时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: JSON.stringify({
          title: '标题',
          content: '内容',
          authorId: '1',
          slug: 'test',
          published: 'invalid', // 应该是布尔值
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/articles', () => {
    it('应该返回所有文章', async () => {
      const mockArticles = [
        {
          id: '1',
          title: '文章1',
          content: '内容1',
        },
        {
          id: '2',
          title: '文章2',
          content: '内容2',
        },
      ]

      ;(ArticleService.getArticles as jest.Mock).mockResolvedValueOnce(mockArticles)

      const request = new NextRequest('http://localhost/api/articles')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData).toEqual(mockArticles)
    })

    it('应该支持按分类筛选', async () => {
      const mockArticles = [
        {
          id: '1',
          title: '文章1',
          categoryId: '1',
        },
      ]

      ;(ArticleService.getArticles as jest.Mock).mockResolvedValueOnce(mockArticles)

      const request = new NextRequest('http://localhost/api/articles?categoryId=1')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData).toEqual(mockArticles)
      expect(ArticleService.getArticles).toHaveBeenCalledWith(expect.objectContaining({
        categoryId: '1',
      }))
    })

    it('应该支持按状态筛选', async () => {
      const mockArticles = [
        {
          id: '1',
          title: '文章1',
          published: true,
        },
      ]

      ;(ArticleService.getArticles as jest.Mock).mockResolvedValueOnce(mockArticles)

      const request = new NextRequest('http://localhost/api/articles?published=true')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData).toEqual(mockArticles)
      expect(ArticleService.getArticles).toHaveBeenCalledWith(expect.objectContaining({
        published: true,
      }))
    })

    it('应该处理无效的标签格式', async () => {
      const request = new NextRequest('http://localhost/api/articles?tags=invalid@tags')
      const response = await GET(request)
      expect(response.status).toBe(400)
    })

    it('应该处理无效的状态值', async () => {
      const request = new NextRequest('http://localhost/api/articles?status=invalid-status')
      const response = await GET(request)
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/articles/[id]', () => {
    it('应该返回指定ID的文章', async () => {
      const mockArticle = {
        id: '1',
        title: '文章1',
        content: '内容1',
      }

      ;(ArticleService.getArticle as jest.Mock).mockResolvedValueOnce(mockArticle)

      const request = new NextRequest('http://localhost/api/articles/1')
      const response = await GET_BY_ID(request, { params: { id: '1' } })
      
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData).toEqual(mockArticle)
    })

    it('当文章不存在时应该返回404', async () => {
      ;(ArticleService.getArticle as jest.Mock).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/articles/999')
      const response = await GET_BY_ID(request, { params: { id: '999' } })
      
      expect(response.status).toBe(404)
    })

    it('当ID格式无效时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles/invalid-id')
      const response = await GET_BY_ID(request, { params: { id: 'invalid-id' } })
      
      expect(response.status).toBe(400)
    })
  })

  describe('PUT /api/articles/[id]', () => {
    it('应该成功更新文章', async () => {
      const mockArticle = {
        title: '更新后的标题',
        content: '更新后的内容',
        slug: 'updated-article',
        excerpt: '更新后的摘要',
        coverImage: 'new-cover.jpg',
        categoryId: '2',
        tagIds: ['3', '4'],
        published: true
      }

      ;(ArticleService.updateArticle as jest.Mock).mockResolvedValueOnce({
        id: '1',
        ...mockArticle,
      })

      const request = new NextRequest('http://localhost/api/articles/1', {
        method: 'PUT',
        body: JSON.stringify(mockArticle),
      })

      const response = await PUT(request, { params: { id: '1' } })
      expect(response.status).toBe(200)
      
      const responseData = await response.json()
      expect(responseData).toEqual({
        id: '1',
        ...mockArticle,
      })
    })

    it('当请求体为空时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles/1', {
        method: 'PUT',
      })

      const response = await PUT(request, { params: { id: '1' } })
      expect(response.status).toBe(400)
    })

    it('当请求体格式错误时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles/1', {
        method: 'PUT',
        body: 'invalid json',
      })

      const response = await PUT(request, { params: { id: '1' } })
      expect(response.status).toBe(400)
    })

    it('当文章不存在时应该返回404', async () => {
      ;(ArticleService.updateArticle as jest.Mock).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/articles/999', {
        method: 'PUT',
        body: JSON.stringify({
          title: '更新后的标题',
          content: '更新后的内容',
          slug: 'updated-article'
        }),
      })

      const response = await PUT(request, { params: { id: '999' } })
      expect(response.status).toBe(404)
    })

    it('当更新数据包含无效的字段类型时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles/1', {
        method: 'PUT',
        body: JSON.stringify({
          title: 123, // 应该是字符串
        }),
      })

      const response = await PUT(request, { params: { id: '1' } })
      expect(response.status).toBe(400)
    })

    it('当更新数据包含未知字段时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles/1', {
        method: 'PUT',
        body: JSON.stringify({
          unknownField: 'value',
        }),
      })

      const response = await PUT(request, { params: { id: '1' } })
      expect(response.status).toBe(400)
    })

    it('当更新数据包含无效的作者信息时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles/1', {
        method: 'PUT',
        body: JSON.stringify({
          authorId: 123, // 应该是字符串
        }),
      })

      const response = await PUT(request, { params: { id: '1' } })
      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/articles/[id]', () => {
    it('应该成功删除文章', async () => {
      ;(ArticleService.deleteArticle as jest.Mock).mockResolvedValueOnce({ id: '1' })

      const request = new NextRequest('http://localhost/api/articles/1', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: '1' } })
      expect(response.status).toBe(204)
    })

    it('当文章不存在时应该返回404', async () => {
      ;(ArticleService.deleteArticle as jest.Mock).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/articles/999', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: '999' } })
      expect(response.status).toBe(404)
    })

    it('当ID格式无效时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles/invalid-id', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'invalid-id' } })
      expect(response.status).toBe(400)
    })
  })
}) 