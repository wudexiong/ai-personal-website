import { NextRequest, NextResponse } from 'next/server';
import { ArticleService } from '@/services/articleService';
import { UpdateArticleInput } from '@/types/article';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * 验证更新文章的输入
 */
function validateUpdateArticleInput(input: any): input is UpdateArticleInput {
  if (!input || typeof input !== 'object') return false;
  
  const allowedFields = [
    'title',
    'content',
    'excerpt',
    'coverImage',
    'categoryId',
    'tagIds',
    'published',
    'slug'
  ];

  // 检查是否包含未知字段
  const hasInvalidFields = Object.keys(input).some(
    key => !allowedFields.includes(key)
  );
  if (hasInvalidFields) return false;

  // 验证每个字段的类型
  if ('title' in input && typeof input.title !== 'string') return false;
  if ('content' in input && typeof input.content !== 'string') return false;
  if ('excerpt' in input && typeof input.excerpt !== 'string') return false;
  if ('coverImage' in input && typeof input.coverImage !== 'string') return false;
  if ('categoryId' in input && typeof input.categoryId !== 'string') return false;
  if ('tagIds' in input && !Array.isArray(input.tagIds)) return false;
  if ('published' in input && typeof input.published !== 'boolean') return false;
  if ('slug' in input && typeof input.slug !== 'string') return false;

  return true;
}

/**
 * 验证文章ID格式
 * @param id - 文章ID
 * @returns 如果ID格式有效则返回true,否则返回false
 */
function validateArticleId(id: string): boolean {
  return typeof id === 'string' && /^[a-zA-Z0-9]+$/.test(id)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  if (!validateArticleId(id)) {
    return NextResponse.json(
      { error: '文章ID格式无效' },
      { status: 400 }
    )
  }

  try {
    const article = await ArticleService.getArticle({ id })
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json(article)
  } catch (error) {
    console.error('获取文章失败:', error)
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!validateArticleId(id)) {
    return NextResponse.json(
      { error: '文章ID格式无效' },
      { status: 400 }
    )
  }

  let body
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json(
      { error: '请求体格式无效' },
      { status: 400 }
    )
  }

  if (!validateUpdateArticleInput(body)) {
    return NextResponse.json(
      { error: '更新数据格式无效' },
      { status: 400 }
    )
  }

  try {
    const article = await ArticleService.updateArticle(id, body)
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json(article)
  } catch (error) {
    console.error('更新文章失败:', error)
    return NextResponse.json(
      { error: '更新文章失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  if (!validateArticleId(id)) {
    return NextResponse.json(
      { error: '文章ID格式无效' },
      { status: 400 }
    )
  }

  try {
    const article = await ArticleService.deleteArticle(id)
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      )
    }
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('删除文章失败:', error)
    return NextResponse.json(
      { error: '删除文章失败' },
      { status: 500 }
    )
  }
} 