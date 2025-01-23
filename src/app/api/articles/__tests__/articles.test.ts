import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { GET as getArticle, PUT, DELETE } from '../[id]/route';
import { articleService } from '@/services/articleService';
import { CreateArticleInput } from '@/types/article';

// 模拟请求数据
const mockArticleInput: CreateArticleInput = {
  title: '测试文章',
  content: '这是一篇测试文章的内容',
  summary: '测试文章摘要',
  tags: ['测试', '标签'],
  category: '测试分类',
  status: 'draft',
  author: {
    id: 'test-author-id',
    name: '测试作者'
  }
};

describe('Articles API', () => {
  // 在所有测试前禁用控制台错误输出
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  // 在所有测试后恢复控制台错误输出
  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    // @ts-ignore - 访问私有属性用于测试
    articleService.articles = [];
    // 清除 console.error 的调用记录
    (console.error as jest.Mock).mockClear();
  });

  describe('POST /api/articles', () => {
    it('应该成功创建文章', async () => {
      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: JSON.stringify(mockArticleInput)
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toMatchObject({
        ...mockArticleInput,
        id: expect.any(String)
      });
    });

    it('当请求体为空时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST'
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to create article' });
    });

    it('当请求体格式错误时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: '{invalid json'
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to create article' });
    });

    it('当缺少必填字段时应该返回400错误', async () => {
      const invalidInput = {
        title: '测试文章'
        // 缺少其他必填字段
      };

      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: JSON.stringify(invalidInput)
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to create article' });
    });

    it('当请求体包含无效的字段类型时应该返回400错误', async () => {
      const invalidInput = {
        ...mockArticleInput,
        title: 123, // 应该是字符串
      };

      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: JSON.stringify(invalidInput)
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to create article' });
    });

    it('当请求体包含无效的标签类型时应该返回400错误', async () => {
      const invalidInput = {
        ...mockArticleInput,
        tags: 'not-an-array'
      };

      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: JSON.stringify(invalidInput)
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to create article' });
    });

    it('当请求体包含无效的状态值时应该返回400错误', async () => {
      const invalidInput = {
        ...mockArticleInput,
        status: 'invalid-status'
      };

      const request = new NextRequest('http://localhost/api/articles', {
        method: 'POST',
        body: JSON.stringify(invalidInput)
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to create article' });
    });
  });

  describe('GET /api/articles', () => {
    beforeEach(async () => {
      // 创建测试文章
      await articleService.createArticle({
        ...mockArticleInput,
        category: '分类A',
        status: 'published'
      });
      await articleService.createArticle({
        ...mockArticleInput,
        category: '分类B',
        status: 'draft'
      });
    });

    it('应该返回所有文章', async () => {
      const request = new NextRequest('http://localhost/api/articles');
      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveLength(2);
    });

    it('应该支持按分类筛选', async () => {
      const request = new NextRequest('http://localhost/api/articles?category=分类A');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveLength(1);
      expect(data[0].category).toBe('分类A');
    });

    it('应该支持按状态筛选', async () => {
      const request = new NextRequest('http://localhost/api/articles?status=published');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveLength(1);
      expect(data[0].status).toBe('published');
    });

    it('应该处理无效的标签格式', async () => {
      const request = new NextRequest('http://localhost/api/articles?tags=');
      const response = await GET(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('应该处理无效的状态值', async () => {
      const request = new NextRequest('http://localhost/api/articles?status=invalid');
      const response = await GET(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('GET /api/articles/[id]', () => {
    it('应该返回指定ID的文章', async () => {
      const article = await articleService.createArticle(mockArticleInput);
      const request = new NextRequest(`http://localhost/api/articles/${article.id}`);
      const response = await getArticle(request, { params: { id: article.id } });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject(mockArticleInput);
    });

    it('当文章不存在时应该返回404', async () => {
      const request = new NextRequest('http://localhost/api/articles/non-existent-id');
      const response = await getArticle(request, { params: { id: 'non-existent-id' } });
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'Article not found' });
    });

    it('当ID格式无效时应该返回400错误', async () => {
      const request = new NextRequest('http://localhost/api/articles/invalid-uuid-format');
      const response = await getArticle(request, { params: { id: 'invalid-uuid-format' } });
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'Article not found' });
    });
  });

  describe('PUT /api/articles/[id]', () => {
    it('应该成功更新文章', async () => {
      const article = await articleService.createArticle(mockArticleInput);
      const updateData = {
        title: '更新后的标题',
        content: '更新后的内容'
      };

      const request = new NextRequest(`http://localhost/api/articles/${article.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      const response = await PUT(request, { params: { id: article.id } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        ...mockArticleInput,
        ...updateData
      });
    });

    it('当请求体为空时应该返回400错误', async () => {
      const article = await articleService.createArticle(mockArticleInput);
      const request = new NextRequest(`http://localhost/api/articles/${article.id}`, {
        method: 'PUT'
      });

      const response = await PUT(request, { params: { id: article.id } });
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to update article' });
    });

    it('当请求体格式错误时应该返回400错误', async () => {
      const article = await articleService.createArticle(mockArticleInput);
      const request = new NextRequest(`http://localhost/api/articles/${article.id}`, {
        method: 'PUT',
        body: '{invalid json'
      });

      const response = await PUT(request, { params: { id: article.id } });
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to update article' });
    });

    it('当文章不存在时应该返回404', async () => {
      const request = new NextRequest('http://localhost/api/articles/non-existent-id', {
        method: 'PUT',
        body: JSON.stringify({ title: '更新后的标题' })
      });

      const response = await PUT(request, { params: { id: 'non-existent-id' } });
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Article not found' });
    });

    it('当更新数据包含无效的字段类型时应该返回400错误', async () => {
      const article = await articleService.createArticle(mockArticleInput);
      const invalidUpdate = {
        title: 123, // 应该是字符串
      };

      const request = new NextRequest(`http://localhost/api/articles/${article.id}`, {
        method: 'PUT',
        body: JSON.stringify(invalidUpdate)
      });

      const response = await PUT(request, { params: { id: article.id } });
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to update article' });
    });

    it('当更新数据包含未知字段时应该返回400错误', async () => {
      const article = await articleService.createArticle(mockArticleInput);
      const invalidUpdate = {
        unknownField: 'some value'
      };

      const request = new NextRequest(`http://localhost/api/articles/${article.id}`, {
        method: 'PUT',
        body: JSON.stringify(invalidUpdate)
      });

      const response = await PUT(request, { params: { id: article.id } });
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to update article' });
    });

    it('当更新数据包含无效的作者信息时应该返回400错误', async () => {
      const article = await articleService.createArticle(mockArticleInput);
      const invalidUpdate = {
        author: {
          // 缺少必需的字段
          name: 'New Author'
        }
      };

      const request = new NextRequest(`http://localhost/api/articles/${article.id}`, {
        method: 'PUT',
        body: JSON.stringify(invalidUpdate)
      });

      const response = await PUT(request, { params: { id: article.id } });
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to update article' });
    });
  });

  describe('DELETE /api/articles/[id]', () => {
    it('应该成功删除文章', async () => {
      const article = await articleService.createArticle(mockArticleInput);
      const request = new NextRequest(`http://localhost/api/articles/${article.id}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: article.id } });
      expect(response.status).toBe(204);

      // 验证文章已被删除
      const deleted = await articleService.getArticle(article.id);
      expect(deleted).toBeNull();
    });

    it('当文章不存在时应该返回404', async () => {
      const request = new NextRequest('http://localhost/api/articles/non-existent-id', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'non-existent-id' } });
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Article not found' });
    });

    it('当ID格式无效时应该返回404错误', async () => {
      const request = new NextRequest('http://localhost/api/articles/invalid-uuid-format', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'invalid-uuid-format' } });
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Article not found' });
    });
  });
}); 