/* animations — 各 section 动效初始化函数集合
   每个 init 函数独立，main.js 统一调度 */
(function (global) {
  'use strict';

  const U = global.MileeoUtils;
  // gsap & ScrollTrigger 由 CDN 注入到 window
  let gsap, ScrollTrigger;

  function ready() {
    gsap = window.gsap;
    ScrollTrigger = window.ScrollTrigger;
    if (gsap && ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      return true;
    }
    return false;
  }

  /* -------- Hero -------- */
  function initHero() {
    if (!ready()) return;
    const heroImg = document.querySelector('.hero__media img');
    const title = document.querySelector('.hero__title');
    const eyebrow = document.querySelector('.hero__eyebrow');
    const sub = document.querySelector('.hero__sub');
    const hint = document.querySelector('.hero__scroll-hint');

    // 清掉 CSS 里 word > span 的 translateY(110%) 起始态
    gsap.set('.hero__title .word > span', { clearProps: 'transform' });

    // 标题整体起始隐藏
    gsap.set([eyebrow, title, sub, hint], { opacity: 0, y: 24 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(heroImg, { scale: 1.08 }, { scale: 1, duration: 2.0, ease: 'expo.out' }, 0)
      .to(eyebrow, { opacity: 1, y: 0, duration: 0.8 }, 0.3)
      .to(title, { opacity: 1, y: 0, duration: 1.0 }, 0.5)
      .to(sub, { opacity: 1, y: 0, duration: 0.8 }, 0.9)
      .to(hint, { opacity: 0.7, y: 0, duration: 0.8 }, 1.1);

    // 滚动视差 - 图片
    gsap.to(heroImg, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // 桌面端鼠标视差
    if (!U.isCoarsePointer && !U.reducedMotion) {
      const hero = document.querySelector('.hero');
      let cx = 0, cy = 0, tx = 0, ty = 0;
      hero.addEventListener('mousemove', U.rafThrottle((e) => {
        const rect = hero.getBoundingClientRect();
        cx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        cy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      }));
      gsap.ticker.add(() => {
        tx = U.lerp(tx, cx, 0.05);
        ty = U.lerp(ty, cy, 0.05);
        if (heroImg) heroImg.style.setProperty('--px', `${tx * 10}px`);
        if (heroImg) heroImg.style.setProperty('--py', `${ty * 10}px`);
      });
    }
  }

  /* -------- Stats -------- */
  function initStats() {
    if (!ready()) return;
    const stats = document.querySelectorAll('.stat');
    stats.forEach((stat, idx) => {
      const numEl = stat.querySelector('.stat__num');
      const rule = stat.querySelector('.stat__rule');
      const target = numEl.getAttribute('data-count');

      ScrollTrigger.create({
        trigger: stat,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          U.countUp(numEl, target, 1500);
          gsap.to(rule, { scaleX: 1, duration: 0.9, ease: 'power3.out', delay: 0.3 });
        },
      });
    });
  }

  /* -------- Brand video -------- */
  function initBrandVideo() {
    if (!ready()) return;
    const video = document.querySelector('[data-video]');
    if (!video) return;

    // 慢网或低端机：不自动播放，仅 poster
    if (U.slowNetwork || U.lowMemory) {
      video.removeAttribute('autoplay');
      video.pause();
    }

    const media = document.querySelector('.brand-video__media');
    const h2span = document.querySelector('.brand-video__h2 > span');
    const p = document.querySelector('.brand-video__p');

    if (h2span) gsap.set(h2span, { clearProps: 'transform' });
    if (h2span) gsap.set(h2span, { yPercent: 110 });
    gsap.set(p, { opacity: 0, y: 20 });

    if (media) {
      gsap.fromTo(media, { scale: 0.92 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.brand-video',
          start: 'top bottom',
          end: 'center center',
          scrub: 1,
        },
      });
    }

    ScrollTrigger.create({
      trigger: '.brand-video',
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.to(h2span, { yPercent: 0, duration: 1.0, ease: 'expo.out' });
        gsap.to(p, { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' });
      },
    });
  }

  /* -------- Styles 水平滚动（桌面） -------- */
  function initStyles() {
    if (!ready()) return;
    const section = document.querySelector('.styles');
    const track = document.querySelector('.styles__track');
    if (!section || !track) return;

    // 桌面端：pin 水平滚动
    if (window.innerWidth >= 1024 && !U.reducedMotion) {
      const setup = () => {
        const cards = track.querySelectorAll('.style-card');
        if (!cards.length) return;
        // 计算总移动距离 = track 宽度 - viewport 宽
        const total = track.scrollWidth - window.innerWidth + 80;
        gsap.to(track, {
          x: -total,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 0.6,
            start: 'top top',
            end: () => `+=${total}`,
            invalidateOnRefresh: true,
          },
        });
      };
      setup();
    }

    // 移动 & 桌面通用：每张卡片进入时图轻放大
    document.querySelectorAll('.style-card').forEach((card) => {
      const img = card.querySelector('.style-card__img');
      gsap.fromTo(img, { scale: 1.08 }, {
        scale: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'left 85%',
          horizontal: false,
          once: true,
        },
      });
    });
  }

  /* -------- System 5.0 sticky crossfade -------- */
  function initSystem() {
    if (!ready()) return;
    const stack = document.querySelectorAll('.system__media-stack img');
    const cards = document.querySelectorAll('[data-fact-card]');
    if (!stack.length || !cards.length) return;

    cards.forEach((card, idx) => {
      // 文案 reveal
      gsap.fromTo(card,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 80%', once: true },
        }
      );

      // 数字 count-up（保留 0.2 / 100000 等不同格式）
      const numEl = card.querySelector('.fact__num-val');
      if (numEl) {
        const target = numEl.getAttribute('data-count');
        ScrollTrigger.create({
          trigger: card,
          start: 'top 80%',
          once: true,
          onEnter: () => U.countUp(numEl, target, 1200),
        });
      }

      // sticky 图片切换
      ScrollTrigger.create({
        trigger: card,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => activateImage(idx),
        onEnterBack: () => activateImage(idx),
      });
    });

    function activateImage(idx) {
      stack.forEach((img, i) => {
        img.classList.toggle('is-active', i === idx);
      });
    }
  }

  /* -------- Process timeline -------- */
  function initProcess() {
    if (!ready()) return;
    const list = document.querySelector('.process__list');
    const steps = document.querySelectorAll('.step');
    if (!list || !steps.length) return;

    // 进度条 scrub
    ScrollTrigger.create({
      trigger: list,
      start: 'top 70%',
      end: 'bottom 70%',
      scrub: 0.5,
      onUpdate: (self) => {
        const pct = (self.progress * 100).toFixed(1);
        list.style.setProperty('--process-progress', `${pct}%`);
      },
    });

    // 每个 step 进入激活
    steps.forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 75%',
        onEnter: () => step.classList.add('is-active'),
        onLeaveBack: () => step.classList.remove('is-active'),
      });
      gsap.fromTo(step,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: step, start: 'top 85%', once: true },
        }
      );
    });
  }

  /* -------- Gallery + CTA reveal -------- */
  function initGalleryReveal() {
    if (!ready()) return;
    gsap.utils.toArray('.gallery__item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          delay: (i % 4) * 0.08,
          scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        }
      );
    });

    gsap.fromTo('.cta',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: '.cta', start: 'top 80%', once: true },
      }
    );

    // section eyebrow + h2 通用 reveal
    gsap.utils.toArray('.section h2, .section .eyebrow').forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        }
      );
    });
  }

  /* -------- Cursor follower (desktop) -------- */
  function initCursor() {
    if (U.isCoarsePointer || U.reducedMotion) return;
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;

    let mx = 0, my = 0, x = 0, y = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    gsap.ticker.add(() => {
      x = U.lerp(x, mx, 0.15);
      y = U.lerp(y, my, 0.15);
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });

    // hover 状态
    document.querySelectorAll('a, button, .gallery__item, .style-card, [role="button"]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* -------- Mobile tap ripple -------- */
  function initTapRipple() {
    if (!U.isCoarsePointer) return;
    document.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      const r = document.createElement('span');
      r.style.cssText = `
        position:fixed;left:${t.clientX - 12}px;top:${t.clientY - 12}px;
        width:24px;height:24px;border-radius:50%;
        background:rgba(203,176,126,0.5);pointer-events:none;
        z-index:9999;transform:scale(0);
        animation:tapRipple .6s ease-out forwards;
      `;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 600);
    }, { passive: true });

    // 注入 keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes tapRipple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  global.MileeoAnim = {
    initHero, initStats, initBrandVideo, initStyles, initSystem,
    initProcess, initGalleryReveal, initCursor, initTapRipple,
    ready,
  };
})(window);
