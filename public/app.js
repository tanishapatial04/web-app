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
    tilt.addEventListener('mouseleave', () => {
      tilt.style.transform = '';
    });
  }
})();
