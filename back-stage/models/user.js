// 模拟用户数据存储
let users = [];
let nextId = 1;

// 用户数据模型
const User = {
  // 获取所有用户
  getAll() {
    return users;
  },
  
  // 根据ID获取用户
  getById(id) {
    const userId = parseInt(id);
    return users.find(user => user.id === userId);
  },
  
  // 创建用户
  create(userData) {
    if (!userData.name || !userData.email) {
      throw new Error('Name and email are required');
    }
    
    const newUser = {
      id: nextId++,
      name: userData.name,
      email: userData.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData
    };
    
    users.push(newUser);
    return newUser;
  },
  
  // 更新用户
  update(id, userData) {
    const userId = parseInt(id);
    const index = users.findIndex(user => user.id === userId);
    
    if (index === -1) {
      return null;
    }
    
    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date()
    };
    
    return users[index];
  },
  
  // 删除用户
  delete(id) {
    const userId = parseInt(id);
    const index = users.findIndex(user => user.id === userId);
    
    if (index === -1) {
      return false;
    }
    
    users.splice(index, 1);
    return true;
  }
};

export default User;
 