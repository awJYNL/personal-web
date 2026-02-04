/**
 * 粒子追踪效果
 * 鼠标移动时产生彩色粒子，营造梦幻二次元氛围
 */

class Particle {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;

        // 随机大小
        this.size = Math.random() * 8 + 3;
        this.originalSize = this.size;

        // 随机速度
        this.speedX = (Math.random() - 0.5) * 3;
        this.speedY = (Math.random() - 0.5) * 3 - 1; // 轻微向上飘

        // 随机颜色（粉蓝紫渐变）
        const colors = [
            '#ff6b9d', // 粉色
            '#ff8fab', // 浅粉
            '#00d4ff', // 蓝色
            '#7dd3fc', // 浅蓝
            '#c471ed', // 紫色
            '#d8b4fe', // 浅紫
            '#fbbf24', // 金色点缀
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        // 生命周期
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;

        // 形状 (0: 圆形, 1: 星形, 2: 心形)
        this.shape = Math.floor(Math.random() * 3);

        // 旋转
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += 0.02; // 轻微重力
        this.life -= this.decay;
        this.size = this.originalSize * this.life;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;

        switch (this.shape) {
            case 0: // 圆形
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 1: // 星形
                this.drawStar(ctx, 0, 0, 5, this.size, this.size * 0.5);
                break;

            case 2: // 心形
                this.drawHeart(ctx, 0, 0, this.size);
                break;
        }

        // 添加发光效果
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;

        ctx.restore();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    drawHeart(ctx, x, y, size) {
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(x, y + topCurveHeight);

        // 左边曲线
        ctx.bezierCurveTo(
            x, y,
            x - size, y,
            x - size, y + topCurveHeight
        );
        ctx.bezierCurveTo(
            x - size, y + (size + topCurveHeight) / 2,
            x, y + (size + topCurveHeight) / 2,
            x, y + size
        );

        // 右边曲线
        ctx.bezierCurveTo(
            x, y + (size + topCurveHeight) / 2,
            x + size, y + (size + topCurveHeight) / 2,
            x + size, y + topCurveHeight
        );
        ctx.bezierCurveTo(
            x + size, y,
            x, y,
            x, y + topCurveHeight
        );

        ctx.closePath();
        ctx.fill();
    }

    isDead() {
        return this.life <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseMoving = false;
        this.lastMouseMove = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.isMouseMoving = true;
            this.lastMouseMove = Date.now();

            // 每次移动产生粒子
            this.createParticles(e.clientX, e.clientY, 2);
        });

        // 点击产生更多粒子
        document.addEventListener('click', (e) => {
            this.createParticles(e.clientX, e.clientY, 15);
        });

        // 触摸支持
        document.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
            this.createParticles(touch.clientX, touch.clientY, 2);
        });

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, this.canvas));
        }

        // 限制粒子数量以保持性能
        if (this.particles.length > 200) {
            this.particles = this.particles.slice(-200);
        }
    }

    animate() {
        // 清除画布（带淡出效果）
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 更新和绘制粒子
        this.particles = this.particles.filter(particle => {
            particle.update();
            particle.draw(this.ctx);
            return !particle.isDead();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// 平滑滚动导航
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 滚动动画效果
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 观察所有卡片元素
    document.querySelectorAll('.gallery-item, .article-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// 图片加载失败时显示占位符
function initImagePlaceholders() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function () {
            this.style.background = 'linear-gradient(135deg, #ff6b9d33, #00d4ff33)';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';

            // 创建占位符文本
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #ff6b9d;
                font-weight: 600;
                text-align: center;
                padding: 1rem;
            `;
            placeholder.innerHTML = `📷 请替换<br><strong>${this.src.split('/').pop()}</strong>`;

            if (this.parentElement) {
                this.parentElement.style.position = 'relative';
                this.parentElement.appendChild(placeholder);
            }
        });
    });
}

// 图片灯箱功能
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    // 为所有画廊图片添加点击事件
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止触发粒子效果
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // 禁止背景滚动
        });
    });

    // 关闭灯箱
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // 恢复滚动
    }

    // 点击关闭按钮关闭
    closeBtn.addEventListener('click', closeLightbox);

    // 点击背景关闭
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
    initSmoothScroll();
    initScrollAnimations();
    initImagePlaceholders();
    initLightbox();

    console.log('✨ 个人品牌网站已加载！');
    console.log('📝 请替换 image/ 文件夹中的占位图片');
});
