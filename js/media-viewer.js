(() => {
  'use strict';

  const modal = document.getElementById('media-modal');
  if (!modal || typeof modal.showModal !== 'function') return;

  const title = document.getElementById('media-title');
  const caption = document.getElementById('media-caption');
  const content = modal.querySelector('.media-content');
  const status = modal.querySelector('.media-status');
  const error = modal.querySelector('.media-error');
  const original = modal.querySelector('.media-original');
  const paper = modal.querySelector('.media-paper');
  let image = modal.querySelector('.media-image');
  let video = null;
  let disposeGallery = null;
  let trigger = null;
  let requestId = 0;
  let backdropPressed = false;

  const isOutside = (event) => {
    const bounds = modal.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
  };

  const removeVideo = () => {
    if (video) video.remove();
    video = null;
  };

  const removeGallery = () => {
    if (disposeGallery) disposeGallery();
    disposeGallery = null;
  };

  const openGallery = (figures) => {
    const gallery = document.createElement('div');
    gallery.className = 'media-gallery';
    gallery.tabIndex = 0;
    gallery.setAttribute('role', 'group');
    gallery.setAttribute('aria-roledescription', 'carousel');
    gallery.setAttribute('aria-label', 'Paper figures. Scroll horizontally or use the left and right arrow keys to browse.');
    const track = document.createElement('div');
    track.className = 'media-gallery-track';
    figures.forEach((figure) => {
      const slide = document.createElement('figure');
      slide.className = 'media-gallery-slide';
      const picture = document.createElement('img');
      picture.alt = figure.alt;
      picture.addEventListener('error', () => {
        picture.hidden = true;
        const message = document.createElement('p');
        message.className = 'media-gallery-error';
        message.textContent = 'This figure could not be loaded. ';
        const fallback = document.createElement('a');
        fallback.href = figure.src;
        fallback.target = '_blank';
        fallback.rel = 'noopener noreferrer';
        fallback.textContent = 'Open the original image';
        message.append(fallback);
        slide.append(message);
      }, { once: true });
      picture.src = figure.src;
      slide.append(picture);
      track.append(slide);
    });
    gallery.append(track);
    content.append(gallery);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let active = 0;
    let timer = null;
    let hovering = false;
    let interacting = false;
    let disposed = false;
    const canPlay = () => !disposed && modal.open && !document.hidden &&
      !reducedMotion.matches && !hovering && !interacting && !gallery.contains(document.activeElement);
    const showSlide = (index) => {
      const next = (index + figures.length) % figures.length;
      gallery.scrollTo({ left: next * gallery.clientWidth, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    };
    const syncPlayback = () => {
      window.clearTimeout(timer);
      timer = null;
      if (!canPlay()) return;
      timer = window.setTimeout(() => {
        if (!canPlay()) return;
        showSlide(active + 1);
        syncPlayback();
      }, 6000);
    };
    gallery.addEventListener('scroll', () => {
      if (disposed || !gallery.clientWidth) return;
      active = Math.max(0, Math.min(figures.length - 1, Math.round(gallery.scrollLeft / gallery.clientWidth)));
      caption.textContent = figures[active].alt;
    }, { passive: true });
    gallery.addEventListener('mouseenter', () => { hovering = true; syncPlayback(); });
    gallery.addEventListener('mouseleave', () => { hovering = false; syncPlayback(); });
    gallery.addEventListener('pointerdown', () => { interacting = true; syncPlayback(); });
    const releasePointer = () => { interacting = false; syncPlayback(); };
    document.addEventListener('pointerup', releasePointer);
    document.addEventListener('pointercancel', releasePointer);
    gallery.addEventListener('focusin', syncPlayback);
    gallery.addEventListener('focusout', () => window.setTimeout(syncPlayback, 0));
    gallery.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showSlide(active + (event.key === 'ArrowRight' ? 1 : -1));
      syncPlayback();
    });
    document.addEventListener('visibilitychange', syncPlayback);
    reducedMotion.addEventListener('change', syncPlayback);
    disposeGallery = () => {
      disposed = true;
      window.clearTimeout(timer);
      document.removeEventListener('pointerup', releasePointer);
      document.removeEventListener('pointercancel', releasePointer);
      document.removeEventListener('visibilitychange', syncPlayback);
      reducedMotion.removeEventListener('change', syncPlayback);
      gallery.remove();
    };
    syncPlayback();
  };

  const openPreview = (link, overview) => {
    removeVideo();
    removeGallery();
    trigger = link;

    const article = link.closest('article');
    const heading = article && article.querySelector('h3');
    const previewLink = overview ? article.querySelector('.publication-image') : link;
    const thumbnail = previewLink.querySelector('img');
    const label = link.textContent.trim() || link.getAttribute('aria-label') || 'Image preview';
    const description = (thumbnail && thumbnail.alt) || label;
    title.textContent = heading ? heading.textContent : label;
    caption.textContent = description;
    original.href = previewLink.href;
    paper.replaceChildren();
    paper.hidden = !overview;
    modal.classList.toggle('paper-preview', overview);
    if (overview) {
      ['.venue', '.authors', '.paper-details > p'].forEach((selector) => {
        const paragraph = article.querySelector(selector);
        if (!paragraph) return;
        const copy = paragraph.cloneNode(true);
        if (selector === '.authors' && copy.textContent.includes('*')) {
          const note = document.createElement('span');
          note.className = 'contribution';
          note.textContent = ' (* Equal contribution)';
          copy.append(note);
        }
        paper.append(copy);
      });
    }
    error.hidden = true;
    const gallerySource = overview && link.parentElement.dataset.gallerySrc;
    if (gallerySource) {
      requestId += 1;
      image.removeAttribute('src');
      image.hidden = true;
      status.hidden = true;
      content.setAttribute('aria-busy', 'false');
      document.body.classList.add('modal-open');
      if (!modal.open) modal.showModal();
      openGallery([
        { src: previewLink.href, alt: description },
        { src: gallerySource, alt: link.parentElement.dataset.galleryAlt }
      ]);
      modal.scrollTop = 0;
      return;
    }
    status.textContent = 'Loading image…';
    status.hidden = false;
    content.setAttribute('aria-busy', 'true');

    // A fresh image prevents an earlier load from updating a later preview.
    const activeRequest = ++requestId;
    const nextImage = document.createElement('img');
    nextImage.className = 'media-image';
    nextImage.alt = description;
    nextImage.hidden = true;
    nextImage.addEventListener('load', () => {
      if (activeRequest !== requestId || !modal.open) return;
      status.hidden = true;
      nextImage.hidden = false;
      content.setAttribute('aria-busy', 'false');
    }, { once: true });
    nextImage.addEventListener('error', () => {
      if (activeRequest !== requestId || !modal.open) return;
      status.hidden = true;
      error.hidden = false;
      content.setAttribute('aria-busy', 'false');
    }, { once: true });
    image.replaceWith(nextImage);
    image = nextImage;

    document.body.classList.add('modal-open');
    if (!modal.open) modal.showModal();
    image.src = previewLink.href;
    modal.scrollTop = 0;
  };

  const openVideo = (link) => {
    removeVideo();
    removeGallery();
    requestId += 1;
    trigger = link;
    image.removeAttribute('src');
    image.hidden = true;
    status.hidden = true;
    error.hidden = true;
    paper.hidden = true;
    paper.replaceChildren();
    modal.classList.remove('paper-preview');
    content.setAttribute('aria-busy', 'false');

    const heading = link.closest('article').querySelector('h3');
    title.textContent = heading.textContent;
    const fallback = document.createElement('a');
    fallback.href = link.href;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'Watch on YouTube';
    caption.replaceChildren(fallback);

    // Create the player only on request, and remove it when closing to stop playback.
    video = document.createElement('iframe');
    video.className = 'media-video';
    video.title = heading.textContent + ' — demo video';
    video.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    video.allowFullscreen = true;
    video.referrerPolicy = 'strict-origin-when-cross-origin';
    video.src = 'https://www.youtube.com/embed/' + encodeURIComponent(link.dataset.youtube) + '?rel=0&playsinline=1';
    content.append(video);

    document.body.classList.add('modal-open');
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
  };

  document.querySelectorAll('a[href^="images/"], a[data-media], a[data-youtube], .paper-details summary').forEach((link) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', 'media-modal');
    link.addEventListener('click', (event) => {
      // Preserve intentional new-tab clicks and the native fallback links.
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (link.dataset.youtube) openVideo(link);
      else openPreview(link, link.matches('.paper-details summary'));
    });
  });

  modal.querySelector('.media-close').addEventListener('click', () => modal.close());
  modal.addEventListener('pointerdown', (event) => {
    backdropPressed = event.target === modal && isOutside(event);
  });
  modal.addEventListener('click', (event) => {
    if (backdropPressed && event.target === modal && isOutside(event)) modal.close();
    backdropPressed = false;
  });
  // Native <dialog> handles Escape and keyboard focus containment.
  modal.addEventListener('close', () => {
    removeVideo();
    removeGallery();
    requestId += 1;
    image.removeAttribute('src');
    image.hidden = true;
    status.hidden = true;
    error.hidden = true;
    paper.hidden = true;
    paper.replaceChildren();
    modal.classList.remove('paper-preview');
    content.setAttribute('aria-busy', 'false');
    document.body.classList.remove('modal-open');
    if (trigger) trigger.focus({ preventScroll: true });
  });
})();
