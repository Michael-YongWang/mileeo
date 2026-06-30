/* gallery — lightbox 实现（vanilla，键盘 + touch swipe） */
(function (global) {
  'use strict';

  function init() {
    const items = Array.from(document.querySelectorAll('.gallery__item[data-lightbox-src]'));
    const lightbox = document.querySelector('.lightbox');
    if (!items.length || !lightbox) return;

    const img = lightbox.querySelector('.lightbox__img');
    const closeBtn = lightbox.querySelector('.lightbox__close');
    const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    const nextBtn = lightbox.querySelector('.lightbox__nav--next');

    const srcs = items.map((b) => b.getAttribute('data-lightbox-src'));
    const alts = items.map((b) => {
      const im = b.querySelector('img');
      return im ? im.alt : '';
    });
    let idx = 0;

    function open(i) {
      idx = i;
      img.src = srcs[idx];
      img.alt = alts[idx];
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function next() { idx = (idx + 1) % srcs.length; img.src = srcs[idx]; img.alt = alts[idx]; }
    function prev() { idx = (idx - 1 + srcs.length) % srcs.length; img.src = srcs[idx]; img.alt = alts[idx]; }

    items.forEach((b, i) => b.addEventListener('click', () => open(i)));
    closeBtn.addEventListener('click', close);
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    // 点击空白处关闭
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });

    // 键盘
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });

    // touch swipe
    let touchX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) < 60) return;
      if (dx < 0) next(); else prev();
    }, { passive: true });
  }

  global.MileeoGallery = { init };
})(window);
