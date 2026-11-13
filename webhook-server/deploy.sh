
#!/bin/bash

# 将所有输出（包括报错）都追加到 webhook.log，方便你随时查看进度
exec >> /home/ubuntu/webhook.log 2>&1

echo ""
echo "=================================================="
echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] 收到推送，开始自动部署！"
echo "=================================================="

# 1. 进入项目根目录
cd /home/ubuntu/jean-blog || exit

# 2. 强制拉取最新代码
echo "📥 [1/5] 正在拉取 GitHub 最新代码..."
git fetch --all
git reset --hard origin/main
if [ $? -ne 0 ]; then
    echo "❌ 拉取代码失败，部署中止。"
    exit 1
fi

# ==========================================
# 加载 nvm 环境（让脚本认识 nvm 命令）
# ==========================================
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. 打包 blog-client (使用默认最新版)
echo "📦 [2/5] 开始打包 blog-client..."
nvm use default
cd blog-client
npm install --registry=https://registry.npmmirror.com
npm run build

# 4. 打包 blog-manage (切换到 Node 18)
echo "📦 [3/5] 开始打包 blog-manage (使用 Node 18)..."
cd ../blog-manage
nvm use 18
echo "当前 Node 版本: $(node -v)"
npm install --registry=https://registry.npmmirror.com
npm run build
nvm use default  # 切回默认 Node 版本，避免影响后续操作

# 5. 打包 back-stage2 
echo "📦 [4/5] 开始打包 back-stage2 (切回默认 Node)..."
cd ../back-stage2
npm install --registry=https://registry.npmmirror.com
npm run build

# 6. 重启后端服务
echo "🔄 [5/5] 重启后端服务..."
# 确保 pm2 也在正确的 Node 环境下执行
pm2 reload jean-blog

echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] 部署完成！"
echo "=================================================="
echo ""
