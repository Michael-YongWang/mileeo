/* main — 入口：Lenis 初始化 + gsap ticker 同步 + 调度各 section 初始化 */
(function () {
  'use strict';

  function start() {
    const U = window.MileeoUtils;
    const A = window.MileeoAnim;
    const G = window.MileeoGallery;

    if (!window.gsap || !window.ScrollTrigger) {
      console.warn('[mileeo] gsap not ready, retrying...');
      return setTimeout(start, 50);
    }

    gsap.registerPlugin(ScrollTrigger);

    // Lenis 平滑滚动 — 仅桌面 / 高端设备
    if (!U.reducedMotion && !U.lowMemory && !U.isCoarsePointer && window.Lenis) {
      const lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        smoothTouch: false,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // 各 section 初始化
    A.initHero();
    A.initStats();
    A.initBrandVideo();
    A.initStyles();
    A.initSystem();
    A.initProcess();
    A.initGalleryReveal();
    A.initCursor();
    A.initTapRipple();
    G.init();

    // 让 ScrollTrigger 在所有图片加载完后 refresh，防止位置偏移
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
