# webhook执行脚本
#!/bin/bash

# 将所有输出（包括报错）都追加到 webhook.log，方便你随时查看进度
exec >> /home/ubuntu/webhook.log 2>&1

echo ""
echo "=================================================="
echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] 收到推送，开始自动部署！"
echo "=================================================="

# 1. 进入项目根目录
cd /home/ubuntu/jean-blog || exit

# 2. 强制拉取最新代码（防止本地修改导致冲突）
echo "📥 [1/5] 正在拉取 GitHub 最新代码..."
git fetch --all
git reset --hard origin/main
if [ $? -ne 0 ]; then
    echo "❌ 拉取代码失败，部署中止。"
    exit 1
fi

# 3. 打包 blog-client
echo "📦 [2/5] 开始打包 blog-client..."
cd blog-client
npm install --registry=https://registry.npmmirror.com
npm run build

# 4. 打包 blog-manage
echo "📦 [3/5] 开始打包 blog-manage..."
cd ../blog-manage
npm install --registry=https://registry.npmmirror.com
npm run build

# 5. 打包 back-stage2
echo "📦 [4/5] 开始打包 back-stage2..."
cd ../back-stage2
npm install --registry=https://registry.npmmirror.com
npm run build

# 6. 重启后端服务 (名字已经改成 jean-blog)
echo "🔄 [5/5] 重启后端服务..."
pm2 restart jean-blog

echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] 部署完成！"
echo "=================================================="
echo ""
EOF

# 再次赋予执行权限
chmod +x /home/ubuntu/jean-blog/deploy.sh