import { articleService } from '../articleService';
import { Article, CreateArticleInput } from '../../types/article';

describe('ArticleService', () => {
  // 在每个测试前清空文章列表
  beforeEach(() => {
    // @ts-ignore - 访问私有属性用于测试
    articleService.articles = [];
  });

  // 测试数据
  const mockArticleInput: CreateArticleInput = {
    title: '测试文章',
    content: '这是一篇测试文章的内容',
    summary: '测试文章摘要',
    tags: ['测试', '文章'],
    category: '测试分类',
    status: 'draft',
    author: {
      id: 'test-author-id',
      name: '测试作者'
    }
  };

  describe('createArticle', () => {
    it('应该成功创建文章', async () => {
      const article = await articleService.createArticle(mockArticleInput);

      expect(article).toMatchObject({
        ...mockArticleInput,
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('getArticle', () => {
    it('应该根据ID获取文章', async () => {
      const created = await articleService.createArticle(mockArticleInput);
      const article = await articleService.getArticle(created.id);

      expect(article).toEqual(created);
    });

    it('当文章不存在时应该返回null', async () => {
      const article = await articleService.getArticle('non-existent-id');
      expect(article).toBeNull();
    });
  });

  describe('listArticles', () => {
    beforeEach(async () => {
      // 创建多篇测试文章
      await articleService.createArticle({
        ...mockArticleInput,
        category: '分类A',
        tags: ['标签1', '标签2'],
        status: 'published'
      });
      await articleService.createArticle({
        ...mockArticleInput,
        category: '分类B',
        tags: ['标签2', '标签3'],
        status: 'draft'
      });
    });

    it('应该返回所有文章', async () => {
      const articles = await articleService.listArticles();
      expect(articles).toHaveLength(2);
    });

    it('应该根据分类筛选文章', async () => {
      const articles = await articleService.listArticles({ category: '分类A' });
      expect(articles).toHaveLength(1);
      expect(articles[0].category).toBe('分类A');
    });

    it('应该根据标签筛选文章', async () => {
      const articles = await articleService.listArticles({ tags: ['标签2'] });
      expect(articles).toHaveLength(2);
    });

    it('应该根据状态筛选文章', async () => {
      const articles = await articleService.listArticles({ status: 'published' });
      expect(articles).toHaveLength(1);
      expect(articles[0].status).toBe('published');
    });
  });

  describe('updateArticle', () => {
    it('应该成功更新文章', async () => {
      const created = await articleService.createArticle(mockArticleInput);
      
      // 等待一毫秒以确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const updateData = {
        title: '更新后的标题',
        content: '更新后的内容'
      };

      const updated = await articleService.updateArticle(created.id, updateData);

      expect(updated).toMatchObject({
        ...created,
        ...updateData,
        updatedAt: expect.any(Date)
      });
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('当文章不存在时应该返回null', async () => {
      const updated = await articleService.updateArticle('non-existent-id', {
        title: '更新后的标题'
      });
      expect(updated).toBeNull();
    });
  });

  describe('deleteArticle', () => {
    it('应该成功删除文章', async () => {
      const created = await articleService.createArticle(mockArticleInput);
      const success = await articleService.deleteArticle(created.id);
      expect(success).toBe(true);

      const deleted = await articleService.getArticle(created.id);
      expect(deleted).toBeNull();
    });

    it('当文章不存在时应该返回false', async () => {
      const success = await articleService.deleteArticle('non-existent-id');
      expect(success).toBe(false);
    });
  });
}); 