import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArticlesPage from '../page';

interface ArticleDialogProps {
  onSuccess: (data: any) => void;
  mode: 'create' | 'edit';
  initialData?: {
    title: string;
    content: string;
    category: string;
    status: string;
  };
}

// Mock ArticleDialog component
jest.mock('../components/ArticleDialog', () => ({
  __esModule: true,
  default: ({ onSuccess, mode, initialData }: ArticleDialogProps) => (
    <button onClick={() => onSuccess(initialData)}>
      {mode === 'create' ? '新建文章' : '编辑文章'}
    </button>
  )
}));

// Mock icons
jest.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: () => <span>plus</span>,
  PencilIcon: () => <span>edit</span>,
  TrashIcon: () => <span>delete</span>
}));

describe('ArticlesPage', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    render(<ArticlesPage />);
  };

  it('renders article list', () => {
    renderComponent();
    expect(screen.getByText('文章管理')).toBeInTheDocument();
    expect(screen.getByText('示例文章1')).toBeInTheDocument();
    expect(screen.getByText('示例文章2')).toBeInTheDocument();
  });

  it('handles create article action', async () => {
    renderComponent();
    const createButton = screen.getByRole('button', { name: '新建文章' });
    await userEvent.click(createButton);
    expect(console.log).toHaveBeenCalledWith('Create article:', undefined);
  });

  it('handles edit article action', async () => {
    renderComponent();
    const editButtons = screen.getAllByRole('button', { name: '编辑文章' });
    await userEvent.click(editButtons[0]); // 点击第一个编辑按钮
    expect(console.log).toHaveBeenCalledWith('Edit article:', {
      title: '示例文章1',
      content: '',
      category: '技术',
      status: '已发布',
      id: 1
    });
  });

  it('handles delete article action', async () => {
    renderComponent();
    const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
    await userEvent.click(deleteButtons[0]); // 点击第一个删除按钮
    expect(console.log).toHaveBeenCalledWith('Delete article:', 1);
  });
}); 