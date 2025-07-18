# 🚀 GitHub Pages 部署指南

本项目已经配置好了自动部署到GitHub Pages的功能。按照以下步骤即可完成部署。

## 📋 部署步骤

### 1️⃣ **推送代码到GitHub**

```bash
# 如果还没有Git仓库，先初始化
git init
git add .
git commit -m "Initial commit"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/your-repository.git

# 推送到main分支
git branch -M main
git push -u origin main
```

### 2️⃣ **配置GitHub Secrets**

在GitHub仓库中设置以下环境变量：

1. 进入你的GitHub仓库
2. 点击 `Settings` → `Secrets and variables` → `Actions`
3. 点击 `New repository secret` 添加以下变量：

```
NEXT_PUBLIC_COZE_API_KEY=你的Coze API密钥
NEXT_PUBLIC_COZE_BASE_URL=https://api.coze.com
NEXT_PUBLIC_GEMINI_API_KEY=你的Gemini API密钥（可选）
NEXT_PUBLIC_GEMINI_BASE_URL=https://generativelanguage.googleapis.com
```

### 3️⃣ **启用GitHub Pages**

1. 在GitHub仓库中，点击 `Settings`
2. 滚动到 `Pages` 部分
3. 在 `Source` 下选择 `GitHub Actions`
4. 保存设置

### 4️⃣ **触发部署**

推送代码到main分支会自动触发部署：

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## 🔧 本地测试静态导出

在部署前，你可以本地测试静态导出：

```bash
# 安装依赖
npm install

# 构建静态版本
npm run build

# 预览构建结果（可选）
npx serve out
```

## 📱 访问部署的网站

部署成功后，你的网站将在以下地址可用：
```
https://your-username.github.io/your-repository-name/
```

## ⚠️ 注意事项

### API密钥安全
- ✅ 所有API密钥都通过GitHub Secrets安全管理
- ✅ 不会在代码中暴露敏感信息
- ✅ 支持多个API提供商（Coze、Gemini等）

### 静态部署限制
- ✅ 纯前端应用，无服务端依赖
- ✅ 所有API调用都是客户端发起
- ✅ 支持所有现代浏览器

### 自动部署
- ✅ 推送到main分支自动部署
- ✅ 支持手动触发部署
- ✅ 部署状态可在Actions页面查看

## 🛠️ 故障排除

### 部署失败
1. 检查GitHub Actions日志
2. 确认所有必需的Secrets已设置
3. 确认代码没有语法错误

### 页面无法访问
1. 确认GitHub Pages已启用
2. 检查仓库是否为公开状态
3. 等待几分钟让DNS生效

### API调用失败
1. 检查API密钥是否正确设置
2. 确认API服务商的配额和限制
3. 查看浏览器控制台的错误信息

## 📞 获取帮助

如果遇到问题，可以：
1. 查看GitHub Actions的部署日志
2. 检查浏览器开发者工具的控制台
3. 在项目Issues中提问

---

**🎉 恭喜！你的AI机器人平台现在已经成功部署到GitHub Pages了！**
