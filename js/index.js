  // 현재 연도 표시
  document.getElementById('year').textContent = new Date().getFullYear();

  // 헤더 스크롤 효과
  const header = document.getElementById('header');
  const main = document.getElementById('main');
  
  main.addEventListener('scroll', () => {
    if (main.scrollTop > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 사이드 도트 네비게이션
  const sections = document.querySelectorAll('main > section');
  const dotNavItems = document.querySelectorAll('.dot-nav__item');

  // 도트 클릭 시 해당 섹션으로 이동
  dotNavItems.forEach(dot => {
    dot.addEventListener('click', () => {
      const sectionId = dot.getAttribute('data-section');
      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 스크롤 시 현재 섹션 하이라이트
  const observerOptions = {
    root: main,
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        dotNavItems.forEach(dot => {
          if (dot.getAttribute('data-section') === sectionId) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  // 모바일 메뉴 닫기
  const navLinks = document.querySelectorAll('nav a');
  const navToggle = document.getElementById('nav-toggle');
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.checked = false;
    });
  });

  // 헤더 네비게이션 클릭 시 메인 컨테이너 내에서 스크롤
  document.querySelectorAll('header nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });