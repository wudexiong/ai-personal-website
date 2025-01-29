import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminLayout from '../layout';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/'
}));

// Mock icons
jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <span>dashboard</span>,
  FileText: () => <span>file</span>,
  Tag: () => <span>tag</span>,
  FolderTree: () => <span>folder</span>,
  Settings: () => <span>settings</span>,
  Menu: () => <span>menu</span>,
  X: () => <span>close</span>
}));

describe('AdminLayout', () => {
  const renderComponent = () =>
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    );

  it('renders logo and navigation menu', () => {
    renderComponent();
    expect(screen.getAllByText('AI个人网站')[0]).toBeInTheDocument();
    expect(screen.getByText('仪表盘')).toBeInTheDocument();
    expect(screen.getByText('文章管理')).toBeInTheDocument();
    expect(screen.getByText('标签管理')).toBeInTheDocument();
    expect(screen.getByText('分类管理')).toBeInTheDocument();
    expect(screen.getByText('系统设置')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderComponent();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('toggles mobile menu when menu button is clicked', async () => {
    renderComponent();
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await userEvent.click(menuButton);
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('block');
  });
}); 