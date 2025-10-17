(function () {
  // Inject shared header and footer
  async function includePartials() {
    const tasks = [];
    document.querySelectorAll('[data-include="header"]').forEach((slot) => {
      tasks.push(
        fetch("partials/header.html")
          .then((r) => r.text())
          .then((html) => {
            slot.outerHTML = html;
          })
      );
    });
    document.querySelectorAll('[data-include="footer"]').forEach((slot) => {
      tasks.push(
        fetch("partials/footer.html")
          .then((r) => r.text())
          .then((html) => {
            slot.outerHTML = html;
          })
      );
    });
    await Promise.all(tasks);
    setActiveNav();
  }

  function setActiveNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll(
      ".primary-nav .nav-link, .mobile-nav-link"
    );
    links.forEach((a) => {
      const href = a.getAttribute("href");
      a.removeAttribute("aria-current");
      if (href === path) a.setAttribute("aria-current", "page");
    });
  }

  function initMobileMenu() {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const mobileNav = document.getElementById("mobile-nav");
    if (!toggle || !mobileNav) return;

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !isOpen);
      mobileNav.classList.toggle("is-open");
    });

    mobileNav.querySelectorAll(".mobile-nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("is-open");
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-header")) {
        toggle.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("is-open");
      }
    });
  }

  function initClock() {
    const clockEl = document.getElementById("clock");
    const yearEl = document.getElementById("year");
    function updateClock() {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;
    }
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    updateClock();
    setInterval(updateClock, 1000);
  }

  function initReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            observer.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  }

  function initHeroTilt() {
    const tilt = document.querySelector(".hero-illustration");
    if (!tilt) return;
    tilt.addEventListener("mousemove", (ev) => {
      const r = tilt.getBoundingClientRect();
      const rx = ((ev.clientY - r.top) / r.height - 0.5) * -6;
      const ry = ((ev.clientX - r.left) / r.width - 0.5) * 6;
      tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    tilt.addEventListener("mouseleave", () => {
      tilt.style.transform = "";
    });
  }

  function initSlider() {
    const slider = document.querySelector(".testimonial-slider");
    if (!slider) return;

    const slidesWrap = slider.querySelector(".slides");
    const items = Array.from(slidesWrap.querySelectorAll(".testimonial-card"));

    const track = document.createElement("div");
    track.className = "slides-track";
    items.forEach((n) => track.appendChild(n));
    slidesWrap.innerHTML = "";
    slidesWrap.appendChild(track);

    let index = 0;
    let visibleSlides = getVisibleSlides();

    function getVisibleSlides() {
      return window.innerWidth < 768 ? 1 : 2;
    }

    function updateLayout() {
      visibleSlides = getVisibleSlides();
      const slideWidth = 100 / visibleSlides;
      items.forEach((item) => {
        item.style.flex = `0 0 ${slideWidth}%`;
      });
      sync();
    }

    function sync() {
      const slideWidth = 100 / visibleSlides;
      const totalSlides = items.length;
      if (index >= totalSlides) index = 0;
      track.style.transform = `translateX(${-index * slideWidth}%)`;
    }

    function next() {
      index = (index + 1) % items.length;
      sync();
    }

    function prev() {
      index = (index - 1 + items.length) % items.length;
      sync();
    }

    slider.querySelector(".next")?.addEventListener("click", next);
    slider.querySelector(".prev")?.addEventListener("click", prev);

    let autoplay;
    const shouldAuto = slider.dataset.autoplay === "true";
    function start() {
      if (shouldAuto) autoplay = setInterval(next, 4500);
    }
    function stop() {
      clearInterval(autoplay);
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    window.addEventListener("resize", updateLayout);

    updateLayout();
    start();
  }

  function initPortfolioFilters() {
    const grid = document.getElementById("portfolioGrid");
    if (!grid) return;
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach((b) =>
      b.addEventListener("click", () => {
        buttons.forEach((x) => x.classList.remove("is-active"));
        b.classList.add("is-active");
        const f = b.getAttribute("data-filter");
        grid.querySelectorAll(".work-card").forEach((card) => {
          const cat = card.getAttribute("data-cat");
          card.classList.toggle("is-hidden", f !== "all" && f !== cat);
        });
      })
    );
  }

  function initBlogFilters() {
    const grid = document.getElementById("blogGrid");
    if (!grid) return;
    const buttons = document.querySelectorAll(".tag-btn");
    buttons.forEach((b) =>
      b.addEventListener("click", () => {
        buttons.forEach((x) => x.classList.remove("is-active"));
        b.classList.add("is-active");
        const tag = b.getAttribute("data-tag");
        grid.querySelectorAll(".post-card").forEach((card) => {
          const t = card.getAttribute("data-tag");
          card.classList.toggle("is-hidden", tag !== "all" && tag !== t);
        });
      })
    );
  }

  // Boot
  includePartials().then(() => {
    initClock();
    initReveal();
    initHeroTilt();
    initSlider();
    initPortfolioFilters();
    initBlogFilters();
    initMobileMenu();
  });
})();
