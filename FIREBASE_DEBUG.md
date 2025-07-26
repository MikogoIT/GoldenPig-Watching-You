# Firebase调试指南

## 🔍 "Invalid token in path" 错误解决方案

### 1. 检查Firebase控制台设置

#### 步骤1：启用匿名认证
1. 前往 [Firebase控制台](https://console.firebase.google.com/)
2. 选择你的项目 `pig-timer-collaboration`
3. 左侧导航 → **Authentication** → **登录方法**
4. 找到 **匿名** 提供商
5. 点击 **启用** 并保存

#### 步骤2：配置Realtime Database安全规则
1. 在Firebase控制台，前往 **Realtime Database**
2. 点击 **规则** 标签
3. 替换现有规则为以下内容：

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "rooms": {
      "$roomId": {
        ".validate": "newData.hasChildren(['info', 'users', 'gameState'])",
        "info": {
          ".validate": "newData.hasChildren(['hostId', 'created', 'isActive'])"
        },
        "users": {
          "$userId": {
            ".validate": "newData.hasChildren(['name', 'isOnline', 'lastSeen'])"
          }
        },
        "gameState": {
          ".validate": "true"
        },
        "operations": {
          ".validate": "true"
        }
      }
    }
  }
}
```

4. 点击 **发布** 保存规则

#### 步骤3：验证数据库URL
确认你的数据库URL格式正确：
- 应该是：`https://pig-timer-collaboration-default-rtdb.asia-southeast1.firebasedatabase.app`
- 不应该有尾随的 `/`

### 2. 临时测试规则（仅用于开发）

如果上述规则仍然有问题，可以临时使用更宽松的规则进行测试：

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **警告：此规则允许任何人读写你的数据库，仅用于测试，不要在生产环境使用！**

### 3. 检查步骤

1. ✅ 匿名认证已启用
2. ✅ 数据库规则已配置
3. ✅ 数据库URL正确
4. ✅ 项目配置正确

### 4. 常见问题

**Q: 为什么需要匿名认证？**
A: Firebase要求用户必须经过身份验证才能访问数据库，匿名认证是最简单的方式。

**Q: 安全规则的作用是什么？**
A: 控制谁可以读写数据库的哪些部分，确保数据安全。

**Q: 如何知道配置是否成功？**
A: 刷新测试页面，控制台应该显示"✅ Firebase连接成功"而不是错误信息。
