# 五子棋游戏 (Gobang Game)

## 项目简介
一个基于 Web 技术的五子棋双人对战游戏，拥有精致的木纹棋盘和立体棋子效果。

## 功能特性
- 标准的 15×15 棋盘
- 黑白双人对战模式
- 实时显示当前执棋方
- 上一步棋子高亮标记
- 悔棋功能
- 重新开始游戏
- 响应式设计，适配移动端

## 技术栈
- HTML5
- CSS3 (Flexbox, CSS 变量, 动画)
- JavaScript (ES6+)
- Canvas API

## 快速开始

### 方式一：直接打开
双击 `index.html` 文件即可在浏览器中打开游戏。

### 方式二：本地服务器
```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js
npx http-server
```

然后访问 `http://localhost:8000`

## 游戏玩法
1. 黑方先行，点击棋盘交叉点落子
2. 双方轮流落子，在横、竖、斜任意方向连成五子即获胜
3. 游戏结束后可选择"再来一局"

## 项目结构
```
gobang-game/
├── index.html      # 主页面
├── css/
│   └── style.css   # 样式文件
├── js/
│   └── game.js     # 游戏逻辑
└── README.md       # 项目文档
```

## 在线体验
https://fang615version.github.io/gobang-game/

## 开源协议
MIT License
