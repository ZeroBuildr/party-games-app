# 派对游戏盒 - 多人联机版

一个支持多人实时联机的聚会小游戏集合，包含谁是卧底、数字炸弹、猜词助手三款游戏。

## ✨ 功能特性

### 🎮 三款游戏
- **🕵️ 谁是卧底** - 隐藏身份，互飙演技，支持3-10人联机
- **💣 数字炸弹** - 紧张刺激，轮流猜数字，猜中就炸
- **🤔 猜词助手** - 你比我猜/口头描述/你画我猜，海量词库

### 🌐 多人联机
- 一键创建房间，生成分享链接
- 朋友点击链接直接加入同一房间
- 实时同步游戏状态，所有人同步游戏进度
- 房主权限控制，开始游戏、设置参数

### 📱 完美适配
- 移动端优先设计，适配各种手机屏幕
- 支持振动反馈、屏幕常亮
- 流畅的动画和交互体验

### 💾 其他功能
- 战绩记录（本地存储）
- 单机模式（无网络也能玩）
- 7大词库分类，500+词汇
- 自定义游戏设置

## 🚀 快速部署

### 第一步：创建 Firebase 项目

多人联机功能需要 Firebase Realtime Database 支持。

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 点击"添加项目"，输入项目名称（如 `party-games`）
3. 关闭"启用 Google Analytics"，点击"创建项目"
4. 项目创建完成后，点击"继续"

### 第二步：启用 Realtime Database

1. 在左侧菜单选择"构建" → "Realtime Database"
2. 点击"创建数据库"
3. 选择位置（建议选新加坡或日本，离中国近速度快）
4. 安全规则选择"以测试模式启动"（后续可以修改）
5. 点击"启用"

### 第三步：获取 Firebase 配置

1. 点击项目概览页的 "</> Web" 图标（添加 Web 应用）
2. 输入应用昵称（如 `Party Games`），不需要勾选 Firebase Hosting
3. 点击"注册应用"
4. 复制 `firebaseConfig` 对象的内容，类似这样：

```javascript
const firebaseConfig = {
  apiKey: "xxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxx"
};
```

### 第四步：配置项目

打开 `js/firebase-config.js` 文件，将上面的配置替换进去：

```javascript
const firebaseConfig = {
  apiKey: "你的apiKey",
  authDomain: "你的项目.firebaseapp.com",
  databaseURL: "https://你的项目-default-rtdb.firebaseio.com",
  projectId: "你的项目",
  storageBucket: "你的项目.appspot.com",
  messagingSenderId: "你的发送者ID",
  appId: "你的应用ID"
};
```

### 第五步：设置数据库安全规则

为了防止滥用，建议设置合理的安全规则。在 Firebase 控制台的 Realtime Database → 规则中，替换为：

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true,
      "$roomId": {
        ".validate": "newData.hasChildren(['gameType', 'hostId', 'players'])",
        "players": {
          "$playerId": {
            ".validate": "newData.hasChildren(['id', 'nickname'])"
          }
        }
      }
    }
  }
}
```

点击"发布"保存规则。

### 第六步：部署到 GitHub Pages

1. 在 GitHub 上创建一个新仓库（Public 公开仓库）
2. 将本项目代码推送到仓库
3. 进入仓库 Settings → Pages
4. Source 选择 "Deploy from a branch"
5. Branch 选择 `main` / `(root)`
6. 点击 Save
7. 等待 1-2 分钟，页面会显示你的网站地址

### 第七步：开始使用！

1. 访问你的 GitHub Pages 地址
2. 点击"创建房间"，选择游戏类型，输入昵称
3. 点击"复制分享链接"，将链接发给朋友
4. 朋友点击链接，输入昵称，即可加入同一房间
5. 人齐后房主点击"开始游戏"，就可以一起玩啦！

## 🎯 使用说明

### 创建房间
1. 打开首页，点击"创建房间"
2. 选择游戏类型
3. 输入你的昵称
4. 点击"创建房间"
5. 复制分享链接发给朋友

### 加入房间
- **方式一**：点击朋友分享的链接，自动填充房间号，输入昵称加入
- **方式二**：打开首页 → 点击"加入房间" → 输入6位房间号 → 输入昵称 → 加入

### 游戏玩法

#### 谁是卧底
1. 所有玩家加入房间后，房主点击"开始游戏"
2. 系统随机分配身份（平民/卧底）和平民词/卧底词
3. 每人轮流描述自己的词语（描述阶段）
4. 全部描述完后，投票选出你认为是卧底的人
5. 得票最多的人出局，揭晓身份
6. 重复直到游戏结束
   - 所有卧底出局 → 平民胜利
   - 平民人数 ≤ 卧底人数 → 卧底胜利

#### 数字炸弹
1. 系统随机设定一个炸弹数字
2. 玩家轮流猜数字
3. 每次猜测后，安全范围会缩小
4. 猜中炸弹数字的人输！

#### 猜词助手
1. 房主选择模式（你比我猜/口头描述/你画我猜）
2. 开始后屏幕显示词语
3. 比划者表演/描述，队友猜词
4. 猜对了点"猜中了"，不会点"跳过"
5. 时间结束后统计成绩

## 📁 项目结构

```
party-games-app/
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式文件
└── js/
    ├── firebase-config.js  # Firebase 配置（需要自己填）
    ├── wordbank.js         # 词库数据
    ├── multiplayer.js      # 多人联机逻辑
    ├── single-mode.js      # 单机模式逻辑
    └── app.js              # 主应用逻辑
```

## 🎨 技术栈

- 纯前端 HTML/CSS/JavaScript，无需后端服务器
- Firebase Realtime Database 实现实时数据同步
- 响应式设计，适配各种移动设备
- 支持 PWA 相关特性（屏幕常亮等）

## 💡 常见问题

**Q: Firebase 免费吗？**
A: Firebase 有免费额度，对于小规模聚会游戏完全够用。具体额度请参考 Firebase 官网。

**Q: 最多支持多少人同时游戏？**
A: 建议每房间不超过 10 人，体验最佳。

**Q: 没有配置 Firebase 能用吗？**
A: 可以使用单机模式，所有游戏都能玩，只是需要传手机轮流操作。

**Q: 房间会保存多久？**
A: 房间数据会保留在数据库中。如果需要自动清理，可以设置 Firebase 云函数定期清理。

**Q: 能自定义词库吗？**
A: 可以，直接修改 `js/wordbank.js` 文件中的词汇即可。

## 📝 更新日志

### v2.0.0
- 🎉 新增多人联机模式，支持实时同步
- 🏠 房间系统，创建/加入/分享链接
- 👥 玩家列表，房主权限管理
- 📱 优化移动端体验
- 🔧 保留单机模式，无网络也能玩

### v1.0.0
- 初始版本
- 三款游戏：谁是卧底、数字炸弹、猜词助手
- 单机模式（传手机玩）
