(() => {
  "use strict";

  /* ===== 유틸 ===== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ===== fade-in 공용 스크롤 옵저버 ===== */
  const fadeEls = document.querySelectorAll(".scroll-fade");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target); // 한 번만 실행되게
        }
      });
    },
    {
      threshold: 0.4, // 40% 정도 화면에 들어오면 발동
    }
  );

  fadeEls.forEach((el) => io.observe(el));

  /* ===== 헤더 라이트 모드/ 다크모드 ===== */
  document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".header");
    const sections = document.querySelectorAll("section[id][data-theme]");
    const spNav = document.querySelector("#mobileNav");

    if (!header || !sections.length || !spNav) {
      console.log("[theme] early exit", {
        header: !!header,
        sections: sections.length,
        spNav: !!spNav,
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const theme = entry.target.dataset.theme;
          console.log(theme);
          if (theme === "light") {
            header.classList.add("light-bg");
            spNav.classList.add("light-bg");
          } else {
            header.classList.remove("light-bg");
            spNav.classList.remove("light-bg");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "-90px 0px 0px 0px", // 헤더 높이만큼 위로 당김
      }
    );

    sections.forEach((sec) => observer.observe(sec));
  });

  /* ====== 스크롤 바 ====== */
  (() => {
    const fab = document.querySelector(".fab-progress");
    const label = document.querySelector(".fab-progress__pct");
    if (!fab || !label) return;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      const deg = Math.round(p * 360);
      fab.style.background = `conic-gradient(#8a2be2 ${deg}deg, rgba(255,255,255,.15) ${deg}deg)`;
      label.textContent = Math.round(p * 100) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  })();

  /* ===== Home 페이드 ===== */
  (function () {
    const home = $(".home__container");
    if (!home) return;
    const homeHeight = home.offsetHeight || 1;
    const onScroll = () => {
      const op = 1 - window.scrollY / homeHeight;
      home.style.opacity = Math.max(0, Math.min(1, op));
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ===== 모바일 메뉴 토글 ===== */
  (function () {
    const btn = document.querySelector("[data-hamburger]");
    const mobileNav = document.querySelector("[data-mobile-nav]");
    if (!btn || !mobileNav) return;

    const setOpen = (open) => {
      btn.setAttribute("aria-expanded", String(open));
      if (open) {
        // 트랜지션 위해 hidden 먼저 해제 -> 다음 프레임에 data-open 토글
        mobileNav.hidden = false;
        requestAnimationFrame(() => {
          mobileNav.dataset.open = "true";
        });
      } else {
        mobileNav.dataset.open = "false";
        const onEnd = (e) => {
          if (
            e.propertyName === "max-height" &&
            mobileNav.dataset.open === "false"
          ) {
            mobileNav.hidden = true;
            mobileNav.removeEventListener("transitionend", onEnd);
          }
        };
        mobileNav.addEventListener("transitionend", onEnd);
      }
    };

    // 초기 상태
    setOpen(false);

    // 버튼 클릭
    btn.addEventListener("click", () => {
      const next = btn.getAttribute("aria-expanded") !== "true";
      setOpen(next);
    });

    // 메뉴 내 링크 클릭 시 닫기
    mobileNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });

    // ESC로 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    // 바깥 클릭 시 닫기
    document.addEventListener("click", (e) => {
      const insideHeader = e.target.closest(".header");
      const insideMenu = e.target.closest("[data-mobile-nav]");
      if (!insideHeader && !insideMenu) setOpen(false);
    });

    // 데스크탑으로 전환되면 강제 닫기
    const mql = window.matchMedia("(min-width:1024px)");
    const handleChange = () => {
      if (mql.matches) setOpen(false);
    };
    mql.addEventListener
      ? mql.addEventListener("change", handleChange)
      : mql.addListener(handleChange);
  })();

  /* ===== 버블필드 등장 ===== */
  /* ===== 버블필드 등장 ===== */

  /** 9-1) 스킬 데이터 */
  const skills = [
    { label: "HTML", level: 95, color: 1 },
    { label: "CSS / SCSS", level: 70, color: 2 },
    { label: "JavaScript", level: 55, color: 3 },
    { label: "WordPress", level: 86, color: 5 },
    { label: "Studio", level: 95, color: 5 },
    { label: "Figma", level: 88, color: 2 },
    { label: "UX Design", level: 82, color: 4 },
    { label: "Performance / SEO", level: 68, color: 1 },
    { label: "Accessibility", level: 66, color: 1 },
    { label: "Git / GitHub", level: 72, color: 3 },
  ];

  /** 9-2) 유틸 */
  const map = (v, a, b, c, d) => c + (d - c) * ((v - a) / (b - a));
  const clampV = (v, min, max) => Math.min(max, Math.max(min, v));

  /** 패럴랙스: 마우스에 살짝 반응 (포인터 있는 기기에서만) */
  function addParallax(containerEl) {
    if (!window.matchMedia("(pointer: fine)").matches) return; // 터치 기기면 스킵
    if (containerEl.__parallaxBound) return; // 중복 바인딩 방지
    let raf = null;
    const onMove = (e) => {
      const r = containerEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        containerEl.querySelectorAll(".bubble").forEach((el, i) => {
          const strength = 8 + (i % 5) * 3; // 레이어별 깊이감
          el.style.translate = `${dx * strength}px ${dy * strength}px`;
        });
      });
    };
    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      containerEl
        .querySelectorAll(".bubble")
        .forEach((el) => (el.style.translate = "0px 0px"));
    };
    containerEl.addEventListener("mousemove", onMove);
    containerEl.addEventListener("mouseleave", onLeave);
    containerEl.__parallaxBound = true;
  }

  /** 9-4) 버블 생성/배치 (모바일 스케일 + 충돌 회피 + 간단 relax) */
  function createBubbles(containerEl, list) {
    containerEl.innerHTML = "";

    const rect = containerEl.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (!width || !height) return;

    const isMobile = window.matchMedia("(max-width: 480px)").matches;

    // 화면(컨테이너) 크기 기반 동적 스케일
    const base = Math.min(width, height);
    // 모바일에선 조금 더 보수적으로 작게
    const bMinMul = isMobile ? 0.14 : 0.16;
    const bMaxMul = isMobile ? 0.24 : 0.28;

    const BMIN = Math.round(clampV(base * bMinMul, 56, 150)); // 최소 지름
    const BMAX = Math.round(clampV(base * bMaxMul, 84, 240)); // 최대 지름
    const FMIN = Math.round(clampV(base * 0.02, 14, 18)); // 최소 폰트
    const FMAX = Math.round(clampV(base * 0.032, 16, 22)); // 최대 폰트(모바일 상한 22)

    const PADDING = 24;
    const GAP = isMobile ? 18 : 14; // 모바일은 여유 간격↑
    const MAX_TRIES = 140;

    // 큰 버블부터 배치 → 빈자리 찾기 쉬움
    const items = [...list].sort((a, b) => b.level - a.level);

    // 충돌 상태
    const placed = []; // {x,y,r,el}

    items.forEach((s) => {
      const el = document.createElement("div");
      el.className = "bubble";
      el.dataset.color = s.color;

      // 크기/폰트
      const diameter = Math.round(map(s.level, 0, 100, BMIN, BMAX));
      const fontSize = Math.round(map(s.level, 0, 100, FMIN, FMAX));
      el.style.width = `${diameter}px`;
      el.style.height = `${diameter}px`;
      el.style.fontSize = `${fontSize}px`;

      // 작은 버블이 위로 오게 (가독성↑)
      el.style.zIndex = String(2000 - diameter);

      // 좌표 범위(반지름 고려)
      const r = diameter / 2;
      const xMin = PADDING + r;
      const xMax = width - PADDING - r;
      const yMin = PADDING + r;
      const yMax = height - PADDING - r;

      // 충돌 회피 좌표 찾기
      let x,
        y,
        tries = 0;
      while (tries < MAX_TRIES) {
        const candidateX = Math.round(map(Math.random(), 0, 1, xMin, xMax));
        const candidateY = Math.round(map(Math.random(), 0, 1, yMin, yMax));

        let ok = true;
        for (const p of placed) {
          const dx = candidateX - p.x;
          const dy = candidateY - p.y;
          const minDist = r + p.r + GAP;
          if (dx * dx + dy * dy < minDist * minDist) {
            ok = false;
            break;
          }
        }
        if (ok) {
          x = candidateX;
          y = candidateY;
          break;
        }
        tries++;
      }
      // 실패해도 경계 고려해서 마지막 좌표 사용
      if (x == null || y == null) {
        x = Math.round(map(Math.random(), 0, 1, xMin, xMax));
        y = Math.round(map(Math.random(), 0, 1, yMin, yMax));
      }

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      // 라벨/모션 변수
      el.textContent = s.label;
      if (s.label.length > 14) el.style.padding = "12px 16px";
      const DURATION_MIN = 10,
        DURATION_MAX = 18;
      const dur = (
        Math.random() * (DURATION_MAX - DURATION_MIN) +
        DURATION_MIN
      ).toFixed(2);
      const delay = (Math.random() * 4).toFixed(2);
      el.style.setProperty("--dur", `${dur}s`);
      el.style.setProperty("--delay", `${delay}s`);

      containerEl.appendChild(el);
      placed.push({ x, y, r, el });
    });

    // ⛳ 모바일에서만: 가벼운 relax(서로 살짝 밀어내기)로 겹침 더 줄이기
    if (isMobile && placed.length) {
      const ITER = 14; // 반복 횟수 (가볍게)
      const PUSH = 0.35; // 밀어내는 세기(픽셀 계수)
      const xMin = (p) => PADDING + p.r;
      const xMax = (p) => width - PADDING - p.r;
      const yMin = (p) => PADDING + p.r;
      const yMax = (p) => height - PADDING - p.r;

      for (let t = 0; t < ITER; t++) {
        for (let i = 0; i < placed.length; i++) {
          for (let j = i + 1; j < placed.length; j++) {
            const a = placed[i],
              b = placed[j];
            const dx = b.x - a.x,
              dy = b.y - a.y;
            const dist = Math.hypot(dx, dy) || 0.0001;
            const minDist = a.r + b.r + GAP;

            if (dist < minDist) {
              const overlap = (minDist - dist) * PUSH;
              const ux = dx / dist,
                uy = dy / dist;
              // 서로 반반 밀어내기
              a.x -= ux * overlap * 0.5;
              a.y -= uy * overlap * 0.5;
              b.x += ux * overlap * 0.5;
              b.y += uy * overlap * 0.5;

              // 경계 안으로 클램프
              a.x = clampV(a.x, xMin(a), xMax(a));
              a.y = clampV(a.y, yMin(a), yMax(a));
              b.x = clampV(b.x, xMin(b), xMax(b));
              b.y = clampV(b.y, yMin(b), yMax(b));
            }
          }
        }
      }
      // 최종 좌표 반영
      placed.forEach((p) => {
        p.el.style.left = `${Math.round(p.x)}px`;
        p.el.style.top = `${Math.round(p.y)}px`;
      });
    }
  }

  /** 9-5) 스크롤 진입 시 순차 등장 */
  function observeBubbleAppear(containerEl) {
    const onEnter = (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const bubbles = entry.target.querySelectorAll(".bubble");
        bubbles.forEach((el, idx) => {
          setTimeout(() => el.classList.add("is-in"), idx * 70);
        });
        observer.unobserve(entry.target); // 한 번만
      });
    };
    const ioBubbles = new IntersectionObserver(onEnter, { threshold: 0.2 });
    ioBubbles.observe(containerEl);
  }

  /** 9-6) 초기화 + 리사이즈 재배치(디바운스) + 패럴랙스 */
  function initBubbleField() {
    const field = document.getElementById("bubbleField");
    if (!field) return;

    // 모바일에선 개수도 살짝 줄임
    const isMobile = window.matchMedia("(max-width: 480px)").matches;
    const list = isMobile ? skills.slice(0, 7) : skills;

    createBubbles(field, list);
    observeBubbleAppear(field);
    addParallax(field);

    // 리사이즈 시 재배치
    let bubbleResizeTimer = null;
    function relayoutBubbles() {
      const r = field.getBoundingClientRect();
      const inView =
        r.top < window.innerHeight * 0.8 && r.bottom > window.innerHeight * 0.2;

      createBubbles(field, list);
      if (inView) {
        field.querySelectorAll(".bubble").forEach((el, idx) => {
          setTimeout(() => el.classList.add("is-in"), idx * 50);
        });
      } else {
        observeBubbleAppear(field);
      }
      addParallax(field); // 혹시 바인딩 안 됐으면 바인딩
    }
    window.addEventListener("resize", () => {
      clearTimeout(bubbleResizeTimer);
      bubbleResizeTimer = setTimeout(relayoutBubbles, 200);
    });
  }
  // 레이아웃 계산 후 실행
  window.addEventListener("load", initBubbleField);
})();
