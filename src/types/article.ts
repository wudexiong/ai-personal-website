export interface Article {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags?: string[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published';
  author: {
    id: string;
    name: string;
  };
}

export type CreateArticleInput = Omit<Article, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateArticleInput = Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>; 