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

// ===================== M-PESA PAYMENT =====================
let mpesaAmount = 100;
let mpesaPlanName = 'Monthly Subscription';
let mpesaCheckoutId = '';
let mpesaMerchantId = '';
let mpesaPollInterval = null;
let mpesaCountdownTimer = null;
let mpesaCountdownSecs = 60;
let mpesaPhoneFormatted = '';

function openMpesaModal(amount, planName) {
  mpesaAmount = amount;
  mpesaPlanName = planName;
  setEl('mpAmount', amount);
  setEl('mpPlanLabel', planName);
  setEl('mpPlanLabel2', planName);
  document.getElementById('mpPhone').value = '';
  const errEl = document.getElementById('mpError');
  if (errEl) errEl.style.display = 'none';
  showMpStep(1);
  document.getElementById('mpesaModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('mpPhone').focus(), 200);
}

function closeMpesaModal() {
  cancelMpesaPoll();
  document.getElementById('mpesaModal').classList.remove('open');
  document.body.style.overflow = '';
}

function closeMpesaModalOutside(e) {
  if (e.target === document.getElementById('mpesaModal')) closeMpesaModal();
}

function showMpStep(n) {
  [1,2,3,4].forEach(i => {
    const el = document.getElementById('mpStep' + i);
    if (el) el.style.display = i === n ? 'block' : 'none';
  });
}

function formatMpesaPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length >= 9) {
    return '254' + digits.slice(1);
  }
  if (digits.startsWith('254') && digits.length >= 12) {
    return digits;
  }
  if (digits.startsWith('7') || digits.startsWith('1')) {
    return '254' + digits;
  }
  return '254' + digits;
}

async function sendStkPush() {
  const rawPhone = document.getElementById('mpPhone').value.trim();
  const errEl = document.getElementById('mpError');
  errEl.style.display = 'none';

  if (!rawPhone) {
    errEl.textContent = 'Please enter your M-Pesa phone number.';
    errEl.style.display = 'block';
    return;
  }

  const phone = formatMpesaPhone(rawPhone);

  if (!/^2547\d{8}$/.test(phone) && !/^2541\d{8}$/.test(phone)) {
    errEl.textContent = 'Enter a valid Safaricom number (07xx or 01xx), e.g. 0712345678.';
    errEl.style.display = 'block';
    return;
  }

  mpesaPhoneFormatted = phone;

  const btn = document.getElementById('mpSendBtn');
  btn.disabled = true;
  btn.style.opacity = '0.6';

  try {
    const resp = await fetch('https://mpesapi.giftedtech.co.ke/api/payNexusTech.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ phoneNumber: phone, amount: mpesaAmount })
    });
    const data = await resp.json();

    btn.disabled = false;
    btn.style.opacity = '1';

    if (data.success && data.CheckoutRequestID) {
      mpesaCheckoutId = data.CheckoutRequestID;
      mpesaMerchantId = data.MerchantRequestID || '';

      const display = '+254 ' + phone.slice(3, 6) + ' ' + phone.slice(6, 9) + ' ' + phone.slice(9);
      setEl('mpDisplayPhone', display);

      showMpStep(2);
      startMpesaCountdown();
      startMpesaPoll();
    } else {
      errEl.textContent = data.message || data.errorMessage || 'Failed to send STK push. Please try again.';
      errEl.style.display = 'block';
    }
  } catch (e) {
    btn.disabled = false;
    btn.style.opacity = '1';
    errEl.textContent = 'Network error. Check your connection and try again.';
    errEl.style.display = 'block';
  }
}

function startMpesaCountdown() {
  mpesaCountdownSecs = 60;
  const countEl = document.getElementById('mpCountdown');
  const fill = document.getElementById('mpTimerFill');
  if (fill) fill.style.width = '100%';
  clearInterval(mpesaCountdownTimer);
  mpesaCountdownTimer = setInterval(() => {
    mpesaCountdownSecs--;
    if (countEl) countEl.textContent = mpesaCountdownSecs;
    const pct = (mpesaCountdownSecs / 60) * 100;
    if (fill) fill.style.width = pct + '%';
    if (mpesaCountdownSecs <= 0) {
      clearInterval(mpesaCountdownTimer);
    }
  }, 1000);
}

function startMpesaPoll() {
  let attempts = 0;
  const maxAttempts = 40;
  clearInterval(mpesaPollInterval);

  async function poll() {
    attempts++;
    try {
      const statusEl = document.getElementById('mpPollStatus');

      const resp = await fetch('https://mpesapi.giftedtech.co.ke/api/verify-transaction.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutRequestId: mpesaCheckoutId })
      });
      const data = await resp.json();

      if (data.success && data.status === 'completed') {
        cancelMpesaPoll();
        showPaymentSuccess(data.data);
        return;
      }

      if (!data.success && data.status && data.status !== 'pending') {
        cancelMpesaPoll();
        showPaymentFailed(data.status, data.data);
        return;
      }

      if (statusEl) statusEl.textContent = 'Waiting for payment confirmation...';

    } catch (e) {
      // silent, keep polling
    }

    if (attempts >= maxAttempts) {
      cancelMpesaPoll();
      showPaymentFailed('timeout', null);
    }
  }

  setTimeout(poll, 1000);
  mpesaPollInterval = setInterval(poll, 2000);
}

function cancelMpesaPoll() {
  clearInterval(mpesaPollInterval);
  clearInterval(mpesaCountdownTimer);
  mpesaPollInterval = null;
  mpesaCountdownTimer = null;
}

function showPaymentSuccess(data) {
  showMpStep(3);
  setEl('mpReceiptPlan', mpesaPlanName);
  setEl('mpReceiptAmount', 'KSH ' + (data.Amount || mpesaAmount));
  setEl('mpReceiptCode', data.MpesaReceiptNumber || '—');
  const phone = data.PhoneNumber ? ('+' + data.PhoneNumber) : mpesaPhoneFormatted;
  setEl('mpReceiptPhone', phone);

  if (data.TransactionDate) {
    const d = String(data.TransactionDate);
    try {
      const fmt = d.slice(0,4)+'-'+d.slice(4,6)+'-'+d.slice(6,8)+' '+d.slice(8,10)+':'+d.slice(10,12)+':'+d.slice(12,14);
      setEl('mpReceiptDate', fmt);
    } catch(e) { setEl('mpReceiptDate', d); }
  } else {
    setEl('mpReceiptDate', new Date().toLocaleString());
  }
}

function showPaymentFailed(status, data) {
  showMpStep(4);
  const iconEl = document.getElementById('mpFailIcon');
  const titleEl = document.getElementById('mpFailTitle');
  const descEl = document.getElementById('mpFailDesc');

  const messages = {
    cancelled: { icon: '&#10005;', title: 'Payment Cancelled', desc: 'You cancelled the M-Pesa request. You can try again anytime.' },
    failed_insufficient_funds: { icon: '&#128184;', title: 'Insufficient Funds', desc: 'Your M-Pesa balance is too low. Please top up and try again.' },
    timeout: { icon: '&#9200;', title: 'Request Timed Out', desc: 'The STK push timed out or your phone couldn\'t be reached. Please try again.' },
    failed: { icon: '&#10005;', title: 'Payment Failed', desc: (data && data.ResultDesc) || 'The payment could not be processed. Please try again.' }
  };

  const msg = messages[status] || messages.failed;
  if (iconEl) iconEl.innerHTML = msg.icon;
  if (titleEl) titleEl.textContent = msg.title;
  if (descEl) descEl.textContent = msg.desc;
}

function retryMpesa() {
  showMpStep(1);
}


const mpPhoneInput = document.getElementById('mpPhone');
if (mpPhoneInput) {
  mpPhoneInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendStkPush();
  });
}

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

// ===================== IMPORT SESSION =====================
function switchToSessionTab() {
  document.querySelectorAll('.cp-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.cp-content').forEach(c => c.classList.remove('active'));
  const sessionTab = document.querySelector('.cp-tab[data-cptab="session"]');
  if (sessionTab) sessionTab.classList.add('active');
  const sessionContent = document.getElementById('cptab-session');
  if (sessionContent) sessionContent.classList.add('active');
  const sidDisp = document.getElementById('sidDisplay');
  if (sidDisp) {
    sidDisp.style.transition = 'background 0.4s';
    sidDisp.style.background = 'rgba(74,222,128,0.15)';
    setTimeout(() => { sidDisp.style.background = ''; }, 2000);
  }
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    const ta = document.getElementById('importSidInput');
    if (ta) {
      ta.value = text;
      ta.dispatchEvent(new Event('input'));
    }
  } catch (e) {
    showImportError('Could not access clipboard. Please paste manually (Ctrl+V / Cmd+V).');
  }
}

function parseImportedSession(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Try JSON — some pairing sites return session as JSON
  try {
    const obj = JSON.parse(trimmed);
    if (obj && typeof obj === 'object') {
      const key = Object.keys(obj).find(k => /session|id|creds|key/i.test(k));
      if (key && typeof obj[key] === 'string') return obj[key];
      return trimmed;
    }
  } catch (_) {}

  // Base64-encoded string (longer than 20 chars, alphanumeric + /+=)
  if (/^[A-Za-z0-9+/=]{20,}$/.test(trimmed)) return trimmed;

  // NXB-XXXX-XXXX-XXXX-XXXX format
  if (/^NXB-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(trimmed)) return trimmed;

  // Any string longer than 8 chars — accept as-is
  if (trimmed.length >= 8) return trimmed;

  return null;
}

function truncateForDisplay(str, maxLen = 48) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, 20) + '...' + str.slice(-12);
}

const importInput = document.getElementById('importSidInput');
if (importInput) {
  importInput.addEventListener('input', () => {
    const raw = importInput.value;
    const previewEl = document.getElementById('importPreview');
    const previewVal = document.getElementById('importPreviewVal');
    const errEl = document.getElementById('importError');
    const successEl = document.getElementById('importSuccess');

    if (errEl) errEl.style.display = 'none';
    if (successEl) successEl.style.display = 'none';

    if (!raw.trim()) {
      if (previewEl) previewEl.style.display = 'none';
      return;
    }

    const parsed = parseImportedSession(raw);
    if (parsed && previewEl && previewVal) {
      previewEl.style.display = 'block';
      previewVal.textContent = truncateForDisplay(parsed);
    } else if (previewEl) {
      previewEl.style.display = 'none';
    }
  });
}

function showImportError(msg) {
  const el = document.getElementById('importError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearImport() {
  const ta = document.getElementById('importSidInput');
  if (ta) ta.value = '';
  const previewEl = document.getElementById('importPreview');
  if (previewEl) previewEl.style.display = 'none';
  const errEl = document.getElementById('importError');
  if (errEl) errEl.style.display = 'none';
  const successEl = document.getElementById('importSuccess');
  if (successEl) successEl.style.display = 'none';
}

function applyImportedSession() {
  const raw = (document.getElementById('importSidInput') || {}).value || '';
  const errEl = document.getElementById('importError');
  const successEl = document.getElementById('importSuccess');

  if (errEl) errEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';

  if (!raw.trim()) {
    showImportError('Please paste a session ID first.');
    return;
  }

  const parsed = parseImportedSession(raw);
  if (!parsed) {
    showImportError('Could not detect a valid session ID. Make sure you copied the full session string from the pairing site.');
    return;
  }

  // Store the full imported session string as the active session
  importedSession = parsed;

  // If it looks like a NXB-format ID, strip prefix and use as currentSid display
  if (/^NXB-/i.test(parsed)) {
    currentSid = parsed.replace(/^NXB-/i, '');
    renderSid();
  } else {
    // For long base64/JSON sessions, show a shortened display hash
    currentSid = shortHash(parsed);
    renderSid();
  }

  if (successEl) successEl.style.display = 'flex';
}

let importedSession = '';

function shortHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (Math.imul(31, h) + str.charCodeAt(i)) | 0; }
  const hex = Math.abs(h).toString(16).toUpperCase().padStart(8, '0');
  return hex.slice(0,4) + '-' + hex.slice(4,8) + '-' + shortAlpha(str);
}
function shortAlpha(str) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += chars[(str.charCodeAt(i % str.length) + i * 7) % chars.length];
  return out.slice(0,4) + '-' + out.slice(4);
}

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
  if (e.key !== 'Escape') return;
  const mpModal = document.getElementById('mpesaModal');
  if (mpModal && mpModal.classList.contains('open')) { closeMpesaModal(); return; }
  const dModal = document.getElementById('deployModal');
  if (dModal && dModal.classList.contains('open')) { closeDeployModal(); }
});
