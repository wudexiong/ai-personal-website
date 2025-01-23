import { NextRequest, NextResponse } from 'next/server';
import { ArticleService } from '@/services/articleService';
import { CreateArticleInput } from '@/types/article';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * 验证创建文章的输入
 */
function validateCreateArticleInput(input: any): input is CreateArticleInput {
  if (!input || typeof input !== 'object') {
    return false;
  }

  return (
    typeof input.title === 'string' &&
    typeof input.content === 'string' &&
    typeof input.authorId === 'string' &&
    typeof input.slug === 'string' &&
    (!input.excerpt || typeof input.excerpt === 'string') &&
    (!input.coverImage || typeof input.coverImage === 'string') &&
    (!input.categoryId || typeof input.categoryId === 'string') &&
    (!input.tagIds || Array.isArray(input.tagIds)) &&
    (!input.published || typeof input.published === 'boolean')
  );
}

/**
 * 验证标签格式是否有效
 * @param tags 标签数组
 * @returns 是否有效
 */
function validateTags(tags: string[]): boolean {
  return tags.every(tag => /^[a-zA-Z0-9-]+$/.test(tag) && !tag.includes('--'))
}

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON format' },
      { status: 400 }
    );
  }

  if (!validateCreateArticleInput(body)) {
    return NextResponse.json(
      { error: 'Invalid article data' },
      { status: 400 }
    );
  }

  try {
    const article = await ArticleService.createArticle(body);
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Failed to create article:', error);
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database operation failed' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const tagId = searchParams.get('tagId') || undefined;
    const authorId = searchParams.get('authorId') || undefined;
    const published = searchParams.get('published') === 'true' ? true : 
                     searchParams.get('published') === 'false' ? false : undefined;
    const searchQuery = searchParams.get('searchQuery') || undefined;
    const page = Number(searchParams.get('page')) || undefined;
    const limit = Number(searchParams.get('limit')) || undefined;

    // 验证标签参数
    const tagsParam = searchParams.get('tags');
    let tags: string[] | undefined;
    if (tagsParam) {
      tags = tagsParam.split(',').filter(Boolean); // 过滤掉空字符串
      if (!validateTags(tags)) {
        return NextResponse.json(
          { error: '标签格式无效' },
          { status: 400 }
        );
      }
    }

    // 验证状态参数
    if (searchParams.has('status') && !['draft', 'published'].includes(searchParams.get('status')!)) {
      return NextResponse.json(
        { error: '状态值无效' },
        { status: 400 }
      );
    }

    const articles = await ArticleService.getArticles({
      categoryId,
      tagId,
      authorId,
      published,
      searchQuery,
      page,
      limit,
      tags
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json(
      { error: '获取文章列表失败' },
      { status: 500 }
    );
  }
} 