import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 为GitHub Pages部署配置
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  },
  // 基础路径配置（如果部署到子目录，如 /repository-name）
  basePath: process.env.GITHUB_PAGES ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || ''}` : '',
  assetPrefix: process.env.GITHUB_PAGES ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || ''}` : '',
  // 确保静态导出
  distDir: 'out',
  // 禁用服务端功能
  experimental: {
    appDir: true,
  },
  // ESLint配置
  eslint: {
    // 在生产构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  // TypeScript配置
  typescript: {
    // 在生产构建时忽略TypeScript错误
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
