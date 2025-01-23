import { Tag, CreateTagDTO, UpdateTagDTO } from '@/types/tag';
import { randomUUID } from 'crypto';

/**
 * 标签服务类
 */
class TagService {
  private tags: Tag[] = [];

  /**
   * 创建标签
   * @param data - 创建标签的数据
   * @returns 创建的标签
   */
  async create(data: CreateTagDTO): Promise<Tag> {
    const tag: Tag = {
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isEnabled: data.isEnabled ?? true,
    };
    this.tags.push(tag);
    return tag;
  }

  /**
   * 更新标签
   * @param id - 标签ID
   * @param data - 更新的数据
   * @returns 更新后的标签
   */
  async update(id: string, data: UpdateTagDTO): Promise<Tag | null> {
    const index = this.tags.findIndex(tag => tag.id === id);
    if (index === -1) return null;

    // 确保更新时间晚于原始时间
    await new Promise(resolve => setTimeout(resolve, 1));

    const updatedTag: Tag = {
      ...this.tags[index],
      ...data,
      updatedAt: new Date(),
    };

    this.tags[index] = updatedTag;
    return updatedTag;
  }

  /**
   * 删除标签
   * @param id - 标签ID
   * @returns 删除的标签
   */
  async delete(id: string): Promise<Tag | null> {
    const index = this.tags.findIndex(tag => tag.id === id);
    if (index === -1) return null;

    const deletedTag = this.tags[index];
    this.tags.splice(index, 1);
    return deletedTag;
  }

  /**
   * 获取标签列表
   * @returns 标签列表
   */
  async findAll(): Promise<Tag[]> {
    // 创建一个新数组并按创建时间倒序排序
    return [...this.tags].sort((a, b) => {
      const timeA = a.createdAt.getTime();
      const timeB = b.createdAt.getTime();
      return timeB - timeA;
    });
  }

  /**
   * 根据ID获取标签
   * @param id - 标签ID
   * @returns 标签信息
   */
  async findById(id: string): Promise<Tag | null> {
    return this.tags.find(tag => tag.id === id) || null;
  }

  /**
   * 根据名称搜索标签
   * @param name - 标签名称
   * @returns 标签列表
   */
  async searchByName(name: string): Promise<Tag[]> {
    const lowercaseName = name.toLowerCase();
    return this.tags
      .filter(tag => tag.name.toLowerCase().includes(lowercaseName))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const tagService = new TagService(); 