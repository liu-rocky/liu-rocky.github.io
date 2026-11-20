(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const modal = document.getElementById('media-modal');

  document.querySelectorAll('.project-slideshow').forEach((carousel) => {
    const track = carousel.querySelector('.project-slides');
    const slides = Array.from(track.children);
    let active = 0;
    let timer = null;
    let visible = !('IntersectionObserver' in window);
    let hovering = false;

    const showSlide = (index) => {
      const restoreFocus = carousel.contains(document.activeElement);
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const selected = i === active;
        slide.inert = !selected;
        slide.tabIndex = selected ? 0 : -1;
        if (selected) slide.removeAttribute('aria-hidden');
        else slide.setAttribute('aria-hidden', 'true');
      });
      track.style.transform = `translateX(-${active * 100}%)`;
      if (restoreFocus) slides[active].focus({ preventScroll: true });
    };

    const canPlay = () => visible && !document.hidden && !reducedMotion.matches &&
      !hovering && !carousel.contains(document.activeElement) && !(modal && modal.open);

    const syncPlayback = () => {
      window.clearTimeout(timer);
      timer = null;
      if (!canPlay()) return;
      // Each GIF lasts less than nine seconds, so both get a full loop on screen.
      timer = window.setTimeout(() => {
        if (!canPlay()) return;
        showSlide(active + 1);
        syncPlayback();
      }, 9000);
    };

    carousel.addEventListener('mouseenter', () => { hovering = true; syncPlayback(); });
    carousel.addEventListener('mouseleave', () => { hovering = false; syncPlayback(); });
    carousel.addEventListener('focusin', syncPlayback);
    carousel.addEventListener('focusout', () => window.setTimeout(syncPlayback, 0));
    carousel.addEventListener('click', syncPlayback);
    carousel.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showSlide(active + (event.key === 'ArrowRight' ? 1 : -1));
      syncPlayback();
    });
    document.addEventListener('visibilitychange', syncPlayback);
    if (modal) modal.addEventListener('close', syncPlayback);
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) showSlide(0);
      syncPlayback();
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        syncPlayback();
      }, { threshold: 0.1 });
      observer.observe(carousel);
    }
    syncPlayback();
  });
})();
