'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { ComponentProps } from 'react';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // 自定义标题样式
          h1: ({ children, ...props }) => (
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-base font-semibold mb-2 text-gray-900 dark:text-white" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-xs font-semibold mb-2 text-gray-900 dark:text-white" {...props}>
              {children}
            </h6>
          ),
          
          // 段落样式
          p: ({ children, ...props }) => (
            <p className="mb-3 leading-relaxed text-gray-800 dark:text-gray-200 last:mb-0" {...props}>
              {children}
            </p>
          ),
          
          // 列表样式
          ul: ({ children, ...props }) => (
            <ul className="mb-3 ml-4 space-y-1 list-disc text-gray-800 dark:text-gray-200 last:mb-0" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="mb-3 ml-4 space-y-1 list-decimal text-gray-800 dark:text-gray-200 last:mb-0" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-relaxed" {...props}>
              {children}
            </li>
          ),
          
          // 引用样式
          blockquote: ({ children, ...props }) => (
            <blockquote className="mb-3 pl-3 border-l-3 border-blue-500 bg-blue-50 dark:bg-blue-900/20 py-2 italic text-gray-700 dark:text-gray-300 rounded-r last:mb-0" {...props}>
              {children}
            </blockquote>
          ),
          
          // 代码样式
          code: ({ inline, className, children, ...props }: ComponentProps<'code'> & { inline?: boolean }) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className} block`} {...props}>
                {children}
              </code>
            );
          },
          
          // 代码块样式
          pre: ({ children, ...props }) => (
            <pre className="mb-3 p-3 bg-gray-900 dark:bg-gray-900 rounded-lg overflow-x-auto text-sm last:mb-0" {...props}>
              {children}
            </pre>
          ),
          
          // 链接样式
          a: ({ children, ...props }) => (
            <a className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors" {...props}>
              {children}
            </a>
          ),
          
          // 表格样式
          table: ({ children, ...props }) => (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700" {...props}>
              {children}
            </td>
          ),
          
          // 分隔线样式
          hr: ({ ...props }) => (
            <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />
          ),
          
          // 强调样式
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-gray-900 dark:text-white" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-gray-800 dark:text-gray-200" {...props}>
              {children}
            </em>
          ),
          
          // 删除线样式
          del: ({ children, ...props }) => (
            <del className="line-through text-gray-500 dark:text-gray-400" {...props}>
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
