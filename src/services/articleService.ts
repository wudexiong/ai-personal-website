import { Article, CreateArticleInput, UpdateArticleInput } from '../types/article';
import { randomUUID } from 'crypto';

class ArticleService {
  private articles: Article[] = [];

  async createArticle(input: CreateArticleInput): Promise<Article> {
    const article: Article = {
      ...input,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.articles.push(article);
    return article;
  }

  async getArticle(id: string): Promise<Article | null> {
    return this.articles.find(article => article.id === id) || null;
  }

  async listArticles(params?: {
    category?: string;
    tags?: string[];
    status?: 'draft' | 'published';
  }): Promise<Article[]> {
    let filteredArticles = [...this.articles];

    if (params?.category) {
      filteredArticles = filteredArticles.filter(
        article => article.category === params.category
      );
    }

    if (params?.tags?.length) {
      filteredArticles = filteredArticles.filter(article =>
        article.tags?.some(tag => params.tags?.includes(tag))
      );
    }

    if (params?.status) {
      filteredArticles = filteredArticles.filter(
        article => article.status === params.status
      );
    }

    return filteredArticles;
  }

  async updateArticle(id: string, input: UpdateArticleInput): Promise<Article | null> {
    const index = this.articles.findIndex(article => article.id === id);
    if (index === -1) return null;

    const updatedArticle: Article = {
      ...this.articles[index],
      ...input,
      updatedAt: new Date(),
    };

    this.articles[index] = updatedArticle;
    return updatedArticle;
  }

  async deleteArticle(id: string): Promise<boolean> {
    const index = this.articles.findIndex(article => article.id === id);
    if (index === -1) return false;

    this.articles.splice(index, 1);
    return true;
  }
}

export const articleService = new ArticleService(); 