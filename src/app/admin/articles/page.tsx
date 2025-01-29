'use client';

import React from 'react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ArticleDialog from './components/ArticleDialog';

interface Article {
  id: number;
  title: string;
  status: string;
  category: string;
  createdAt: string;
}

/**
 * 文章管理页面组件
 * @returns {JSX.Element} 文章管理界面
 */
export default function ArticlesPage() {
  // 模拟数据，后续会替换为真实API调用
  const [articles] = useState<Article[]>([
    {
      id: 1,
      title: '示例文章1',
      status: '已发布',
      category: '技术',
      createdAt: '2024-01-23',
    },
    {
      id: 2,
      title: '示例文章2',
      status: '草稿',
      category: '生活',
      createdAt: '2024-01-24',
    },
  ]);

  const handleCreate = async (data: any) => {
    console.log('Create article:', data);
    // TODO: 调用创建文章API
  };

  const handleEdit = async (data: any) => {
    console.log('Edit article:', data);
    // TODO: 调用编辑文章API
  };

  const handleDelete = async (id: number) => {
    console.log('Delete article:', id);
    // TODO: 调用删除文章API
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">文章管理</h1>
        <ArticleDialog
          mode="create"
          trigger={
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              新建文章
            </Button>
          }
          onSuccess={handleCreate}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>{article.title}</TableCell>
                  <TableCell>{article.status}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>{article.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <ArticleDialog
                        mode="edit"
                        trigger={
                          <Button variant="ghost" size="icon">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        }
                        initialData={{
                          title: article.title,
                          content: '', // TODO: 从API获取完整内容
                          category: article.category,
                          status: article.status,
                        }}
                        onSuccess={(data) => handleEdit({ ...data, id: article.id })}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(article.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 