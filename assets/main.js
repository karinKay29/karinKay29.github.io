(() => {
  "use strict";

  /* ===== 유틸 ===== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ===== 1)  헤더 라이트 모드/ 다크모드 ===== */
  // (function () {
  //   const header = document.querySelector(".header");
  //   const sections = document.querySelectorAll("section[id][data-theme]");
  //   const spNav = document.querySelector("#mobileNav"); // 변수명 통일

  //   if (!header || !sections.length || !spNav) return;

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (!entry.isIntersecting) return;

  //         const theme = entry.target.dataset.theme;
  //         if (theme === "light") {
  //           header.classList.add("light-bg");
  //           spNav.classList.add("light-bg");
  //         } else {
  //           header.classList.remove("light-bg");
  //           spNav.classList.remove("light-bg");
  //         }
  //       });
  //     },
  //     {
  //       threshold: 0.1,

  //       rootMargin: "-90px 0px 0px 0px",
  //     }
  //   );

  //   sections.forEach((sec) => observer.observe(sec)); // ✅ observe 누락 보완
  // })();

  /* ===== 1)  헤더 라이트 모드/ 다크모드 ===== */
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

  /* ===== 2) Home 페이드 ===== */
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

  /* ===== 3) 모바일 메뉴 토글 ===== */
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

  /* ===== 4) 프로젝트 필터 ===== */
  (function () {
    const categories = $(".categories");
    const projects = $$(".project");
    const container = $(".projects");
    if (!categories || !container || projects.length === 0) return;

    categories.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-filter]");
      if (!btn) return;
      const filter = btn.dataset.filter;

      const active = $(".category__selected");
      if (active) active.classList.remove("category__selected");
      btn.classList.add("category__selected");

      projects.forEach((p) => {
        p.style.display =
          filter === "all" || filter === p.dataset.type ? "block" : "none";
      });

      container.classList.add("anim-out");
      setTimeout(() => container.classList.remove("anim-out"), 300);
    });
  })();

  /* ===== 5) 스킬바 애니메이션 ===== */
  (function () {
    const sections = $$(".skill__section");
    if (sections.length === 0) return;

    const checkSkills = () => {
      const winH = window.innerHeight;
      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        const bar = sec.querySelector(".skill__progress");
        if (!bar) return;

        if (rect.top <= winH / 1.5 && rect.bottom >= 0) {
          const targetWidth = sec.getAttribute("data-percent") || "0%";
          bar.style.width = targetWidth;
          sec.style.opacity = "1";
          sec.style.visibility = "visible";
        } else {
          bar.style.width = "0";
        }
      });
    };

    window.addEventListener("scroll", checkSkills, { passive: true });
    window.addEventListener("DOMContentLoaded", checkSkills);
    checkSkills();
  })();

  /* ===== 6) 모달 ===== */
  (function () {
    const wrappers = $$(".item__wrapper");
    if (wrappers.length === 0) return;

    wrappers.forEach((w) => {
      w.addEventListener("click", () => {
        const modalId = w.getAttribute("data-modal");
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add("active");
        document.body.classList.add("modal-open");

        const closeBtn = modal.querySelector(".close");
        if (closeBtn) {
          closeBtn.addEventListener(
            "click",
            () => {
              modal.classList.remove("active");
              document.body.classList.remove("modal-open");
            },
            { once: true }
          );
        }

        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.classList.remove("active");
            document.body.classList.remove("modal-open");
          }
        });
      });
    });
  })();

  /* ===== 7) 원형 언어 프로그레스 ===== */
  (function () {
    const progText = $$(".progText");
    const progress = $$(".progress");
    const container = $(".language__container");
    if (!container || progText.length === 0 || progress.length === 0) return;

    let fired = false;
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > container.offsetTop - 600 && !fired) {
          for (let i = 0; i < progText.length; i++) {
            let count = 0;
            const target = parseInt(progText[i].dataset.count, 10) || 0;

            // 바늘(게이지) 위치
            progress[i].style.bottom = target - 100 + "%";

            const update = () => {
              if (count < target) {
                count++;
                progText[i].innerText = count;
                setTimeout(update, 50);
              } else {
                progText[i].innerText = target + "%";
              }
            };
            progText[i].innerText = "0";
            update();
          }
          fired = true;
        }
      },
      { passive: true }
    );
  })();

  /* ===== 8) 태그 색상 ===== */
  (function () {
    const changeTagBackground = (tagName, color) => {
      $$(".tag").forEach((tag) => {
        if (tag.dataset.tag === tagName) tag.style.backgroundColor = color;
      });
    };
    changeTagBackground("figma", "#F5CEC7");
    changeTagBackground("html", "#FFF9DD");
    changeTagBackground("css", "#FFF0D5");
    changeTagBackground("javascript", "#D6E6ff");
    changeTagBackground("photoshop", "#E5E7FB");
    changeTagBackground("adobeXD", "#63465A");
  })();
})();
