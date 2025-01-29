import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArticleDialog from '../ArticleDialog';

// Mock ArticleForm 组件
jest.mock('../ArticleForm', () => {
  return function MockArticleForm({ onSubmit }: { onSubmit: () => void }) {
    return (
      <button onClick={() => onSubmit()} data-testid="mock-submit">
        模拟提交
      </button>
    );
  };
});

// Mock lucide-react
jest.mock('lucide-react', () => ({
  X: () => <span>close</span>
}));

describe('ArticleDialog', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog trigger button', () => {
    render(<ArticleDialog onSuccess={mockOnSuccess} />);
    expect(screen.getByText('新建文章')).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    render(<ArticleDialog onSuccess={mockOnSuccess} />);
    const triggerButton = screen.getByText('新建文章');
    await userEvent.click(triggerButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<ArticleDialog onSuccess={mockOnSuccess} />);
    
    const triggerButton = screen.getByText('新建文章');
    await userEvent.click(triggerButton);

    const submitButton = screen.getByTestId('mock-submit');
    await userEvent.click(submitButton);

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('closes dialog after successful submission', async () => {
    render(<ArticleDialog onSuccess={mockOnSuccess} />);
    
    const triggerButton = screen.getByText('新建文章');
    await userEvent.click(triggerButton);

    const submitButton = screen.getByTestId('mock-submit');
    await userEvent.click(submitButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('handles dialog close', async () => {
    render(<ArticleDialog onSuccess={mockOnSuccess} />);
    
    const triggerButton = screen.getByText('新建文章');
    await userEvent.click(triggerButton);

    const closeButton = screen.getByText('close');
    await userEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
}); 