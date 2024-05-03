document.addEventListener("DOMContentLoaded", function() {
    // 选择所有具有 data-gif 属性的 img 元素
    const images = document.querySelectorAll('img[data-gif]');

    // 为每个图像添加事件监听器
    images.forEach(img => {
        const staticSrc = img.src;
        const gifSrc = img.dataset.gif;

        img.addEventListener('mouseover', () => {
            img.src = gifSrc; // 鼠标悬停时切换到 GIF
        });

        img.addEventListener('mouseout', () => {
            img.src = staticSrc; // 鼠标移开时切换回静态图片
        });
    });
});
