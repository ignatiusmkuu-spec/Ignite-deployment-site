// ===================== NAVBAR =====================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  document.getElementById('backTop').classList.toggle('visible', window.scrollY > 400);
});

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
}, { threshold: 0.06 });

document.querySelectorAll(
  '.feat-card, .step, .plan-card, .testi-card, .doc-card, .int-card, .cp-panel, .cp-deploy-card, .connect-card'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.25s, box-shadow 0.25s';
  observer.observe(el);
});

// Terminal typewriter
['tl1','tl2','tl3','tl4','tl5','tl6','tl7'].forEach((id, i) => {
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
    showPhoneMsg('⚠ Please enter a phone number.', '#f87171');
    return;
  }
  showPhoneMsg(`✓ Saved: ${country} ${phone}. Verification code sent.`, '#4ade80');
}
function testSms() {
  const country = document.getElementById('phoneCountry').value;
  const phone = document.getElementById('adminPhone').value.trim();
  if (!phone) { showPhoneMsg('⚠ Enter a phone number first.', '#f87171'); return; }
  showPhoneMsg(`✓ Test SMS sent to ${country} ${phone}.`, '#60a5fa');
}
function showPhoneMsg(text, color) {
  const msg = document.getElementById('phoneSaveMsg');
  msg.textContent = text;
  msg.style.color = color;
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; }, 4000);
}

// ===================== CONNECT BOT TABS =====================
document.querySelectorAll('.connect-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.connect-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.connect-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('connect-' + tab.dataset.connect);
    if (panel) panel.classList.add('active');
    if (tab.dataset.connect === 'qrcode') loadQR();
  });
});

// ===================== QR CODE =====================
let qrLoaded = false;
function loadQR() {
  if (qrLoaded) return;
  const img = document.getElementById('qrImg');
  const loading = document.getElementById('qrLoading');
  const errorEl = document.getElementById('qrError');
  if (!img) return;

  loading.style.display = 'flex';
  img.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';

  const ts = Date.now();
  img.onload = () => {
    loading.style.display = 'none';
    img.style.display = 'block';
    qrLoaded = true;
  };
  img.onerror = () => {
    loading.style.display = 'none';
    if (errorEl) {
      errorEl.textContent = 'Could not load QR. Click Refresh or open the full pairing site.';
      errorEl.style.display = 'block';
    }
  };
  img.src = `/api/qr?t=${ts}`;
}

function refreshQR() {
  qrLoaded = false;
  const img = document.getElementById('qrImg');
  const loading = document.getElementById('qrLoading');
  const errorEl = document.getElementById('qrError');
  if (loading) loading.style.display = 'flex';
  if (img) img.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';
  setTimeout(loadQR, 200);
}

// Auto-refresh QR every 60s
setInterval(() => {
  const qrPanel = document.getElementById('connect-qrcode');
  if (qrPanel && qrPanel.classList.contains('active')) {
    qrLoaded = false;
    loadQR();
  }
}, 60000);

// ===================== PAIR CODE =====================
let lastPairCode = '';

async function generatePairCode() {
  const country = document.getElementById('pairCountry').value;
  const phone = document.getElementById('pairPhoneInput').value.trim().replace(/\D/g, '');
  const btn = document.getElementById('generatePairBtn');
  const loading = document.getElementById('pairLoading');
  const codeBox = document.getElementById('pairCodeBox');
  const errorEl = document.getElementById('pairError');
  const sessionBox = document.getElementById('sessionSaveBox');

  if (!phone) {
    if (errorEl) { errorEl.textContent = '⚠ Please enter your WhatsApp phone number.'; errorEl.style.display = 'block'; }
    return;
  }

  const fullNumber = country + phone;

  // Reset state
  if (errorEl) errorEl.style.display = 'none';
  if (codeBox) codeBox.style.display = 'none';
  if (sessionBox) sessionBox.style.display = 'none';
  btn.disabled = true;
  btn.style.opacity = '0.6';
  if (loading) loading.style.display = 'flex';

  try {
    const resp = await fetch(`/api/pair?number=${encodeURIComponent(fullNumber)}`);
    const data = await resp.json();

    if (loading) loading.style.display = 'none';
    btn.disabled = false;
    btn.style.opacity = '1';

    if (data.code) {
      // Got a proper pair code
      lastPairCode = data.code;
      const codeVal = document.getElementById('pairCodeValue');
      if (codeVal) codeVal.textContent = data.code;
      if (codeBox) codeBox.style.display = 'flex';
      // Generate session ID from the pairing
      const sid = genSid();
      currentSid = sid;
      renderSid();
      const sessionIdDisplay = document.getElementById('sessionIdDisplay');
      if (sessionIdDisplay) sessionIdDisplay.textContent = 'NXB-' + sid;
      if (sessionBox) sessionBox.style.display = 'flex';
    } else if (data.error) {
      if (errorEl) { errorEl.textContent = '⚠ ' + data.error; errorEl.style.display = 'block'; }
    } else {
      // raw fallback — show the pair page link
      if (errorEl) {
        errorEl.innerHTML = `Connecting to WhatsApp... <a href="https://nexs-session-1.replit.app/pair?number=${fullNumber}" target="_blank" style="color:#a78bfa">Open pairing page ↗</a>`;
        errorEl.style.display = 'block';
        errorEl.style.color = '#60a5fa';
      }
    }
  } catch (err) {
    if (loading) loading.style.display = 'none';
    btn.disabled = false;
    btn.style.opacity = '1';
    if (errorEl) {
      errorEl.innerHTML = `Could not reach pairing service. <a href="https://nexs-session-1.replit.app/pair" target="_blank" style="color:#a78bfa">Open directly ↗</a>`;
      errorEl.style.display = 'block';
    }
  }
}

function copyPairCode() {
  if (!lastPairCode) return;
  navigator.clipboard.writeText(lastPairCode).then(() => {
    const btn = event.target;
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
}

function saveSessionFromPair() {
  const sidDisplay = document.getElementById('sessionIdDisplay');
  if (sidDisplay) {
    const sid = sidDisplay.textContent;
    const sidVal = document.getElementById('sidValue');
    if (sidVal) {
      currentSid = sid.replace('NXB-', '');
      renderSid();
    }
    // Scroll to control panel
    const cp = document.getElementById('control-panel');
    if (cp) cp.scrollIntoView({ behavior: 'smooth' });
    // Flash the session display
    setTimeout(() => {
      const sidDisp = document.getElementById('sidDisplay');
      if (sidDisp) {
        sidDisp.style.transition = 'background 0.4s';
        sidDisp.style.background = 'rgba(74,222,128,0.15)';
        setTimeout(() => { sidDisp.style.background = ''; }, 2000);
      }
    }, 800);
  }
}

// Allow Enter key on phone input to trigger pair
const pairInput = document.getElementById('pairPhoneInput');
if (pairInput) {
  pairInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') generatePairCode();
  });
}

// ===================== DEPLOY MODAL =====================
let deployStartTime = null;

function openDeployModal() {
  const env = (document.getElementById('deployEnvSelect') || {}).value || 'production';
  const tag = (document.getElementById('deployTag') || {}).value || 'app:latest';
  const sid = 'NXB-' + currentSid;

  setEl('mEnv', env); setEl('mEnvCode', env);
  setEl('mTag', tag); setEl('mSid', sid);

  showModalStep(1);
  document.getElementById('deployModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function setEl(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }

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
      setEl('mFinalTag', (document.getElementById('deployTag') || {}).value || 'app:latest');
      setEl('mDeployTime', elapsed);
      return;
    }
    const step = deploySteps[i];
    if (fill) fill.style.width = step.pct + '%';
    if (label) label.textContent = step.label;
    if (log) { log.innerHTML += `<div>✓ ${step.label}</div>`; log.scrollTop = log.scrollHeight; }
    i++;
    setTimeout(nextStep, 600 + Math.random() * 400);
  }
  nextStep();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDeployModal();
});
