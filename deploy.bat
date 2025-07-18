@echo off
REM 🚀 GitHub Pages 一键部署脚本 (Windows版本)
REM 使用方法: deploy.bat "提交信息"

echo 🚀 开始部署到 GitHub Pages...

REM 设置提交信息
if "%~1"=="" (
    set "COMMIT_MSG=Deploy to GitHub Pages %date% %time%"
) else (
    set "COMMIT_MSG=%~1"
)

echo 📝 提交信息: %COMMIT_MSG%

REM 检查Git状态并提交更改
echo 📦 检查并提交更改...
git add .
git commit -m "%COMMIT_MSG%"

REM 推送到远程仓库
echo 🔄 推送到 GitHub...
git push origin main

echo.
echo ✨ 部署完成！
echo 🌐 请等待几分钟，然后访问你的 GitHub Pages 网站
echo 📊 你可以在 GitHub Actions 页面查看部署状态
echo.
echo 💡 提示：如果是首次部署，请确保已经：
echo    1. 在 GitHub 仓库设置中启用了 Pages
echo    2. 在 Secrets 中添加了必要的 API 密钥
echo.
pause
