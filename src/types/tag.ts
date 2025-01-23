/**
 * 标签实体类型定义
 */
export interface Tag {
  /** 标签ID */
  id: string;
  /** 标签名称 */
  name: string;
  /** 标签描述 */
  description?: string;
  /** 标签创建时间 */
  createdAt: Date;
  /** 标签更新时间 */
  updatedAt: Date;
  /** 标签颜色 */
  color?: string;
  /** 是否启用 */
  isEnabled: boolean;
}

/**
 * 创建标签的请求参数
 */
export interface CreateTagDTO {
  name: string;
  description?: string;
  color?: string;
  isEnabled?: boolean;
}

/**
 * 更新标签的请求参数
 */
export interface UpdateTagDTO extends Partial<CreateTagDTO> {} 