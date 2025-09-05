// Toggle menú mobile
const navToggle = document.getElementById('navToggle');
const siteMenu = document.getElementById('siteMenu');
navToggle?.addEventListener('click', () => {
  siteMenu.style.display = siteMenu.style.display === 'flex' ? 'none' : 'flex';
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

// Manejo simple del form: redirige a mail (ajustá si usás Formspree/Netlify)
document.getElementById('contactForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  window.location.href = 'mailto:administracion@cocchiola.com.ar'
    + '?subject=' + encodeURIComponent('Consulta desde la web')
    + '&body=' + encodeURIComponent('Hola, necesito asesoramiento. ');
});
