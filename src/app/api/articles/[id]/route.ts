import { NextResponse } from 'next/server';
import { articleService } from '@/services/articleService';
import { UpdateArticleInput } from '@/types/article';

interface RouteParams {
  params: {
    id: string;
  };
}

// 验证更新文章的输入
function validateUpdateArticleInput(input: any): input is UpdateArticleInput {
  if (typeof input !== 'object') return false;
  
  const allowedFields = [
    'title',
    'content',
    'summary',
    'tags',
    'category',
    'status',
    'author'
  ];

  // 检查是否包含未知字段
  const hasInvalidFields = Object.keys(input).some(
    key => !allowedFields.includes(key)
  );
  if (hasInvalidFields) return false;

  // 验证每个字段的类型
  if ('title' in input && typeof input.title !== 'string') return false;
  if ('content' in input && typeof input.content !== 'string') return false;
  if ('summary' in input && typeof input.summary !== 'string') return false;
  if ('tags' in input && !Array.isArray(input.tags)) return false;
  if ('category' in input && typeof input.category !== 'string') return false;
  if ('status' in input && !['draft', 'published'].includes(input.status)) return false;
  if ('author' in input && (
    typeof input.author !== 'object' ||
    typeof input.author.id !== 'string' ||
    typeof input.author.name !== 'string'
  )) return false;

  return true;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const article = await articleService.getArticle(params.id);
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    if (!validateUpdateArticleInput(body)) {
      return NextResponse.json(
        { error: 'Failed to update article' },
        { status: 400 }
      );
    }

    const article = await articleService.updateArticle(params.id, body);
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const success = await articleService.deleteArticle(params.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
} 