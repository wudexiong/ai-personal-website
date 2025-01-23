import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@/types/category';
import { randomUUID } from 'crypto';

/**
 * 分类服务类
 */
class CategoryService {
  private categories: Category[] = [];

  /**
   * 创建分类
   * @param data - 创建分类的数据
   * @returns 创建的分类
   */
  async create(data: CreateCategoryDTO): Promise<Category> {
    const category: Category = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isEnabled: data.isEnabled ?? true,
    };
    this.categories.push(category);
    return category;
  }

  /**
   * 更新分类
   * @param id - 分类ID
   * @param data - 更新的数据
   * @returns 更新后的分类
   */
  async update(id: string, data: UpdateCategoryDTO): Promise<Category | null> {
    const index = this.categories.findIndex(category => category.id === id);
    if (index === -1) return null;

    // 确保更新时间晚于原始时间
    await new Promise(resolve => setTimeout(resolve, 1));

    const updatedCategory: Category = {
      ...this.categories[index],
      ...data,
      updatedAt: new Date(),
    };

    this.categories[index] = updatedCategory;
    return updatedCategory;
  }

  /**
   * 删除分类
   * @param id - 分类ID
   * @returns 删除的分类
   */
  async delete(id: string): Promise<Category | null> {
    const index = this.categories.findIndex(category => category.id === id);
    if (index === -1) return null;

    const deletedCategory = this.categories[index];
    this.categories.splice(index, 1);
    return deletedCategory;
  }

  /**
   * 获取分类列表
   * @returns 分类列表
   */
  async findAll(): Promise<Category[]> {
    // 创建一个新数组进行排序，避免修改原数组
    const sortedCategories = [...this.categories];
    
    // 使用稳定排序
    return sortedCategories.sort((a, b) => {
      // 首先按照 order 排序（升序）
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // 如果 order 相同，按照创建时间倒序
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  /**
   * 根据ID获取分类
   * @param id - 分类ID
   * @returns 分类信息
   */
  async findById(id: string): Promise<Category | null> {
    return this.categories.find(category => category.id === id) || null;
  }

  /**
   * 获取分类树结构
   * @returns 分类树
   */
  async getCategoryTree(): Promise<Category[]> {
    // 获取所有分类并按照 order 和创建时间排序
    const allCategories = await this.findAll();
    
    // 构建父子关系映射
    const childrenMap = new Map<string | null, Category[]>();
    
    // 初始化根节点列表
    childrenMap.set(null, []);
    
    // 遍历所有分类，建立父子关系映射
    for (const category of allCategories) {
      const parentId = category.parentId ?? null;
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(category);
    }
    
    // 递归构建树结构
    const buildTreeRecursive = (parentId: string | null): Category[] => {
      const children = childrenMap.get(parentId) || [];
      return children.map(category => ({
        ...category,
        children: childrenMap.has(category.id) ? buildTreeRecursive(category.id) : undefined
      }));
    };
    
    // 返回根节点的树结构
    return buildTreeRecursive(null);
  }
}

export const categoryService = new CategoryService(); 