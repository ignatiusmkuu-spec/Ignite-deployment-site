// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  document.getElementById('backTop').classList.toggle('visible', window.scrollY > 400);
});

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close nav on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Command tabs
document.querySelectorAll('.cmd-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cmd-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cmd-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// Billing toggle
const billingToggle = document.getElementById('billingToggle');
const billingMonthly = document.getElementById('billingMonthly');
const billingAnnual = document.getElementById('billingAnnual');
let isAnnual = false;

billingToggle.addEventListener('click', () => {
  isAnnual = !isAnnual;
  billingToggle.classList.toggle('on', isAnnual);
  billingMonthly.classList.toggle('active', !isAnnual);
  billingAnnual.classList.toggle('active', isAnnual);
  document.querySelectorAll('.price-amount').forEach(el => {
    el.textContent = isAnnual ? el.dataset.annual : el.dataset.monthly;
  });
});

billingMonthly.addEventListener('click', () => {
  if (isAnnual) billingToggle.click();
});
billingAnnual.addEventListener('click', () => {
  if (!isAnnual) billingToggle.click();
});

// Copy install command
function copyInstall() {
  const cmd = document.getElementById('installCmd').textContent;
  navigator.clipboard.writeText(cmd).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

// Signup form
function handleSignup(e) {
  e.preventDefault();
  const msg = document.getElementById('signupMsg');
  msg.style.display = 'block';
  e.target.reset();
  setTimeout(() => { msg.style.display = 'none'; }, 5000);
}

// Contact form
function handleContact(e) {
  e.preventDefault();
  const msg = document.getElementById('contactMsg');
  msg.style.display = 'block';
  e.target.reset();
  setTimeout(() => { msg.style.display = 'none'; }, 5000);
}

// Intersection observer for scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.feat-card, .step, .plan-card, .testi-card, .doc-card, .int-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.25s, box-shadow 0.25s';
  observer.observe(el);
});

// Terminal animation (typewriter style on load)
const lines = ['tl1','tl2','tl3','tl4','tl5','tl6','tl7'];
lines.forEach((id, i) => {
  const el = document.getElementById(id);
  if (el) {
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.transition = 'opacity 0.4s';
      el.style.opacity = '1';
    }, 600 + i * 700);
  }
});
