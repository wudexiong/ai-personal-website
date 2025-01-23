/**
 * 文章接口定义
 */
export interface Article {
  id: string;
  title: string;
  content: string;
  authorId: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  categoryId?: string;
  tagIds?: string[];
  published?: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
}

/**
 * 创建文章的输入类型
 */
export interface CreateArticleInput {
  title: string;
  content: string;
  authorId: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  categoryId?: string;
  tagIds?: string[];
  published?: boolean;
}

/**
 * 更新文章的输入类型
 */
export type UpdateArticleInput = Partial<Omit<CreateArticleInput, 'authorId'>>; 