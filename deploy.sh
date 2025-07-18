#!/bin/bash

# 🚀 GitHub Pages 一键部署脚本
# 使用方法: ./deploy.sh "提交信息"

set -e

echo "🚀 开始部署到 GitHub Pages..."

# 检查是否提供了提交信息
if [ -z "$1" ]; then
    COMMIT_MSG="Deploy to GitHub Pages $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

echo "📝 提交信息: $COMMIT_MSG"

# 检查是否有未提交的更改
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "📦 发现未提交的更改，正在提交..."
    git add .
    git commit -m "$COMMIT_MSG"
else
    echo "✅ 没有未提交的更改"
fi

# 推送到远程仓库
echo "🔄 推送到 GitHub..."
git push origin main

echo "✨ 部署完成！"
echo "🌐 请等待几分钟，然后访问你的 GitHub Pages 网站"
echo "📊 你可以在 GitHub Actions 页面查看部署状态"
echo ""
echo "🔗 GitHub Actions: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
echo "🌐 网站地址: https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/' | sed 's/\//.github.io\//')/"
