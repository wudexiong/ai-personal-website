import { tagService } from '../tagService';
import { CreateTagDTO, UpdateTagDTO } from '@/types/tag';

describe('TagService', () => {
  beforeEach(() => {
    // 清空所有测试数据
    const tags = (tagService as any).tags;
    tags.length = 0;
  });

  describe('create', () => {
    it('应该成功创建标签', async () => {
      const createData: CreateTagDTO = {
        name: '测试标签',
        description: '这是一个测试标签',
        color: '#FF0000',
      };

      const tag = await tagService.create(createData);

      expect(tag).toEqual(expect.objectContaining({
        ...createData,
        isEnabled: true,
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }));
    });

    it('应该使用提供的启用状态', async () => {
      const createData: CreateTagDTO = {
        name: '测试标签',
        isEnabled: false,
      };

      const tag = await tagService.create(createData);

      expect(tag.isEnabled).toBe(false);
    });
  });

  describe('update', () => {
    it('应该成功更新标签', async () => {
      const tag = await tagService.create({ name: '原始标签' });
      const updateData: UpdateTagDTO = {
        name: '更新后的标签',
        description: '更新后的描述',
        color: '#00FF00',
      };

      const updatedTag = await tagService.update(tag.id, updateData);

      expect(updatedTag).toEqual(expect.objectContaining({
        id: tag.id,
        name: updateData.name,
        description: updateData.description,
        color: updateData.color,
        isEnabled: tag.isEnabled,
        createdAt: tag.createdAt,
        updatedAt: expect.any(Date),
      }));

      expect(updatedTag?.updatedAt.getTime()).toBeGreaterThan(tag.updatedAt.getTime());
    });

    it('更新不存在的标签应该返回null', async () => {
      const result = await tagService.update('不存在的ID', { name: '测试' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('应该成功删除标签', async () => {
      const tag = await tagService.create({ name: '待删除标签' });
      
      const deletedTag = await tagService.delete(tag.id);
      const findResult = await tagService.findById(tag.id);

      expect(deletedTag).toEqual(tag);
      expect(findResult).toBeNull();
    });

    it('删除不存在的标签应该返回null', async () => {
      const result = await tagService.delete('不存在的ID');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('应该按照创建时间倒序返回所有标签', async () => {
      // 创建测试数据时增加延迟，确保创建时间不同
      const tag1 = await tagService.create({ name: '标签1' });
      await new Promise(resolve => setTimeout(resolve, 10));
      const tag2 = await tagService.create({ name: '标签2' });
      await new Promise(resolve => setTimeout(resolve, 10));
      const tag3 = await tagService.create({ name: '标签3' });

      const tags = await tagService.findAll();

      expect(tags).toHaveLength(3);
      expect(tags[0].id).toBe(tag3.id);
      expect(tags[1].id).toBe(tag2.id);
      expect(tags[2].id).toBe(tag1.id);
    });
  });

  describe('findById', () => {
    it('应该返回指定ID的标签', async () => {
      const tag = await tagService.create({ name: '测试标签' });
      
      const foundTag = await tagService.findById(tag.id);
      
      expect(foundTag).toEqual(tag);
    });

    it('查找不存在的标签应该返回null', async () => {
      const result = await tagService.findById('不存在的ID');
      expect(result).toBeNull();
    });
  });

  describe('searchByName', () => {
    it('应该返回名称包含搜索关键词的标签', async () => {
      await tagService.create({ name: '前端开发' });
      await tagService.create({ name: '后端开发' });
      await tagService.create({ name: '开发工具' });

      const results = await tagService.searchByName('前端');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('前端开发');
    });

    it('搜索应该忽略大小写', async () => {
      await tagService.create({ name: 'JavaScript' });
      await tagService.create({ name: 'TypeScript' });

      const results = await tagService.searchByName('script');

      expect(results).toHaveLength(2);
      expect(results.map(tag => tag.name)).toEqual(
        expect.arrayContaining(['JavaScript', 'TypeScript'])
      );
    });

    it('没有匹配结果时应该返回空数组', async () => {
      await tagService.create({ name: '测试标签' });

      const results = await tagService.searchByName('不存在');

      expect(results).toHaveLength(0);
    });
  });
}); 