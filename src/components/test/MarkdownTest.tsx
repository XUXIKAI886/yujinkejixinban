'use client';

import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

const testMarkdown = `# 这是一级标题

## 这是二级标题

### 这是三级标题

这是一个普通段落，包含**粗体文字**和*斜体文字*，还有~~删除线文字~~。

## 列表示例

### 无序列表
- 第一项
- 第二项
  - 嵌套项目1
  - 嵌套项目2
- 第三项

### 有序列表
1. 第一步
2. 第二步
3. 第三步

## 代码示例

这是行内代码：\`console.log('Hello World')\`

### JavaScript代码块
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome, \${name}\`;
}

const user = "张三";
greet(user);
\`\`\`

### Python代码块
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算前10个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

## 引用

> 这是一个引用块
> 
> 可以包含多行内容
> 
> > 这是嵌套引用

## 链接

这是一个[链接示例](https://example.com)

## 表格

| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 25   | 工程师 |
| 李四 | 30   | 设计师 |
| 王五 | 28   | 产品经理 |

## 分隔线

---

## 任务列表

- [x] 已完成的任务
- [ ] 未完成的任务
- [x] 另一个已完成的任务

## 强调

**这是粗体文字**

*这是斜体文字*

***这是粗斜体文字***

## 数学公式（如果支持）

这是行内公式：$E = mc^2$

这是块级公式：
$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$
`;

export function MarkdownTest() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Markdown渲染测试
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <MarkdownRenderer content={testMarkdown} />
      </div>
    </div>
  );
}
