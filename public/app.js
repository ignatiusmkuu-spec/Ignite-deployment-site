// ===================== NAVBAR =====================
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
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ===================== COMMAND TABS =====================
document.querySelectorAll('.cmd-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cmd-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cmd-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// ===================== BILLING TOGGLE =====================
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
billingMonthly.addEventListener('click', () => { if (isAnnual) billingToggle.click(); });
billingAnnual.addEventListener('click', () => { if (!isAnnual) billingToggle.click(); });

// ===================== COPY INSTALL CMD =====================
function copyInstall() {
  const cmd = document.getElementById('installCmd').textContent;
  navigator.clipboard.writeText(cmd).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  });
}

// ===================== FORMS =====================
function handleSignup(e) {
  e.preventDefault();
  const msg = document.getElementById('signupMsg');
  msg.style.display = 'block';
  e.target.reset();
  setTimeout(() => { msg.style.display = 'none'; }, 5000);
}
function handleContact(e) {
  e.preventDefault();
  const msg = document.getElementById('contactMsg');
  msg.style.display = 'block';
  e.target.reset();
  setTimeout(() => { msg.style.display = 'none'; }, 5000);
}

// ===================== SCROLL ANIMATIONS =====================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.feat-card, .step, .plan-card, .testi-card, .doc-card, .int-card, .cp-panel, .cp-deploy-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.25s, box-shadow 0.25s';
  observer.observe(el);
});

// Terminal typewriter
const lines = ['tl1','tl2','tl3','tl4','tl5','tl6','tl7'];
lines.forEach((id, i) => {
  const el = document.getElementById(id);
  if (el) {
    el.style.opacity = '0';
    setTimeout(() => { el.style.transition = 'opacity 0.4s'; el.style.opacity = '1'; }, 600 + i * 700);
  }
});

// ===================== SESSION ID =====================
function genSid() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 16; i++) {
    if (i === 4 || i === 8 || i === 12) s += '-';
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

let currentSid = genSid();
function renderSid() {
  const el = document.getElementById('sidValue');
  if (el) el.textContent = currentSid;
}
renderSid();

function refreshSid() {
  currentSid = genSid();
  renderSid();
  const el = document.getElementById('sidValue');
  if (el) {
    el.style.opacity = '0.3';
    setTimeout(() => { el.style.transition = 'opacity 0.3s'; el.style.opacity = '1'; }, 50);
  }
}

function copySid() {
  const full = 'NXB-' + currentSid;
  navigator.clipboard.writeText(full).then(() => {
    const btn = document.getElementById('copySidBtn');
    btn.style.color = '#4ade80';
    btn.style.borderColor = '#4ade80';
    setTimeout(() => { btn.style.color = ''; btn.style.borderColor = ''; }, 2000);
  });
}

function saveSidVar() {
  const val = document.getElementById('sidVarName').value.trim();
  if (!val) return;
  const msg = document.getElementById('sidSaveMsg');
  msg.textContent = `✓ Variable "${val}" saved to deployment config.`;
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; }, 3500);
}

// ===================== CONTROL PANEL TABS =====================
document.querySelectorAll('.cp-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cp-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cp-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('cptab-' + tab.dataset.cptab).classList.add('active');
  });
});

// ===================== ADMIN PHONE =====================
function savePhone() {
  const country = document.getElementById('phoneCountry').value;
  const phone = document.getElementById('adminPhone').value.trim();
  const msg = document.getElementById('phoneSaveMsg');
  if (!phone) {
    msg.textContent = '⚠ Please enter a phone number.';
    msg.style.color = '#f87171';
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
    return;
  }
  msg.textContent = `✓ Saved: ${country} ${phone}. Verification code sent.`;
  msg.style.color = '#4ade80';
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; }, 4000);
}

function testSms() {
  const country = document.getElementById('phoneCountry').value;
  const phone = document.getElementById('adminPhone').value.trim();
  const msg = document.getElementById('phoneSaveMsg');
  if (!phone) {
    msg.textContent = '⚠ Enter a phone number first.';
    msg.style.color = '#f87171';
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 3000);
    return;
  }
  msg.textContent = `✓ Test SMS sent to ${country} ${phone}.`;
  msg.style.color = '#60a5fa';
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; }, 4000);
}

// ===================== DEPLOY MODAL =====================
let deployStartTime = null;

function openDeployModal() {
  const env = (document.getElementById('deployEnvSelect') || {}).value || 'production';
  const tag = (document.getElementById('deployTag') || {}).value || 'app:latest';
  const sid = 'NXB-' + currentSid;

  const mEnv = document.getElementById('mEnv');
  const mEnvCode = document.getElementById('mEnvCode');
  const mTag = document.getElementById('mTag');
  const mSid = document.getElementById('mSid');
  if (mEnv) mEnv.textContent = env;
  if (mEnvCode) mEnvCode.textContent = env;
  if (mTag) mTag.textContent = tag;
  if (mSid) mSid.textContent = sid;

  showModalStep(1);
  document.getElementById('deployModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDeployModal() {
  document.getElementById('deployModal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeDeployModalOutside(e) {
  if (e.target === document.getElementById('deployModal')) closeDeployModal();
}

function showModalStep(n) {
  [1,2,3].forEach(i => {
    const el = document.getElementById('mStep' + i);
    if (el) el.style.display = i === n ? 'block' : 'none';
  });
}

const deploySteps = [
  { label: 'Authenticating with registry...', pct: 10 },
  { label: 'Pulling image from registry...', pct: 25 },
  { label: 'Running pre-deploy health checks...', pct: 40 },
  { label: 'Draining old pods...', pct: 55 },
  { label: 'Applying new deployment spec...', pct: 70 },
  { label: 'Waiting for replicas to become healthy...', pct: 85 },
  { label: 'Shifting traffic to new pods...', pct: 95 },
  { label: 'Verifying endpoint health...', pct: 100 },
];

function startDeploy() {
  showModalStep(2);
  deployStartTime = Date.now();
  const fill = document.getElementById('mProgressFill');
  const label = document.getElementById('mProgressLabel');
  const log = document.getElementById('mLog');
  log.innerHTML = '';
  let i = 0;

  function nextStep() {
    if (i >= deploySteps.length) {
      const elapsed = ((Date.now() - deployStartTime) / 1000).toFixed(1) + 's';
      showModalStep(3);
      const tag = (document.getElementById('deployTag') || {}).value || 'app:latest';
      const mFinalTag = document.getElementById('mFinalTag');
      const mDeployTime = document.getElementById('mDeployTime');
      if (mFinalTag) mFinalTag.textContent = tag;
      if (mDeployTime) mDeployTime.textContent = elapsed;
      return;
    }
    const step = deploySteps[i];
    if (fill) fill.style.width = step.pct + '%';
    if (label) label.textContent = step.label;
    if (log) log.innerHTML += `<div>✓ ${step.label}</div>`;
    if (log) log.scrollTop = log.scrollHeight;
    i++;
    setTimeout(nextStep, 600 + Math.random() * 400);
  }
  nextStep();
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDeployModal();
});
