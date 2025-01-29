'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Tags, FolderTree } from "lucide-react";

const stats = [
  {
    title: "文章总数",
    value: "12",
    icon: FileText,
    description: "3 篇草稿",
  },
  {
    title: "标签总数",
    value: "24",
    icon: Tags,
    description: "最近添加：React",
  },
  {
    title: "分类总数",
    value: "8",
    icon: FolderTree,
    description: "最近添加：技术",
  },
];

/**
 * 后台首页组件
 * @returns {JSX.Element} 首页组件
 */
export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">仪表盘</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>最近文章</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              暂无最近文章
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              暂无快速操作
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 