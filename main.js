//about섹션이 오면 글씨 색깔 어둡게 바꾸기

const header = document.querySelector(".header");
const aboutSection = document.querySelector("#about");

window.addEventListener("scroll", () => {
  if (window.scrollY >= aboutSection.offsetTop - 50) {
    header.classList.add("light-bg");
  } else {
    header.classList.remove("light-bg");
  }
});
//Make home slowly fade to transparanet
//Home 섹션을 아래로 스크롤 시 투명하게 처리

const home = document.querySelector(".home__container");
const homeHeight = home.offsetHeight;
document.addEventListener("scroll", () => {
  home.style.opacity = 1 - window.scrollY / homeHeight;
});

//handle click on nav menu
//Navbar 토글버튼 클릭 처리

const navBarMenu = document.querySelector(".header__menu");
const navBarToggleBtn = document.querySelector(".header__toggle-btn");

//navbar 메뉴 클릭시 자동으로 닫음
navBarMenu.addEventListener("click", () => {
  navBarMenu.classList.remove("open");
});

//토글버튼 열고 닫기

navBarToggleBtn.addEventListener("click", () => {
  navBarMenu.classList.toggle("open");
});

//Projects
const categories = document.querySelector(".categories");
const projects = document.querySelectorAll(".project");
const projectsContainer = document.querySelector(".projects");
categories.addEventListener("click", (event) => {
  const filter = event.target.dataset.filter;
  if (filter == null) {
    return;
  }
  handleActiveSelection(event.target);
  filterProjects(filter);
});

function handleActiveSelection(target) {
  const active = document.querySelector(".category__selected");
  active.classList.remove("category__selected");
  target.classList.add("category__selected");
}

function filterProjects(filter) {
  projects.forEach((project) => {
    if (filter === "all" || filter === project.dataset.type) {
      project.style.display = "block";
    } else {
      project.style.display = "none";
    }
  });
  projectsContainer.classList.add("anim-out");
  setTimeout(() => {
    projectsContainer.classList.remove("anim-out");
  }, 300);
}

//스킬바 만들기 + 뷰포트에 스킬화면이 보일 경우에 checkSkills함수 이벤트 실행

function checkSkills() {
  const skillSections = document.querySelectorAll(".skill__section");

  skillSections.forEach((skillSection) => {
    const skillSectionPosition = skillSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (
      //windowHeight / 1.5 는 뷰포트를 의미
      skillSectionPosition.top <= windowHeight / 1.5 &&
      skillSectionPosition.bottom >= 0
    ) {
      const progressBar = skillSection.querySelector(".skill__progress");
      const targetWidth = skillSection.getAttribute("data-percent");

      progressBar.style.width = targetWidth;
      skillSection.style.opacity = "1";
      skillSection.style.visibility = "visible";
    } else {
      const progressBar = skillSection.querySelector(".skill__progress");
      progressBar.style.width = "0";
    }
  });
}

window.addEventListener("scroll", checkSkills);
window.addEventListener("DOMContentLoaded", checkSkills);

//모달창 만들기

const itemWrapper = document.querySelectorAll(".item__wrapper");
itemWrapper.forEach((wrapper) => {
  wrapper.addEventListener("click", () => {
    const modalId = wrapper.getAttribute("data-modal");
    const modal = document.getElementById(modalId);
    modal.classList.add("active");
    document.body.classList.add("modal-open");

    const closeModal = modal.querySelector(".close");
    closeModal.addEventListener("click", () => {
      modal.classList.remove("active");
      document.body.classList.remove("modal-open");
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
      }
    });
  });
});

// circular 언어 프로그레스 바 만들기

const progText = document.querySelectorAll(".progText");
const progress = document.querySelectorAll(".progress");
const progContainer = document.querySelector(".language__container");
let bol = false;

window.addEventListener("scroll", () => {
  if (scrollY > progContainer.offsetTop - 600 && bol === false) {
    for (let i = 0; i < progText.length; i++) {
      progText[i].innerText = 0;
      count = 0;

      progress[i].style.bottom = "83%";

      progress[i].style.bottom = progText[i].dataset.count - 100 + "%";

      function updateCount() {
        target = parseInt(progText[i].dataset.count);

        if (count < target) {
          count++;
          progText[i].innerText = count;
          setTimeout(updateCount, 50);
        } else {
          progText[i].innerText = target + "%";
        }
      }
      updateCount();
      bol = true;
    }
  }
});

//  이름에 따른 태그색상 정하기

function changeTagBackground(tagName, color) {
  const tags = document.querySelectorAll(`.tag[data-tag="${tagName}"]`);
  tags.forEach((tag) => {
    tag.style.backgroundColor = color;
  });
}

changeTagBackground("figma", "#F5CEC7");
changeTagBackground("html", "#FFF9DD");
changeTagBackground("css", "#FFF0D5");
changeTagBackground("javascript", "#D6E6ff");
changeTagBackground("photoshop", "#E5E7FB");
changeTagBackground("adobeXD", "#63465A");
