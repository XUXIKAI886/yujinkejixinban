# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 15 的专业 AI 机器人聊天平台，专门为美团外卖和饿了么运营提供22个专业机器人服务。项目使用 TypeScript、Tailwind CSS 和多个 AI API 提供商（Coze、DeepSeek、Gemini），并集成了 Tauri 桌面应用支持。

## 核心命令

### 开发与构建
```bash
# 开发模式（使用 Turbopack）
npm run dev

# 代码检查
npm run lint

# 生产构建
npm run build

# 导出静态文件
npm run build:export

# 启动生产服务器
npm start

# 本地服务静态文件
npm run serve
```

### 部署
```bash
# 部署到生产环境（Windows）
deploy.bat

# 部署到生产环境（Linux/Mac）
deploy.sh
```

## 技术架构

### 核心技术栈
- **前端框架**: Next.js 15 (App Router)
- **类型系统**: TypeScript 5.0
- **样式框架**: Tailwind CSS 3.4.17
- **状态管理**: Zustand 5.0.6 (持久化存储)
- **Markdown渲染**: react-markdown + rehype-highlight
- **UI组件**: Radix UI + shadcn/ui

### 多API架构设计
项目采用多API提供商架构，支持三种API服务：
- **Gemini API**: 通用AI对话服务（通过 Google AI Studio，使用 gemini-2.5-flash-lite-preview）
- **Coze API**: 专业机器人服务（22个专业Bot，每个Bot有独立ID）
- **DeepSeek API**: 小红书图文生成专用服务

**架构特点**:
- 每个机器人配置中的 `provider` 字段决定API路由（gemini/coze/deepseek）
- API调用流程在 `src/lib/api.ts` 中统一处理（1012行核心逻辑）
- 支持流式响应（SSE）和非流式响应
- Coze API 支持文件上传（图片）
- 自动消息格式转换（Gemini/Coze格式互转）

### 项目结构关键模块

#### 1. 机器人配置模块 (`src/config/models.ts`)
- 定义22个专业AI机器人，包括：

**美团外卖系列 (15个)**：
  - 关键词优化助手
  - 美团全能客服
  - 分类栏描述优化
  - 套餐搭配助手
  - 评价解释与生成
  - 店铺数据分析
  - 品牌故事生成
  - 点金推广大师
  - Logo设计助手
  - 小红书图文生成器
  - 代运营助手
  - 菜名价格提取器
  - 补单专用外卖好评
  - 相似话术生成助手
  - 外卖数据周报分析

**饿了么系列 (7个)**：
  - 饿了么分类栏描述
  - 饿了么关键词优化
  - 饿了么菜品描述
  - 饿了么评价解释助手
  - 饿了么套餐搭配助手
  - 饿了么周报
  - 饿了么日报

#### 2. API 配置模块 (`src/config/api.ts`)
- **Gemini API**: 通用对话服务
- **Coze API**: 专业机器人服务（多个 Bot ID）
- **DeepSeek API**: 小红书图文生成

#### 3. 状态管理 (`src/lib/store.ts`)
- 基于 Zustand 的全局状态管理
- **会话管理**: createNewSession、updateSession、deleteSession、clearAllSessions
- **消息管理**: addMessage、updateMessage（支持流式更新）、clearMessages
- **持久化**: 使用 zustand/middleware 的 persist 中间件
- **存储策略**: 仅持久化 sessions 和 selectedModelId 到 localStorage
- **ID生成**: 使用时间戳+随机数生成唯一ID

#### 4. 核心组件架构
```
src/
├── app/                  # Next.js 15 App Router
│   ├── layout.tsx        # 根布局（主题provider）
│   ├── page.tsx          # 主页（ChatInterface）
│   ├── test-coze/        # Coze API 测试页面
│   ├── test-deepseek/    # DeepSeek API 测试页面
│   └── test-svg-preview/ # SVG 预览测试页面
├── components/
│   ├── chat/             # 聊天核心组件
│   │   ├── ChatInterface.tsx # 主聊天界面
│   │   ├── MessageList.tsx   # 消息列表（支持欢迎语）
│   │   ├── MessageInput.tsx  # 输入组件（文件上传）
│   │   └── SVGPreviewModal.tsx # SVG预览与下载
│   ├── sidebar/          # 侧边栏组件
│   │   ├── BotSelector.tsx   # 机器人选择器
│   │   ├── ChatHistory.tsx   # 对话历史
│   │   └── ModelSelector.tsx # 模型选择器
│   ├── debug/            # 调试工具
│   │   └── TauriEnvironmentInfo.tsx # Tauri环境检测
│   └── ui/               # UI 基础组件（shadcn/ui）
│       ├── MarkdownRenderer.tsx # Markdown渲染
│       ├── theme-toggle.tsx     # 主题切换
│       └── tips-ticker.tsx      # 运营小贴士轮播
├── lib/                  # 核心逻辑库
│   ├── api.ts            # API调用（1012行）
│   ├── store.ts          # Zustand状态管理
│   ├── tauriDownload.ts  # Tauri下载功能
│   └── svgUtils.ts       # SVG工具函数
├── config/               # 配置文件
│   ├── models.ts         # 机器人配置（22个）
│   └── api.ts            # API端点配置
└── types/                # TypeScript类型定义
    └── index.ts          # 核心类型
```

### API 集成架构

#### Coze Bot 映射配置
每个专业机器人对应特定的 Coze Bot ID：

**美团外卖系列**：
- 关键词优化: `7432143655349338139`
- 美团客服: `7450790638439907355`
- 分类栏描述: `7444769224897085503`
- 套餐搭配: `7432277388740329487`
- 评价解释助手: `7434355486700568591`
- 补单专用好评: `7435167383192518675`
- 店铺分析: `7441487397063245859`
- 数据周报: `7436564709694521371`
- 菜品描述: `7432146500114792487`
- 品牌故事: `7488662536091811877`
- 点金推广: `7461438144458850340`
- Logo设计: `7529356136379219994`
- 代运营助手: `7461202295062396954`
- 菜名价格提取: `7469300056269602842`
- 相似话术: `7498302515360825407`

**饿了么系列**：
- 饿了么分类栏描述: `7444769224897085503`
- 饿了么关键词优化: `7498302515360825407`
- 饿了么菜品描述: `7432146500114792487`
- 饿了么评价解释: `7434355486700568591`
- 饿了么套餐搭配: `7540548019217776690`
- 饿了么周报: `7541341177451446287`
- 饿了么日报: `7541990904928862260`

#### API 调用流程
```
用户输入
  ↓
MessageInput.tsx (src/components/chat/MessageInput.tsx:handleSendMessage)
  ↓
添加用户消息到 store (useChatStore.addMessage)
  ↓
获取当前模型配置 (modelConfig.provider)
  ↓
路由到对应 API (src/lib/api.ts):
  ├─ provider='gemini'   → callGeminiAPIStream()
  ├─ provider='coze'     → callCozeAPIStream()
  └─ provider='deepseek' → callDeepSeekAPIStream()
  ↓
API 返回流式响应 (Server-Sent Events)
  ↓
实时更新消息内容 (useChatStore.updateMessage)
  ↓
Zustand 自动持久化 → localStorage
```

**关键点**:
- 支持文件上传（仅 Coze API）
- 流式响应使用 ReadableStream + TextDecoder
- 消息格式自动转换（Gemini ↔ Coze）
- 错误处理和重试机制

#### 关键文件关系
- `src/types/index.ts`: 核心类型定义（Message、ModelConfig、ChatSession等）
- `src/config/models.ts`: 22个机器人配置（美团15个+饿了么7个）
- `src/config/api.ts`: API端点和配置
- `src/lib/store.ts`: Zustand状态管理（持久化到localStorage）
- `src/lib/api.ts`: API调用核心逻辑（1012行，支持流式响应）
- `src/lib/tauriDownload.ts`: Tauri桌面应用下载功能
- `src/lib/tauriClipboard.ts`: Tauri桌面应用剪贴板功能
- `src/lib/svgUtils.ts`: SVG转PNG下载工具

## 开发规范

### 机器人配置规范
新增机器人时需要：
1. 在 `models.ts` 中添加配置
2. 在 `BotSelector.tsx` 中添加到界面列表
3. 在 `api.ts` 中配置 Bot ID 映射
4. 设置正确的 `provider` 字段
5. 添加 `welcomeMessage` 欢迎语
6. 配置对应的 `systemPrompt`
7. 选择合适的 `icon` 图标

### 当前机器人数量统计
- **总计**: 22个专业机器人
- **美团外卖系列**: 15个
- **饿了么系列**: 7个
- **通用工具**: 小红书图文助手

### 组件开发规范
- 所有对话、注释、文档使用中文
- 组件应支持响应式设计
- 使用 TypeScript 严格类型检查
- 遵循 shadcn/ui 组件模式

### 状态管理规范
- 使用 Zustand store 进行状态管理
- 消息更新支持流式处理
- 会话数据自动持久化到 localStorage

## 特殊功能

### SVG 图文生成
- 小红书风格图文生成器
- SVG 预览与下载功能
- 支持竖屏 400x600 尺寸
- 右下角自动添加"呈尚策划"落款

### 运营小贴士系统
- 78条专业美团外卖运营知识
- 自动轮播展示（8秒间隔）
- 支持手动切换和暂停
- 渐变图标和进度指示器

### 机器人欢迎语系统
- 15个机器人个性化欢迎语
- 空对话状态自动显示
- 包含使用指南和示例数据

## 环境变量配置

```env
# API Keys
NEXT_PUBLIC_API_KEY=sk-xxx                    # Gemini API
NEXT_PUBLIC_COZE_API_KEY=pat_xxx              # Coze API
NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-xxx           # DeepSeek API

# API 基础 URLs
NEXT_PUBLIC_DEEPSEEK_BASE_URL=https://api.deepseek.com

# Coze Bot IDs
NEXT_PUBLIC_COZE_BOT_ID=7432143655349338139   # 默认 Bot
```

## 部署说明

### 静态导出模式
项目配置了 `next.config.ts` 支持静态导出：
- 输出模式: `output: 'export'`（静态HTML导出）
- 构建目录: `distDir: 'out'`
- 图片优化: `images.unoptimized: true`（静态导出必需）
- GitHub Pages 支持: 自动配置 basePath 和 assetPrefix
- 使用 `npm run build:export` 生成静态文件到 `out/` 目录
- 支持部署到任何静态文件服务器
- 所有 API 调用通过客户端进行

### 生产部署流程
**自动化部署（推荐）**:
- Windows: 运行 `deploy.bat`
- Linux/Mac: 运行 `deploy.sh`

**手动部署**:
1. 执行构建: `npm run build:export`
2. 文件输出到: `out/` 目录
3. 部署静态文件到服务器
4. 配置域名和 HTTPS

## 调试与测试

### 测试页面
- `/test-coze` - Coze API 测试
- `/test-deepseek` - DeepSeek API 测试  
- `/test-svg-preview` - SVG 预览测试

### 常见问题排查
1. **API 调用失败**: 检查环境变量和网络连接
2. **机器人无响应**: 验证 Bot ID 和 API Key
3. **SVG 渲染问题**: 检查字体和尺寸配置
4. **状态丢失**: 确认 localStorage 可用性

## 代码质量要求

### 文件规模控制
- TypeScript 文件：≤ 200 行
- 每个目录最多 8 个文件
- 超出时必须创建子目录分层

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 TypeScript 严格模式
- 组件命名使用 PascalCase
- 函数和变量使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

### TypeScript 类型系统
核心类型定义（`src/types/index.ts`）:
```typescript
Message {
  id: string                    // 消息唯一ID
  role: 'user' | 'assistant' | 'system'
  content: string               // 消息内容
  timestamp: number             // Unix时间戳
  isStreaming?: boolean         // 流式输出中
}

ModelConfig {
  id: string                    // 模型唯一ID
  name: string                  // 显示名称
  provider?: 'gemini' | 'coze' | 'deepseek'
  welcomeMessage?: string       // 欢迎语
  systemPrompt?: string         // 系统提示词
  // ... 更多配置
}

ChatSession {
  id: string                    // 会话ID
  title: string                 // 会话标题
  messages: Message[]           // 消息列表
  modelId: string               // 使用的模型ID
  createdAt: number            // 创建时间
  updatedAt: number            // 更新时间
}
```

### 开发注意事项
- 新增机器人时必须更新 `src/config/models.ts` 和 API映射
- 所有API调用都要通过 `src/lib/api.ts` 统一处理
- 流式响应处理使用 Server-Sent Events (SSE)
- 文件上传仅支持 Coze API (图片格式)
- Markdown 语法会被自动清理为纯文本（针对Coze输出）

## 关键架构决策

### 为什么使用客户端API调用？
- **静态导出需求**: 项目使用 `output: 'export'` 生成静态HTML
- **无服务器部署**: 支持部署到 GitHub Pages、Vercel、Netlify等静态托管
- **Tauri集成**: 桌面应用需要直接调用API
- **API密钥**: 使用 `NEXT_PUBLIC_*` 环境变量，客户端可访问

### 为什么使用 Zustand？
- **简单轻量**: 相比 Redux 更简洁，学习曲线低
- **TypeScript友好**: 完整的类型推导支持
- **持久化**: 内置 persist 中间件，自动同步到 localStorage
- **无Provider包裹**: 直接使用 hooks，无需 Context Provider

### 为什么支持多个API提供商？
- **专业分工**: Coze专注美团外卖，DeepSeek专注图文生成
- **成本优化**: 不同API价格不同，可灵活选择
- **容错备份**: 单个API故障时可切换到其他提供商
- **功能互补**: Coze支持文件上传，Gemini通用对话能力强

### Next.js 配置关键点
```typescript
// next.config.ts
output: 'export'              // 静态导出模式
images.unoptimized: true      // 禁用图片优化（静态导出必需）
distDir: 'out'                // 输出到 out/ 目录
eslint.ignoreDuringBuilds     // 生产构建忽略 lint 错误
typescript.ignoreBuildErrors  // 生产构建忽略 TS 错误
```

## Tauri 桌面应用集成

### 环境自动检测
项目支持浏览器和 Tauri 双环境运行：
- `src/lib/tauriDownload.ts` 提供 `isTauriEnvironment()` 函数自动检测
- 下载功能会根据环境自动选择实现方式
- 浏览器: 使用 `<a download>` 方式
- Tauri: 使用 Dialog API + FS API

### Tauri 下载功能
核心函数（位于 `src/lib/tauriDownload.ts`）:
- `downloadImage()`: 图片下载（PNG/JPG/SVG/GIF/WEBP）
- `downloadTable()`: 表格下载（CSV/Excel）
- `downloadBlob()`: 通用 Blob 下载

### Tauri 剪贴板功能
核心函数（位于 `src/lib/tauriClipboard.ts`）:
- `copyToClipboard()`: 复制文本到剪贴板（自动环境检测）
- `readFromClipboard()`: 从剪贴板读取文本
- `fallbackCopyToClipboard()`: 降级方案（使用 execCommand）

**使用场景**:
- 消息复制功能（MessageBubble 组件）
- 自动检测环境并选择最佳实现
- 浏览器: 使用 Clipboard API
- Tauri: 使用 plugin:clipboard-manager
- 降级: 使用 document.execCommand

### 调试工具
- 使用 `<TauriEnvironmentInfo />` 组件（位于 `src/components/debug/TauriEnvironmentInfo.tsx`）
- 显示当前运行环境、API 可用性等调试信息
- 页面右下角显示调试面板

### 相关文档
- `TAURI_DOWNLOAD_QUICK_START.md`: 快速集成指南
- `TAURI_DOWNLOAD_INTEGRATION_GUIDE.md`: 完整技术文档
- `TAURI_INTEGRATION_STATUS.md`: 集成状态检查清单