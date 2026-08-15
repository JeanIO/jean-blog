const stick = document.getElementById('stick');

// 按键状态
const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

// 移动范围
const maxMove = 25;

// 监听按键按下
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp': keys.up = true; break;
    case 'ArrowDown': keys.down = true; break;
    case 'ArrowLeft': keys.left = true; break;
    case 'ArrowRight': keys.right = true; break;
  }
  updateStick();
});

// 监听按键松开
window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'ArrowUp': keys.up = false; break;
    case 'ArrowDown': keys.down = false; break;
    case 'ArrowLeft': keys.left = false; break;
    case 'ArrowRight': keys.right = false; break;
  }
  updateStick();
});

// 更新摇杆位置与倾斜
function updateStick() {
  let x = 0;
  let y = 0;

  if (keys.up) y -= maxMove;
  if (keys.down) y += maxMove;
  if (keys.left) x -= maxMove;
  if (keys.right) x += maxMove;

  // 限制斜向移动的幅度，防止超出范围
  const dist = Math.sqrt(x * x + y * y);
  if (dist > maxMove) {
    const ratio = maxMove / dist;
    x *= ratio;
    y *= ratio;
  }

  // 计算倾斜角度（模拟3D效果）
  const rotateX = -y * 0.8; // 上下倾斜
  const rotateY = x * 0.8;  // 左右倾斜

  // 应用变换：位移 + 旋转
  stick.style.transform = `
    translate(${x}px, ${y}px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
  `;
}


