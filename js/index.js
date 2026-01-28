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

// 모바일 기기 감지 함수 (980px 기준)
function isMobileDevice() {
  return window.innerWidth <= 980;
}

// 사이드 도트 네비게이션
const sections = document.querySelectorAll('main > section');
const dotNavItems = document.querySelectorAll('.dot-nav__item');

// 도트 클릭 시 해당 섹션으로 이동
dotNavItems.forEach(dot => {
  dot.addEventListener('click', () => {
    let sectionId = dot.getAttribute('data-section');
    
    // 980px 이하에서 about을 about-profile로 변경
    if (isMobileDevice() && sectionId === 'about') {
      sectionId = 'about-profile';
    }
    
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
      let sectionId = entry.target.id;
      
      // 980px 이하에서 about-profile을 about으로 매칭
      if (isMobileDevice() && sectionId === 'about-profile') {
        sectionId = 'about';
      }
      
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
    let targetId = link.getAttribute('href').substring(1);
    
    // 980px 이하에서 about을 about-profile로 변경
    if (isMobileDevice() && targetId === 'about') {
      targetId = 'about-profile';
    }
    
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// 마우스 포인터 (데스크톱만)
// 데스크톱에서만 커서 효과 실행 (980px 초과)
if (!isMobileDevice()) {
  (function() {
    'use strict';
    
    // Utility functions
    function smoothStep(a, b, t) {
      t = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return t * t * (3 - 2 * t);
    }
    function length(x, y) {
      return Math.sqrt(x * x + y * y);
    }
    function roundedRectSDF(x, y, width, height, radius) {
      const qx = Math.abs(x) - width + radius;
      const qy = Math.abs(y) - height + radius;
      return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
    }
    function texture(x, y) {
      return { type: 't', x, y };
    }
    function generateId() {
      return 'liquid-cursor-' + Math.random().toString(36).substr(2, 9);
    }
    // Liquid Glass Cursor class
    class LiquidCursor {
      constructor(options = {}) {
        this.width = options.width || 80;
        this.height = options.height || 60;
        this.fragment = options.fragment || ((uv) => texture(uv.x, uv.y));
        this.canvasDPI = 1;
        this.id = generateId();
        
        this.mouse = { x: 0, y: 0 };
        this.currentPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.targetPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        this.createElement();
        this.setupEventListeners();
        this.updateShader();
        this.animate();
      }
      createElement() {
        // Create container
        this.container = document.getElementById('liquid-container') || document.createElement('div');
        this.container.id = 'liquid-container';
        this.container.style.width = `${this.width}px`;
        this.container.style.height = `${this.height}px`;
        this.container.style.backdropFilter = `url(#${this.id}_filter) blur(0.25px) brightness(1.5) saturate(1.1)`;
        // Create SVG filter
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        this.svg.setAttribute('width', '0');
        this.svg.setAttribute('height', '0');
        this.svg.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 9998;
        `;
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', `${this.id}_filter`);
        filter.setAttribute('filterUnits', 'userSpaceOnUse');
        filter.setAttribute('colorInterpolationFilters', 'sRGB');
        filter.setAttribute('x', '0');
        filter.setAttribute('y', '0');
        filter.setAttribute('width', this.width.toString());
        filter.setAttribute('height', this.height.toString());
        this.feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
        this.feImage.setAttribute('id', `${this.id}_map`);
        this.feImage.setAttribute('width', this.width.toString());
        this.feImage.setAttribute('height', this.height.toString());
        this.feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        this.feDisplacementMap.setAttribute('in', 'SourceGraphic');
        this.feDisplacementMap.setAttribute('in2', `${this.id}_map`);
        this.feDisplacementMap.setAttribute('xChannelSelector', 'R');
        this.feDisplacementMap.setAttribute('yChannelSelector', 'G');
        filter.appendChild(this.feImage);
        filter.appendChild(this.feDisplacementMap);
        defs.appendChild(filter);
        this.svg.appendChild(defs);
        // Create canvas for displacement map (hidden)
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width * this.canvasDPI;
        this.canvas.height = this.height * this.canvasDPI;
        this.canvas.style.display = 'none';
        this.context = this.canvas.getContext('2d');
      }
      setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
          this.targetPos.x = e.clientX;
          this.targetPos.y = e.clientY;
        });
      }
      animate() {
        // Smooth follow effect
        const lerp = 0.15;
        this.currentPos.x += (this.targetPos.x - this.currentPos.x) * lerp;
        this.currentPos.y += (this.targetPos.y - this.currentPos.y) * lerp;
        // Update container position (centered on cursor)
        this.container.style.left = `${this.currentPos.x - this.width / 2}px`;
        this.container.style.top = `${this.currentPos.y - this.height / 2}px`;
        requestAnimationFrame(() => this.animate());
      }
      updateShader() {
        const w = this.width * this.canvasDPI;
        const h = this.height * this.canvasDPI;
        const data = new Uint8ClampedArray(w * h * 4);
        let maxScale = 0;
        const rawValues = [];
        for (let i = 0; i < data.length; i += 4) {
          const x = (i / 4) % w;
          const y = Math.floor(i / 4 / w);
          const pos = this.fragment({ x: x / w, y: y / h });
          const dx = pos.x * w - x;
          const dy = pos.y * h - y;
          maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
          rawValues.push(dx, dy);
        }
        maxScale *= 0.5;
        let index = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = rawValues[index++] / maxScale + 0.5;
          const g = rawValues[index++] / maxScale + 0.5;
          data[i] = r * 255;
          data[i + 1] = g * 255;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
        this.context.putImageData(new ImageData(data, w, h), 0, 0);
        this.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.canvas.toDataURL());
        this.feDisplacementMap.setAttribute('scale', (maxScale / this.canvasDPI).toString());
      }
      appendTo(parent) {
        parent.appendChild(this.svg);
        parent.appendChild(this.container);
      }
    }
    // Create the liquid glass cursor
    const cursor = new LiquidCursor({
      width: 50,
      height: 50,
      fragment: (uv) => {
        const ix = uv.x - 0.5;
        const iy = uv.y - 0.5;
        const distanceToEdge = roundedRectSDF(
          ix,
          iy,
          0.3,
          0.2,
          0.6
        );
        const displacement = smoothStep(0.8, 0, distanceToEdge - 0.15);
        const scaled = smoothStep(0, 1, displacement);
        return texture(ix * scaled + 0.5, iy * scaled + 0.5);
      }
    });
    cursor.appendTo(document.body);
  })();
}
