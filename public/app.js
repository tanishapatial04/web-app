(function () {
  // Footer clock and year
  const clockEl = document.getElementById('clock');
  const yearEl = document.getElementById('year');
  function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;
  }
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  updateClock();
  setInterval(updateClock, 1000);

  // Reveal on scroll
  const observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        observer.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Small tilt on hero illustration for depth
  const tilt = document.querySelector('.hero-illustration');
  if (tilt) {
    tilt.addEventListener('mousemove', (ev) => {
      const r = tilt.getBoundingClientRect();
      const rx = ((ev.clientY - r.top) / r.height - 0.5) * -6;
      const ry = ((ev.clientX - r.left) / r.width - 0.5) * 6;
      tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    tilt.addEventListener('mouseleave', () => { tilt.style.transform = ''; });
  }

  // Testimonial slider
  const slider = document.querySelector('.testimonial-slider');
  if (slider) {
    const slidesWrap = slider.querySelector('.slides');
    const items = Array.from(slider.querySelectorAll('.testimonial-card'));
    // Build track for smooth sliding
    const track = document.createElement('div');
    track.className = 'slides-track';
    items.forEach((n) => track.appendChild(n));
    slidesWrap.appendChild(track);

    let index = 0;
    function sync() { track.style.transform = `translateX(${-index * 100}%)`; }
    function next() { index = (index + 1) % items.length; sync(); }
    function prev() { index = (index - 1 + items.length) % items.length; sync(); }

    const nextBtn = slider.querySelector('.next');
    const prevBtn = slider.querySelector('.prev');
    nextBtn && nextBtn.addEventListener('click', next);
    prevBtn && prevBtn.addEventListener('click', prev);

    let autoplay;
    const shouldAuto = slider.getAttribute('data-autoplay') === 'true';
    function start() { if (shouldAuto) autoplay = setInterval(next, 4500); }
    function stop() { if (autoplay) clearInterval(autoplay); }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  // Portfolio filters
  const portfolio = document.getElementById('portfolioGrid');
  if (portfolio) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach((b) => b.addEventListener('click', () => {
      buttons.forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      const f = b.getAttribute('data-filter');
      portfolio.querySelectorAll('.work-card').forEach((card) => {
        const cat = card.getAttribute('data-cat');
        card.classList.toggle('is-hidden', f !== 'all' && f !== cat);
      });
    }));
  }

  // Blog filters
  const blog = document.getElementById('blogGrid');
  if (blog) {
    const buttons = document.querySelectorAll('.tag-btn');
    buttons.forEach((b) => b.addEventListener('click', () => {
      buttons.forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      const tag = b.getAttribute('data-tag');
      blog.querySelectorAll('.post-card').forEach((card) => {
        const t = card.getAttribute('data-tag');
        card.classList.toggle('is-hidden', tag !== 'all' && tag !== t);
      });
    }));
  }
})();
