const img = document.getElementById("bouncing-image");
const container = document.getElementById("container");

let x = 0,
  y = 0; // 小图片的初始位置
let dx = 3,
  dy = 3; // 初始移动速度和方向

function animate() {
  const maxWidth = container.clientWidth - img.clientWidth;
  const maxHeight = container.clientHeight - img.clientHeight;

  x += dx;
  y += dy;

  // 检测边界碰撞
  if (x <= 0 || x >= maxWidth) {
    dx = -dx;
    dx += (Math.random() - 0.5) * 6; // 在反弹时随机调整速度
  }
  if (y <= 0 || y >= maxHeight) {
    dy = -dy;
    dy += (Math.random() - 0.5) *  6; // 在反弹时随机调整速度
  }

  img.style.left = x + "px";
  img.style.top = y + "px";

  requestAnimationFrame(animate); // 递归调用以持续动画
}

animate(); // 开始动画