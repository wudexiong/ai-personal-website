import { NextResponse } from 'next/server';
import { articleService } from '@/services/articleService';
import { CreateArticleInput, UpdateArticleInput } from '@/types/article';

// 验证创建文章的输入
function validateCreateArticleInput(input: any): input is CreateArticleInput {
  return (
    typeof input === 'object' &&
    typeof input.title === 'string' &&
    typeof input.content === 'string' &&
    typeof input.author === 'object' &&
    typeof input.author.id === 'string' &&
    typeof input.author.name === 'string' &&
    (!input.summary || typeof input.summary === 'string') &&
    (!input.tags || Array.isArray(input.tags)) &&
    (!input.category || typeof input.category === 'string') &&
    (!input.status || input.status === 'draft' || input.status === 'published')
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!validateCreateArticleInput(body)) {
      return NextResponse.json(
        { error: 'Failed to create article' },
        { status: 400 }
      );
    }
    const article = await articleService.createArticle(body);
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const tags = searchParams.get('tags')?.split(',') || undefined;
    const status = (searchParams.get('status') as 'draft' | 'published') || undefined;

    const articles = await articleService.listArticles({
      category,
      tags,
      status,
    });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
} 