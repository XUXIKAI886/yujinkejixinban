# 📚 AI聊天界面文档

## 📋 文档目录

### 🚀 [Coze API集成完整指南](./COZE_API_INTEGRATION.md)
**详细的Coze API集成文档，包含：**
- 环境配置和API设置
- 完整的流式响应规范
- 核心实现代码和最佳实践
- 常见问题解决方案
- 测试验证方法

### 💻 [Coze API模板代码](./COZE_API_TEMPLATE.ts)
**可直接使用的代码模板，包含：**
- 完整的TypeScript类型定义
- 核心API调用函数
- 流式响应处理逻辑
- React Hook使用示例
- 调试和测试工具

## 🚀 快速开始

### 1. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env.local

# 配置Coze API密钥
NEXT_PUBLIC_COZE_API_KEY=your_api_key_here
NEXT_PUBLIC_COZE_BOT_ID=your_bot_id_here
```

### 2. 集成代码

```typescript
// 从模板复制核心函数
import { callCozeAPIStream, useCozeChat } from './docs/COZE_API_TEMPLATE';

// 在组件中使用
const { messages, sendMessage, isLoading } = useCozeChat();
```

### 3. 测试验证

```typescript
// 测试API连接
import { testCozeConnection } from './docs/COZE_API_TEMPLATE';

const isConnected = await testCozeConnection();
console.log('Coze API连接状态:', isConnected ? '✅ 成功' : '❌ 失败');
```

## 🔧 关键修复说明

### SSE数据格式问题
```typescript
// ❌ 错误：检查'data: '（有空格）
if (line.startsWith('data: ')) {
  const data = line.slice(6);
}

// ✅ 正确：检查'data:'（无空格）
if (line.startsWith('data:')) {
  const data = line.slice(5).trim();
}
```

### 事件类型处理
```typescript
let currentEvent = '';

// 处理事件类型行
if (line.startsWith('event:')) {
  currentEvent = line.slice(6).trim();
}

// 处理数据行时使用currentEvent
if (currentEvent === 'conversation.message.delta') {
  // 处理流式内容
}
```

## 📊 调试检查清单

当遇到问题时，按以下顺序检查：

### API层面
- [ ] `🚀 开始Coze流式API调用`
- [ ] `📥 响应状态: 200`
- [ ] `🎯 事件类型: conversation.message.delta`
- [ ] `📋 处理数据行，当前事件: conversation.message.delta`
- [ ] `📝 收到delta内容: xxx 累积内容: xxx`

### Hook层面
- [ ] `🎯 useChat收到chunk: xxx`
- [ ] `🎯 更新消息ID: xxx 会话ID: xxx`

### Store层面
- [ ] `🏪 Store updateMessage调用: {...}`
- [ ] `🏪 找到会话: xxx 消息数量: xxx`

## 🛠️ 常见问题

### Q: 流式响应无内容显示
**A**: 检查SSE数据格式解析，确保使用`data:`而不是`data: `

### Q: 事件类型识别错误
**A**: 确保正确维护`currentEvent`状态，关联事件类型和数据

### Q: 内容显示不完整
**A**: 检查delta消息累积逻辑，确保按消息ID正确累积

### Q: React组件不更新
**A**: 检查状态管理链路：API → Hook → Store → Component

## 📈 性能优化建议

1. **防抖更新**: 使用debounce避免频繁UI更新
2. **内存管理**: 及时清理资源和取消请求
3. **错误重试**: 实现指数退避重试机制
4. **缓存策略**: 合理缓存对话历史

## 🔗 相关链接

- [Coze API官方文档](https://www.coze.cn/docs/developer_guides/coze_api_overview)
- [Server-Sent Events规范](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [React状态管理](https://react.dev/learn/managing-state)

---

**最后更新**: 2025-01-17  
**维护者**: AI Assistant  
**状态**: ✅ 已验证可用
