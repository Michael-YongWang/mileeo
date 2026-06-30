/* utils — 共享辅助函数（无副作用） */
(function (global) {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const lowMemory = (navigator.deviceMemory || 4) < 2;
  const slowNetwork = (() => {
    const c = navigator.connection;
    return c && (c.effectiveType === '2g' || c.saveData === true);
  })();

  /** IntersectionObserver helper — 一次性触发 */
  function onceVisible(el, cb, options) {
    const opts = Object.assign({ rootMargin: '0px 0px -10% 0px', threshold: 0.1 }, options || {});
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          cb(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, opts);
    io.observe(el);
    return io;
  }

  /** 数字 count-up 动画（不依赖 gsap） */
  function countUp(el, target, duration) {
    const isFloat = String(target).indexOf('.') !== -1;
    const final = parseFloat(target);
    const dur = duration || 1400;
    const start = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - start) / dur);
      // ease-out-quart
      const e = 1 - Math.pow(1 - p, 4);
      const cur = final * e;
      el.textContent = isFloat ? cur.toFixed(1) : Math.floor(cur).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = isFloat ? final.toFixed(1) : final.toLocaleString('en-US');
    }
    requestAnimationFrame(frame);
  }

  /** rAF-throttled handler */
  function rafThrottle(fn) {
    let pending = false;
    let lastArgs = null;
    return function () {
      lastArgs = arguments;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        fn.apply(null, lastArgs);
        pending = false;
      });
    };
  }

  /** linear interpolate */
  function lerp(a, b, t) { return a + (b - a) * t; }

  global.MileeoUtils = {
    reducedMotion,
    isCoarsePointer,
    lowMemory,
    slowNetwork,
    onceVisible,
    countUp,
    rafThrottle,
    lerp,
  };
})(window);
