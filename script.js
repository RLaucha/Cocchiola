// Toggle menú mobile con accesibilidad
const navToggle = document.getElementById('navToggle');
const siteMenu = document.getElementById('siteMenu');

function toggleMenu(force){
  const open = (typeof force === 'boolean') ? force : siteMenu.style.display !== 'flex';
  siteMenu.style.display = open ? 'flex' : 'none';
  navToggle.setAttribute('aria-expanded', String(open));
}
navToggle?.addEventListener('click', () => toggleMenu());

// Cierra menú al tocar un link (en móvil)
siteMenu?.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click', ()=>{
    if (window.matchMedia('(max-width: 860px)').matches) toggleMenu(false);
  });
});

// Dropdowns en mobile (abre/cierra al tocar)
document.querySelectorAll('.dropdown .dropbtn').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    if (window.matchMedia('(max-width: 860px)').matches) {
      e.preventDefault();
      btn.parentElement.classList.toggle('open');
    }
  });
});

// Mejora: corrección del scroll a anclas por header sticky
function smoothAnchorFix(){
  const hash = window.location.hash;
  if (!hash) return;
  const el = document.querySelector(hash);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 80; // altura aprox del header
  window.scrollTo({ top: y, behavior: 'smooth' });
}
window.addEventListener('load', smoothAnchorFix);

// Form simple (mailto). Si luego usás Formspree/Netlify, reemplazá este bloque.
document.getElementById('contactForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  window.location.href = 'mailto:ventas@cocchiola.com.ar'
    + '?subject=' + encodeURIComponent('Consulta desde la web')
    + '&body=' + encodeURIComponent('Hola, necesito asesoramiento. ');
});
/* ====== Formspree AJAX ====== */
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

function setStatus(msg, ok = true){
  if(!statusEl) return;
  statusEl.textContent = msg;
  statusEl.style.color = ok ? 'var(--brand-500)' : '#d9534f';
}

form?.addEventListener('submit', async (e)=>{
  e.preventDefault();

  const data = new FormData(form);
  data.append('_subject', 'Nueva consulta desde cocchiola.com.ar');
  setStatus('Enviando…', true);

  try{
    const resp = await fetch("https://formspree.io/f/xdklpqdk", {
      method: "POST",
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (resp.ok){
      form.reset();
      setStatus('¡Gracias! Tu mensaje fue enviado correctamente.', true);
    } else {
      setStatus('No se pudo enviar. Escribinos a administracion@cocchiola.com.ar', false);
    }
  }catch(err){
    setStatus('Error de conexión. Intentá nuevamente.', false);
  }
});
/* ====== Splash / Ventana con logo ====== */
(function(){
  const KEY = "cocchiola_splash_v1_dismissed";
  const backdrop = document.getElementById("splashBackdrop");
  const btnClose = document.getElementById("splashClose");
  const btnSeeMore = document.getElementById("splashSeeMore");

  if(!backdrop) return;

  function openSplash(){
    backdrop.classList.add("is-open");
    backdrop.setAttribute("aria-hidden","false");
    // evitar scroll de fondo
    document.documentElement.style.overflow = "hidden";
  }
  function closeSplash(){
    backdrop.classList.remove("is-open");
    backdrop.setAttribute("aria-hidden","true");
    document.documentElement.style.overflow = "";
    // recordamos que ya la vio
    try{ localStorage.setItem(KEY, "1"); }catch(e){}
  }

  // abrir solo si no la cerró antes
  const dismissed = (()=>{ try{ return localStorage.getItem(KEY)==="1"; }catch(e){ return false } })();
  if(!dismissed){
    setTimeout(openSplash, 600); // leve delay para estética
  }

  // eventos
  btnClose?.addEventListener("click", closeSplash);
  btnSeeMore?.addEventListener("click", closeSplash);

  // cerrar con clic fuera
  backdrop.addEventListener("click", (e)=>{
    if(e.target === backdrop) closeSplash();
  });
  // cerrar con ESC
  window.addEventListener("keydown", (e)=>{
    if(e.key === "Escape" && backdrop.classList.contains("is-open")) closeSplash();
  });
})();

// Stories (tipo Instagram)
(() => {
  const carousels = document.querySelectorAll('.stories');
  if (!carousels.length) return;

  const inView = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };

  carousels.forEach((root) => {
    const track = root.querySelector('.stories__track');
    const items = Array.from(root.querySelectorAll('.stories__item'));
    const bars  = Array.from(root.querySelectorAll('.stories__bar'));
    const prev  = root.querySelector('.stories__tap--prev');
    const next  = root.querySelector('.stories__tap--next');

    let i = items.findIndex(el => el.classList.contains('is-active'));
    if (i < 0) i = 0;
    let timer = null;
    let paused = false;

    const setActive = (idx) => {
      items.forEach((el, k) => el.classList.toggle('is-active', k === idx));
      bars.forEach((b, k) => {
        b.classList.toggle('is-active', k === idx);
        b.style.setProperty('--done', k < idx ? '100%' : '0%');
        // reset progress anim
        b.querySelector(':scope::before');
      });
      // Reinicia anim CSS
      bars.forEach((b, k) => {
        const bar = b;
        bar.style.setProperty('animation', 'none');
        bar.offsetHeight; // reflow
        bar.style.removeProperty('animation');
        if (k === idx) {
          const dur = Number(items[idx].dataset.duration || root.dataset.interval || 5000);
          bar.style.animationDuration = dur + 'ms';
          bar.classList.add('is-active');
        } else {
          bar.classList.remove('is-active');
        }
      });
      i = idx;
    };

    const nextSlide = () => setActive((i + 1) % items.length);
    const prevSlide = () => setActive((i - 1 + items.length) % items.length);

    const play = () => {
      clearTimeout(timer);
      const dur = Number(items[i].dataset.duration || root.dataset.interval || 5000);
      timer = setTimeout(() => { if (!paused && inView(root)) { nextSlide(); play(); } }, dur);
    };
    const pause = () => { paused = true; clearTimeout(timer); };
    const resume = () => { paused = false; play(); };

    // Eventos
    next?.addEventListener('click', () => { nextSlide(); play(); });
    prev?.addEventListener('click', () => { prevSlide(); play(); });

    // Teclado
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { nextSlide(); play(); }
      if (e.key === 'ArrowLeft')  { prevSlide(); play(); }
    });
    root.setAttribute('tabindex', '0');

    // Hover / Touch
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', resume);
    let touchX = null;
    root.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; pause(); }, {passive:true});
    root.addEventListener('touchend', (e) => {
      if (touchX != null) {
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) { (dx < 0 ? nextSlide : prevSlide)(); }
      }
      touchX = null; resume();
    });

    // Visibility (IntersectionObserver)
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => { paused = !entry.isIntersecting; if (!paused) play(); });
    }, {threshold: 0.25});
    io.observe(root);

    // Init
    setActive(i);
    if (root.dataset.autoplay !== 'false') play();
  });
})();

/* ====== Carrusel de Representadas (logos) ====== */
(() => {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsWrap = document.getElementById('carouselDots');
  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  const items = Array.from(track.children);
  const total = items.length;
  let page = 0;

  /* Cuántos se ven según el viewport */
  function getVisible(){
    const w = window.innerWidth;
    if (w <= 640) return 2;
    if (w <= 1024) return 3;
    return 5;
  }

  function getMaxPage(){
    return Math.max(0, total - getVisible());
  }

  /* Mover track */
  function goTo(p){
    const visible = getVisible();
    const maxP = getMaxPage();
    page = Math.max(0, Math.min(p, maxP));

    // Calcular el ancho de un item + gap
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    const itemW = items[0].offsetWidth + gap;
    track.style.transform = `translateX(-${page * itemW}px)`;

    updateArrows();
    updateDots();
  }

  function updateArrows(){
    prevBtn.disabled = page <= 0;
    nextBtn.disabled = page >= getMaxPage();
  }

  /* Dots */
  function buildDots(){
    dotsWrap.innerHTML = '';
    const pages = getMaxPage() + 1;
    for(let i = 0; i < pages; i++){
      const dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === page ? ' is-active' : '');
      dot.setAttribute('aria-label', `Página ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots(){
    const dots = dotsWrap.querySelectorAll('.carousel__dot');
    dots.forEach((d, i) => d.classList.toggle('is-active', i === page));
  }

  /* Eventos */
  prevBtn.addEventListener('click', () => goTo(page - 1));
  nextBtn.addEventListener('click', () => goTo(page + 1));

  /* Touch / swipe */
  let touchX = null;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, {passive: true});
  track.addEventListener('touchend', e => {
    if(touchX !== null){
      const dx = e.changedTouches[0].clientX - touchX;
      if(Math.abs(dx) > 40){
        dx < 0 ? goTo(page + 1) : goTo(page - 1);
      }
    }
    touchX = null;
  });

  /* Keyboard */
  const carousel = document.getElementById('representadasCarousel');
  carousel?.addEventListener('keydown', e => {
    if(e.key === 'ArrowRight') goTo(page + 1);
    if(e.key === 'ArrowLeft') goTo(page - 1);
  });
  carousel?.setAttribute('tabindex', '0');

  /* Rebuild on resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if(page > getMaxPage()) page = getMaxPage();
      buildDots();
      goTo(page);
    }, 150);
  });

  /* Init */
  buildDots();
  goTo(0);
})();



/* ====== Animaciones Globales AOS ====== */
document.querySelectorAll('.grid').forEach(grid => {
  Array.from(grid.querySelectorAll('.card')).forEach((card, index) => {
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', (index * 100).toString());
  });
});
document.querySelectorAll('main section.card h2').forEach(h2 => h2.setAttribute('data-aos', 'fade-right'));
document.querySelectorAll('main section.card p, main section.card ul').forEach(el => el.setAttribute('data-aos', 'fade-left'));

// Delay de offset para los elementos generados asincrónicamente o que requieran recalculo
setTimeout(() => { AOS.init({ duration: 800 }); }, 50);
