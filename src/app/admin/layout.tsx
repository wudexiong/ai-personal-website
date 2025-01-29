'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Tag,
  FolderTree,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    title: '仪表盘',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: '文章管理',
    href: '/admin/articles',
    icon: FileText
  },
  {
    title: '标签管理',
    href: '/admin/tags',
    icon: Tag
  },
  {
    title: '分类管理',
    href: '/admin/categories',
    icon: FolderTree
  },
  {
    title: '系统设置',
    href: '/admin/settings',
    icon: Settings
  }
];

/**
 * 后台管理布局组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @returns {JSX.Element} 布局组件
 */
export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      {/* Mobile navigation bar */}
      <div className="flex items-center justify-between border-b p-4 lg:hidden">
        <Link href="/admin" className="text-xl font-bold">
          AI个人网站
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isMobileMenuOpen ? 'block' : 'hidden'
          } fixed inset-y-0 z-50 w-72 border-r bg-background lg:block lg:translate-x-0`}
        >
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/admin" className="text-xl font-bold">
              AI个人网站
            </Link>
          </div>
          <nav className="space-y-1 p-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:pl-72">{children}</main>
      </div>
    </div>
  );
} 