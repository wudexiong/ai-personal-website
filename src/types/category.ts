/**
 * 分类实体类型定义
 */
export interface Category {
  /** 分类ID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 分类描述 */
  description?: string;
  /** 分类创建时间 */
  createdAt: Date;
  /** 分类更新时间 */
  updatedAt: Date;
  /** 父分类ID */
  parentId?: string;
  /** 排序权重 */
  order?: number;
  /** 是否启用 */
  isEnabled: boolean;
  /** 子分类 */
  children?: Category[];
}

/**
 * 创建分类的请求参数
 */
export interface CreateCategoryDTO {
  name: string;
  description?: string;
  parentId?: string;
  order?: number;
  isEnabled?: boolean;
}

/**
 * 更新分类的请求参数
 */
export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {} 