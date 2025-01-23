import { categoryService } from '../categoryService';
import { CreateCategoryDTO, UpdateCategoryDTO } from '@/types/category';

describe('CategoryService', () => {
  beforeEach(() => {
    // 清空所有测试数据
    const categories = (categoryService as any).categories;
    categories.length = 0;
  });

  describe('create', () => {
    it('应该成功创建分类', async () => {
      const createData: CreateCategoryDTO = {
        name: '测试分类',
        description: '这是一个测试分类',
      };

      const category = await categoryService.create(createData);

      expect(category).toEqual(expect.objectContaining({
        ...createData,
        isEnabled: true,
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }));
    });

    it('应该使用提供的启用状态', async () => {
      const createData: CreateCategoryDTO = {
        name: '测试分类',
        isEnabled: false,
      };

      const category = await categoryService.create(createData);

      expect(category.isEnabled).toBe(false);
    });
  });

  describe('update', () => {
    it('应该成功更新分类', async () => {
      const category = await categoryService.create({ name: '原始分类' });
      const updateData: UpdateCategoryDTO = {
        name: '更新后的分类',
        description: '更新后的描述',
      };

      const updatedCategory = await categoryService.update(category.id, updateData);

      expect(updatedCategory).toEqual(expect.objectContaining({
        id: category.id,
        name: updateData.name,
        description: updateData.description,
        isEnabled: category.isEnabled,
        createdAt: category.createdAt,
        updatedAt: expect.any(Date),
      }));

      expect(updatedCategory?.updatedAt.getTime()).toBeGreaterThan(category.updatedAt.getTime());
    });

    it('更新不存在的分类应该返回null', async () => {
      const result = await categoryService.update('不存在的ID', { name: '测试' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('应该成功删除分类', async () => {
      const category = await categoryService.create({ name: '待删除分类' });
      
      const deletedCategory = await categoryService.delete(category.id);
      const findResult = await categoryService.findById(category.id);

      expect(deletedCategory).toEqual(category);
      expect(findResult).toBeNull();
    });

    it('删除不存在的分类应该返回null', async () => {
      const result = await categoryService.delete('不存在的ID');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('应该按照order和createdAt排序返回所有分类', async () => {
      // 创建测试数据时增加延迟，确保创建时间不同
      const category1 = await categoryService.create({ name: '分类1', order: 2 });
      await new Promise(resolve => setTimeout(resolve, 10));
      const category2 = await categoryService.create({ name: '分类2', order: 1 });
      await new Promise(resolve => setTimeout(resolve, 10));
      const category3 = await categoryService.create({ name: '分类3', order: 1 });

      const categories = await categoryService.findAll();

      // 验证排序结果
      expect(categories).toHaveLength(3);
      // 验证 order 相同时按创建时间倒序排序
      const order1Categories = categories.filter(c => c.order === 1);
      expect(order1Categories).toHaveLength(2);
      expect(order1Categories[0].createdAt.getTime()).toBeGreaterThan(order1Categories[1].createdAt.getTime());
      // 验证 order 不同时按 order 升序排序
      expect(categories.map(c => c.order)).toEqual([1, 1, 2]);
    });
  });

  describe('findById', () => {
    it('应该返回指定ID的分类', async () => {
      const category = await categoryService.create({ name: '测试分类' });
      
      const foundCategory = await categoryService.findById(category.id);
      
      expect(foundCategory).toEqual(category);
    });

    it('查找不存在的分类应该返回null', async () => {
      const result = await categoryService.findById('不存在的ID');
      expect(result).toBeNull();
    });
  });

  describe('getCategoryTree', () => {
    it('应该返回正确的分类树结构', async () => {
      // 创建测试数据时增加延迟，确保创建时间不同
      const parent = await categoryService.create({ name: '父分类' });
      await new Promise(resolve => setTimeout(resolve, 10));
      const child1 = await categoryService.create({ 
        name: '子分类1',
        parentId: parent.id,
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      const child2 = await categoryService.create({
        name: '子分类2',
        parentId: parent.id,
      });
      await new Promise(resolve => setTimeout(resolve, 10));
      const grandChild = await categoryService.create({
        name: '孙分类',
        parentId: child1.id,
      });

      const tree = await categoryService.getCategoryTree();

      expect(tree).toHaveLength(1);
      expect(tree[0]).toEqual(expect.objectContaining({
        id: parent.id,
        name: parent.name,
        children: expect.arrayContaining([
          expect.objectContaining({
            id: child1.id,
            name: child1.name,
            children: expect.arrayContaining([
              expect.objectContaining({
                id: grandChild.id,
                name: grandChild.name,
              })
            ])
          }),
          expect.objectContaining({
            id: child2.id,
            name: child2.name,
          })
        ])
      }));
    });
  });
}); 