import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArticleForm from '../ArticleForm';

// Mock Select component
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, defaultValue }: any) => (
    <div>
      <button onClick={() => onValueChange && onValueChange(defaultValue)}>
        {children}
      </button>
    </div>
  ),
  SelectTrigger: ({ children }: any) => <span>选择{children}</span>,
  SelectValue: ({ children }: any) => <span>{children}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => (
    <div data-value={value}>{children}</div>
  )
}));

// Mock icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <span>chevron-down</span>
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => {
  const errors = {
    title: { type: 'required', message: '标题不能为空' },
    content: { type: 'required', message: '内容不能为空' },
    category: { type: 'required', message: '请选择分类' },
  };

  return {
    useForm: () => ({
      handleSubmit: (onSubmit: any) => (e: any) => {
        e.preventDefault();
        onSubmit({
          title: '测试文章',
          content: '测试内容',
          category: 'tech',
          status: 'draft'
        });
      },
      control: {
        _formState: {},
        _defaultValues: {},
        _getWatch: jest.fn(),
        _formValues: {},
        _options: { shouldUnregister: false },
        _updateDisabledField: jest.fn(),
      },
      formState: {
        errors,
        isSubmitting: false,
        isDirty: false,
        isValid: false,
      },
      register: jest.fn(),
      unregister: jest.fn(),
      getFieldState: jest.fn().mockImplementation((name) => ({
        invalid: true,
        isDirty: false,
        isTouched: false,
        error: errors[name as keyof typeof errors],
      })),
      _removeUnmounted: jest.fn(),
      _updateDisabledField: jest.fn(),
    }),
    useFormContext: () => ({
      control: {
        _formState: {},
        _defaultValues: {},
        _getWatch: jest.fn(),
        _formValues: {},
        _options: { shouldUnregister: false },
        _updateDisabledField: jest.fn(),
      },
      formState: {
        errors: errors,
        isSubmitting: false,
        isDirty: false,
        isValid: false,
      },
      register: jest.fn(),
      unregister: jest.fn(),
      getFieldState: jest.fn().mockImplementation((name) => ({
        invalid: true,
        isDirty: false,
        isTouched: false,
        error: errors[name as keyof typeof errors],
      })),
      _removeUnmounted: jest.fn(),
      _updateDisabledField: jest.fn(),
    }),
    Controller: ({ render }: any) => render({ field: { value: '', onChange: jest.fn() } }),
    FormProvider: ({ children }: any) => <div>{children}</div>,
  };
});

describe('ArticleForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <ArticleForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        initialData={{
          title: '测试文章',
          content: '测试内容',
          category: 'tech',
          status: 'draft'
        }}
      />
    );

    expect(screen.getByLabelText('标题')).toBeInTheDocument();
    expect(screen.getByLabelText('内容')).toBeInTheDocument();
    expect(screen.getByText('分类')).toBeInTheDocument();
    expect(screen.getByText('状态')).toBeInTheDocument();
  });

  it('displays validation errors', async () => {
    const mockSubmit = jest.fn();
    const mockCancel = jest.fn();

    render(
      <ArticleForm
        onSubmit={mockSubmit}
        onCancel={mockCancel}
      />
    );

    const submitButton = screen.getByText('保存');
    await userEvent.click(submitButton);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(screen.getAllByText('标题不能为空')).toHaveLength(1);
    expect(screen.getAllByText('内容不能为空')).toHaveLength(1);
    expect(screen.getAllByText('请选择分类')).toHaveLength(1);
  });

  it('handles form submission', async () => {
    const mockSubmit = jest.fn();
    render(
      <ArticleForm
        onSubmit={mockSubmit}
        onCancel={mockOnCancel}
        initialData={{
          title: '测试文章',
          content: '测试内容',
          category: 'tech',
          status: 'draft'
        }}
      />
    );

    const submitButton = screen.getByRole('button', { name: '保存' });
    await userEvent.click(submitButton);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockSubmit).toHaveBeenCalledWith({
      title: '测试文章',
      content: '测试内容',
      category: 'tech',
      status: 'draft'
    });
  });

  it('handles form cancellation', async () => {
    render(
      <ArticleForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: '取消' });
    await userEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
}); 