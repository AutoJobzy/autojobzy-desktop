/**
 * Naukri Recommended Jobs — Auto Apply Bot
 * - Credentials & profile settings come via config (from DB) — no hardcoding
 * - Answer engine: uses server/aiAnswer.js (getAnswer, setUserAnswersData, setSkillsData)
 * - Click logic: finds article by data-job-id → clicks title element (user's proven approach)
 */

import puppeteer from 'puppeteer';
import { ensureChromeAvailable } from '../../server/utils/puppeteerHelper.js';
import { getAnswer, setUserAnswersData, setSkillsData } from '../../server/aiAnswer.js';

// ─── STOP FLAG ────────────────────────────────────────────────────────────────
let shouldStop = false;

export async function stopApplyJobsBot() {
  shouldStop = true;
  return { success: true, message: 'Stop signal sent' };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Cancellable sleep — resolves immediately when shouldStop is set (checks every 250ms)
async function cSleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (shouldStop) return;
    await sleep(Math.min(250, end - Date.now()));
  }
}

function randomDelay(min = 8000, max = 20000) {
  return cSleep(Math.floor(Math.random() * (max - min + 1)) + min);
}

// Normalize question for getAnswer — append '?' so aiAnswer.js validation passes
function normalizeQ(q) {
  const t = (q || '').trim();
  return t.endsWith('?') ? t : t + '?';
}

// ─── STEP 1: LOGIN ────────────────────────────────────────────────────────────
async function login(page, email, password, onLog) {
  onLog({ message: '🔐 Naukri.com var login karayla jaat aaho...', type: 'info' });
  await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'networkidle2', timeout: 60000 });

  await page.waitForSelector('#usernameField', { timeout: 15000 });
  await page.click('#usernameField');
  await page.type('#usernameField', email, { delay: 70 });
  await page.click('#passwordField');
  await page.type('#passwordField', password, { delay: 70 });

  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button[type="submit"]');
    for (const btn of buttons) {
      if (btn.innerText.trim() === 'Login') { btn.click(); return; }
    }
    if (buttons.length) buttons[0].click();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
  await sleep(2000);

  const url = page.url();
  if (url.includes('nlogin') || url.includes('/login')) {
    const errEl = await page.$('.erMsg, .nI-gNb-err');
    if (errEl) {
      const txt = await page.evaluate(e => e.innerText, errEl);
      throw new Error('Login failed: ' + txt);
    }
    onLog({ message: '⚠️  OTP / CAPTCHA ala — 30 seconds madhe manually complete kara!', type: 'warning' });
    await sleep(30000);
  }

  onLog({ message: '✅ Login jhala!', type: 'success' });
}

// ─── STEP 2: AUTO SCROLL ──────────────────────────────────────────────────────
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= Math.min(document.body.scrollHeight, 10000)) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });
  await sleep(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);
}

// ─── STEP 3: COLLECT JOBS ─────────────────────────────────────────────────────
async function collectJobs(page, onLog) {
  const RECOMMENDED_URL = 'https://www.naukri.com/mnjuser/recommendedjobs';

  onLog({ message: '📋 Recommended Jobs page var jaat aaho...', type: 'info' });
  await page.goto(RECOMMENDED_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);

  onLog({ message: '⏬ Scroll kartoy — saare jobs load hoayla...', type: 'info' });
  await autoScroll(page);

  // Debug: what selectors match?
  const debugInfo = await page.evaluate(() => ({
    articles: document.querySelectorAll('article').length,
    jobTuples: document.querySelectorAll('article.jobTuple').length,
    dataJobId: document.querySelectorAll('[data-job-id]').length,
    firstArticleClass: document.querySelector('article')?.className || '',
  }));
  onLog({ message: `🔍 Page scan: ${debugInfo.articles} articles, ${debugInfo.jobTuples} jobTuples, ${debugInfo.dataJobId} [data-job-id] — class: "${debugInfo.firstArticleClass.substring(0, 60)}"`, type: 'info' });

  // Debug: first card anchors
  const firstCardLinks = await page.evaluate(() => {
    const card = document.querySelector('article.jobTuple, [data-job-id], article');
    if (!card) return 'no card found';
    return Array.from(card.querySelectorAll('a')).slice(0, 5).map(a =>
      `"${(a.innerText || a.title || '').trim().substring(0, 25)}" cls="${a.className.substring(0, 30)}" href="${a.href.substring(0, 80)}"`
    ).join(' || ');
  });
  onLog({ message: `🔗 First card anchors: ${firstCardLinks}`, type: 'info' });

  const jobs = await page.evaluate(() => {
    let tuples = [];
    const selectors = [
      'article.jobTuple', '[data-job-id]', '.jobTupleWrapper',
      '.job-tuple', '[class*="jobTuple"]', '[class*="job-card"]', '[class*="jobCard"]', 'article',
    ];
    for (const sel of selectors) {
      const found = document.querySelectorAll(sel);
      if (found.length > 0) { tuples = Array.from(found); break; }
    }

    const result = [];
    tuples.forEach(t => {
      const jobId =
        t.dataset.jobId ||
        t.getAttribute('data-job-id') ||
        t.dataset.id ||
        t.getAttribute('data-id') ||
        '';

      if (!jobId) return;

      let jobUrl = '';
      let titleText = '';
      const anchors = Array.from(t.querySelectorAll('a'));

      // Priority 1: anchor that IS the title (Naukri: <a class="title ellipsis">)
      const titleAnchor = t.querySelector('a[class*="title"], a.title, h2 a, h3 a, p.title a, [class*="title"] a, a[title]');
      if (titleAnchor && titleAnchor.href && !titleAnchor.href.startsWith('javascript') && !titleAnchor.href.includes('ambitionbox')) {
        jobUrl = titleAnchor.href;
        titleText = (titleAnchor.innerText || titleAnchor.getAttribute('title') || '').trim();
      }

      // Priority 2: job-listings in path
      if (!jobUrl) {
        for (const a of anchors) {
          if (a.href && !a.href.startsWith('javascript') && a.href.includes('job-listings') && !a.href.includes('ambitionbox')) {
            jobUrl = a.href; titleText = titleText || a.innerText.trim(); break;
          }
        }
      }

      // Priority 3: any naukri.com link (exclude noise)
      if (!jobUrl) {
        for (const a of anchors) {
          if (a.href && !a.href.startsWith('javascript') && a.href.includes('naukri.com') &&
              !a.href.includes('ambitionbox') && !a.href.includes('/login') &&
              !a.href.includes('/recruiter') && a.href.length > 35) {
            jobUrl = a.href; titleText = titleText || a.innerText.trim(); break;
          }
        }
      }

      // Priority 4: construct from data-job-id
      if (!jobUrl) jobUrl = `https://www.naukri.com/job-listings-${jobId}`;

      // Title fallback
      if (!titleText) {
        const titleEl = t.querySelector('a[class*="title"]') || t.querySelector('.title') ||
          t.querySelector('[class*="jobTitle"]') || t.querySelector('h2') || t.querySelector('h3');
        if (titleEl) titleText = (titleEl.innerText || titleEl.getAttribute('title') || '').trim();
      }

      const companyEl = t.querySelector('.subTitle') || t.querySelector('.comp-name') ||
        t.querySelector('[class*="companyName"]') || t.querySelector('[class*="company"]');

      const isWalkIn = !!(t.querySelector('.walk-in') || t.querySelector('[class*="walkIn"]') || t.querySelector('[class*="walk-in"]'));

      result.push({
        jobId,
        title: titleText || 'Unknown Job',
        company: companyEl ? companyEl.innerText.trim() : 'Unknown',
        jobUrl,
        isWalkIn,
      });
    });
    return result;
  });

  // Deduplicate, filter walk-ins
  const seen = new Set();
  const unique = jobs.filter(j => {
    if (!j.jobId || j.isWalkIn || seen.has(j.jobId)) return false;
    seen.add(j.jobId);
    return true;
  });

  onLog({ message: `📊 Total ${jobs.length} cards — ${unique.length} unique eligible jobs milya!`, type: 'info' });
  return unique;
}

// ─── STEP 4: HANDLE APPLY MODAL (uses aiAnswer.js getAnswer) ─────────────────
async function handleApplyModal(page, onLog) {
  await sleep(1000);

  const hasModal = await page.evaluate(() => !!document.querySelector(
    '.popup, .modal, .lightbox, [class*="overlay"], [class*="applyModal"], [class*="apply-modal"], [class*="modal-container"], [class*="modalContainer"]'
  ));
  if (!hasModal) return false;

  // Read all unfilled questions from the modal
  const questions = await page.evaluate(() => {
    const modal = document.querySelector(
      '.popup, .modal, .lightbox, [class*="overlay"], [class*="applyModal"], [class*="apply-modal"]'
    ) || document.body;

    return Array.from(modal.querySelectorAll(
      'input[type="text"], input[type="number"], textarea, select, input[type="tel"], input[type="email"]'
    )).map(inp => {
      let questionText = '';
      if (inp.id) {
        const label = document.querySelector(`label[for="${inp.id}"]`);
        if (label) questionText = label.innerText.trim();
      }
      if (!questionText) questionText = inp.getAttribute('placeholder') || '';
      if (!questionText) questionText = inp.getAttribute('name') || inp.getAttribute('id') || '';
      if (!questionText || questionText.length < 3) {
        const container = inp.closest('div.form-group, div.field, div.question, li, div');
        if (container) {
          const labels = container.querySelectorAll('label, span.label, p.label, .question-text');
          if (labels.length > 0) questionText = Array.from(labels).map(l => l.innerText.trim()).join(' ');
        }
      }
      return {
        questionText: questionText.trim(),
        hasValue: !!(inp.value && inp.value.trim()),
        name: inp.getAttribute('name') || inp.getAttribute('id') || '',
      };
    });
  });

  if (questions.length > 0) {
    onLog({ message: `   📝 ${questions.length} question(s) milya modal madhe — aiAnswer.js answer karanar!`, type: 'info' });
  }

  // Build answers map using aiAnswer.js getAnswer
  const answersMap = {};
  for (const q of questions) {
    if (q.hasValue) continue;
    const key = q.questionText || q.name;
    if (!key) continue;
    const answer = await getAnswer(normalizeQ(key));
    if (answer) answersMap[key] = answer;
  }

  // Fill fields and submit
  const filled = await page.evaluate((answersMap) => {
    const modal = document.querySelector(
      '.popup, .modal, .lightbox, [class*="overlay"], [class*="applyModal"], [class*="apply-modal"]'
    ) || document.body;

    let filledCount = 0;
    const inputs = Array.from(modal.querySelectorAll(
      'input[type="text"], input[type="number"], textarea, select, input[type="tel"], input[type="email"]'
    ));

    inputs.forEach(inp => {
      if (inp.value && inp.value.trim()) return;
      const placeholder = inp.getAttribute('placeholder') || '';
      const name = inp.getAttribute('name') || inp.getAttribute('id') || '';

      let answer = '';
      for (const [key, val] of Object.entries(answersMap)) {
        if (key && (
          placeholder.toLowerCase().includes(key.toLowerCase().substring(0, 10)) ||
          name.toLowerCase().includes(key.toLowerCase().substring(0, 10)) ||
          key.toLowerCase().includes(name.toLowerCase().substring(0, 6))
        )) { answer = val; break; }
      }
      if (!answer) return;

      if (inp.tagName === 'SELECT') {
        const opt = Array.from(inp.options).find(o =>
          o.text.toLowerCase().includes(answer.toString().toLowerCase()) ||
          o.value.toLowerCase().includes(answer.toString().toLowerCase())
        );
        if (opt) { inp.value = opt.value; inp.dispatchEvent(new Event('change', { bubbles: true })); filledCount++; }
      } else {
        inp.value = answer;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }
    });

    // Submit button
    const keywords = ['apply', 'submit', 'confirm', 'ok', 'next', 'continue', 'send'];
    for (const btn of Array.from(modal.querySelectorAll('button, input[type="submit"]'))) {
      const t = (btn.innerText || btn.value || btn.textContent || '').trim().toLowerCase();
      if (keywords.some(k => t.includes(k))) {
        btn.scrollIntoView(); btn.click();
        return { clicked: true, filledCount };
      }
    }
    return { clicked: false, filledCount };
  }, answersMap);

  if (filled.filledCount > 0) {
    onLog({ message: `   ✅ ${filled.filledCount} field(s) bhar dilet aiAnswer.js ne!`, type: 'success' });
  }

  await cSleep(800);
  await handleConfirmPopup(page);
  return filled.clicked;
}

// ─── STEP 4b: CHATBOT — CHECKBOX / RADIO ─────────────────────────────────────
async function handleCheckBoxInChatbot(page) {
  try {
    const sel = ".checkBoxContainer input[type='radio'], .checkBoxContainer input[type='checkbox']";
    const checkboxes = await page.$$(sel);
    if (!checkboxes || checkboxes.length === 0) return false;

    const checkboxData = await page.evaluate((sel) => {
      return Array.from(document.querySelectorAll(sel)).map((inp, index) => {
        let labelText = '';
        if (inp.id) { const label = document.querySelector(`label[for="${inp.id}"]`); if (label) labelText = label.innerText.trim(); }
        if (!labelText) {
          const parent = inp.closest('.checkBoxContainer') || inp.parentElement;
          if (parent) labelText = Array.from(parent.childNodes).filter(n => n.nodeType === 3 || (n.nodeType === 1 && n.tagName !== 'INPUT')).map(n => n.textContent).join(' ').trim();
        }
        if (!labelText && inp.nextSibling) labelText = inp.nextSibling.textContent?.trim() || '';
        return { index, label: labelText, value: inp.value || '', type: inp.type };
      });
    }, sel);

    const questionText = await page.evaluate(() => {
      const el = document.querySelector('.botItem .botMsg span');
      return el ? el.innerText.trim().toLowerCase() : '';
    });

    let selectedIndex = 0;
    const preferYes = !questionText.includes('not') && !questionText.includes('deny');
    const yesIdx = checkboxData.findIndex(c => c.label.toLowerCase().includes('yes'));
    if (preferYes && yesIdx !== -1) selectedIndex = yesIdx;

    await checkboxes[selectedIndex].click();
    await sleep(300);
    return true;
  } catch (_) { return false; }
}

async function handleRadioInChatbot(page) {
  try {
    const radios = await page.$$('.ssrc__radio');
    if (!radios || radios.length === 0) return false;

    const questionText = await page.evaluate(() => {
      const el = document.querySelector('.botItem .botMsg span');
      return el ? el.innerText.trim().toLowerCase() : '';
    });

    let selectedIndex = -1;
    if (selectedIndex === -1) selectedIndex = (await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('.ssrc__radio'));
      return inputs.findIndex(i => {
        const label = document.querySelector(`label[for="${i.id}"]`);
        return label && label.innerText.trim().toLowerCase().includes('yes');
      });
    }));
    if (selectedIndex === -1) selectedIndex = 0;

    await radios[selectedIndex].click();
    await sleep(300);
    return true;
  } catch (_) { return false; }
}

// ─── STEP 4c: CHATBOT TEXT QUESTIONS (uses aiAnswer.js) ──────────────────────
async function handleChatbot(page, onLog) {
  try {
    await page.waitForSelector('.chatbot_MessageContainer', { timeout: 5000 }).catch(() => null);
    const hasChatbot = await page.evaluate(() => !!document.querySelector('.chatbot_MessageContainer'));
    if (!hasChatbot) return;

    onLog({ message: '   💬 Chatbot detected — aiAnswer.js answering questions!', type: 'info' });
    await page.bringToFront().catch(() => {});
    await sleep(500);

    const answered = new Set();
    const maxPolls = 20;

    for (let poll = 0; poll < maxPolls; poll++) {
      const questions = await page.$$eval(
        '.botItem .botMsg span',
        spans => spans.map(s => s.innerText.trim()).filter(Boolean)
      );

      for (const q of questions) {
        if (answered.has(q)) continue;
        answered.add(q);
        onLog({ message: `   ❓ Chatbot Q: ${q}`, type: 'info' });

        // 1. Checkbox
        if (await handleCheckBoxInChatbot(page)) {
          onLog({ message: '   ✅ Checkbox answered', type: 'success' });
          const sendBtn = await page.$('.sendMsg');
          if (sendBtn) await sendBtn.click();
          await cSleep(800);
          continue;
        }

        // 2. Radio
        if (await handleRadioInChatbot(page)) {
          onLog({ message: '   ✅ Radio answered', type: 'success' });
          const sendBtn = await page.$('.sendMsg');
          if (sendBtn) await sendBtn.click();
          await cSleep(800);
          continue;
        }

        // 3. Text answer via aiAnswer.js
        const answer = await getAnswer(normalizeQ(q));
        onLog({ message: `   💡 aiAnswer: "${answer || '(empty)'}"`, type: answer ? 'success' : 'warning' });

        const inputSel = ".textArea[contenteditable='true']";
        const inputEl = await page.$(inputSel);
        if (!inputEl) {
          onLog({ message: '   ⚠️  Chat input not found, skipping', type: 'warning' });
          continue;
        }

        await page.focus(inputSel).catch(() => {});
        await page.evaluate((sel, val) => {
          const el = document.querySelector(sel);
          if (el) {
            el.innerText = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, inputSel, answer || '');

        const sendBtn = await page.$('.sendMsg');
        if (sendBtn) await sendBtn.click();
        await cSleep(1000);
      }

      await cSleep(800);
    }

    onLog({ message: '   ✅ Chatbot questions answered!', type: 'success' });
  } catch (err) {
    onLog({ message: `   ⚠️  Chatbot error: ${err.message}`, type: 'warning' });
  }
}

// ─── STEP 4d: CONFIRM / SECONDARY POPUP ──────────────────────────────────────
async function handleConfirmPopup(page) {
  const confirmSelectors = [
    'button#confirmApply', 'button.submit-btn', '[data-action="apply"]',
    '.popup-apply-btn', '.modal-footer button.btn-primary',
    'button[class*="confirm"]', 'button[class*="submit"]',
  ];
  for (const sel of confirmSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn) {
        const txt = await page.evaluate(e => (e.innerText || e.textContent || '').trim().toLowerCase(), btn);
        if (['apply', 'submit', 'confirm', 'ok', 'next'].some(k => txt.includes(k))) {
          await btn.click(); await sleep(1500); return;
        }
      }
    } catch (_) {}
  }
  await page.evaluate(() => {
    for (const modal of document.querySelectorAll('.modal, .popup, .lightbox, [class*="overlay"], [class*="modal"]')) {
      for (const btn of Array.from(modal.querySelectorAll('button'))) {
        const t = (btn.innerText || btn.textContent || '').trim().toLowerCase();
        if (['apply', 'submit', 'confirm', 'ok', 'next', 'continue'].some(k => t.includes(k))) {
          btn.click(); return;
        }
      }
    }
  }).catch(() => {});
}

// ─── STEP 5: APPLY ON JOB PAGE ────────────────────────────────────────────────
async function applyOnPage(page, onLog) {
  await randomDelay(1000, 2000);
  await page.evaluate(() => window.scrollBy(0, 300)).catch(() => {});
  await sleep(500);

  // Already applied?
  const alreadyApplied = await page.evaluate(() => {
    for (const btn of document.querySelectorAll('button, .btn, a')) {
      const t = (btn.innerText || btn.textContent || '').toLowerCase().trim();
      if (t === 'applied' || t === 'already applied') return true;
    }
    return false;
  });
  if (alreadyApplied) return 'already applied';

  // Find apply button
  const applySelectors = [
    '#apply-button', 'button#apply-button', 'a#apply-button',
    'button.apply-button', '[class*="applyBtn"]', '[class*="apply-btn"]',
    'button[class*="apply"]', 'a[class*="apply"]', 'div.apply-btn button',
    '.jobDetail button', '[data-ga-track*="Apply"]',
    '.apply-now', '[class*="applyNow"]', '[class*="apply-now"]', 'button[class*="Apply"]',
  ];

  let applyBtn = null;
  for (const sel of applySelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        const txt = await page.evaluate(e => (e.innerText || e.textContent || '').trim().toLowerCase(), el);
        if (!txt.includes('already') && !txt.includes('applied') && !txt.includes('external')) {
          applyBtn = el; break;
        }
      }
    } catch (_) {}
  }

  // Text-based fallback
  if (!applyBtn) {
    applyBtn = await page.evaluateHandle(() => {
      for (const el of document.querySelectorAll('button, a, [role="button"]')) {
        const t = (el.innerText || el.textContent || '').trim().toLowerCase();
        if (t === 'apply' || t === 'apply now') return el;
      }
      return null;
    });
    if (!(await applyBtn.asElement())) applyBtn = null;
  }

  if (!applyBtn) {
    const btnList = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button, a[class*="apply"]'))
        .filter(b => (b.innerText || b.textContent || '').toLowerCase().includes('apply'))
        .slice(0, 5)
        .map(b => ({ tag: b.tagName, text: (b.innerText || '').trim().substring(0, 40), cls: b.className.substring(0, 50) }))
    );
    if (btnList.length) {
      onLog({ message: `   🔍 Apply-related elements: ${btnList.map(b => `"${b.text}"[${b.cls}]`).join(' | ')}`, type: 'info' });
    }
    return 'apply button milala nahi';
  }

  const btnEl = applyBtn.asElement ? applyBtn.asElement() : applyBtn;
  const btnText = await page.evaluate(e => (e.innerText || e.textContent || '').trim().toLowerCase(), btnEl).catch(() => '');
  if (btnText.includes('external') || btnText.includes('company website') || btnText.includes('company site')) {
    return 'external apply (skip)';
  }

  // Listen for new tab BEFORE clicking Apply
  const browser = page.browser();
  const applyTabPromise = new Promise(resolve => {
    browser.once('targetcreated', async target => {
      if (target.type() !== 'page') return;
      const p = await target.page().catch(() => null);
      if (!p) return;
      try {
        await p.waitForFunction(
          () => document.readyState !== 'loading' && location.href !== 'about:blank',
          { timeout: 10000 }
        );
      } catch (_) {}
      resolve(p);
    });
  });

  await btnEl.click();
  onLog({ message: '   🖱️  Apply button clicked', type: 'info' });

  const applyTab = await Promise.race([applyTabPromise, sleep(5000).then(() => null)]);

  if (applyTab) {
    onLog({ message: '   🆕 Application opened in new tab — handling there', type: 'info' });
    applyTab.on('dialog', async d => { await d.accept().catch(() => {}); });
    await sleep(2000);
    await handleApplyModal(applyTab, onLog);
    await handleChatbot(applyTab, onLog);
    await applyTab.close().catch(() => {});
  } else {
    onLog({ message: '   📄 Application on same page — handling modal/chatbot', type: 'info' });
    await randomDelay(1000, 2000);
    await handleApplyModal(page, onLog);
    await handleChatbot(page, onLog);
  }

  return 'applied';
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export async function runApplyJobsBot(config, onLog = () => {}) {
  shouldStop = false;

  const { naukriEmail, naukriPassword } = config;
  if (!naukriEmail || !naukriPassword) {
    throw new Error('Naukri credentials not found. Please add them in Job Profile settings.');
  }

  // ── Initialize aiAnswer.js with DB profile + skills ──
  setUserAnswersData({
    name:              config.name || '',
    currentCTC:        config.currentCTC || config.currentSalary || '',
    expectedCTC:       config.expectedCTC || config.expectedSalary || '',
    noticePeriod:      config.noticePeriod || '',
    location:          config.location || '',
    yearsOfExperience: config.yearsOfExperience || config.experience || '',
    naukriEmail:       naukriEmail,
    dob:               config.dob || null,
    availability:      config.availability || '',
    mobile:            config.mobile || '',
  });
  setSkillsData(config.skills || []);

  const maxJobs = config.maxJobsToApply || 15;
  const RECOMMENDED_URL = 'https://www.naukri.com/mnjuser/recommendedjobs';
  const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  const addLog = (entry) => {
    const log = typeof entry === 'string' ? { message: entry, type: 'info' } : entry;
    onLog({ timestamp: new Date().toLocaleTimeString(), ...log });
  };

  async function launchAndLogin() {
    let execPath;
    try { execPath = (await ensureChromeAvailable()).executablePath; } catch (_) {}

    const b = await puppeteer.launch({
      headless: false,
      slowMo: 60,
      executablePath: execPath || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--window-size=1280,900'],
      defaultViewport: { width: 1280, height: 900 },
    });

    const lp = await b.newPage();
    await lp.setUserAgent(BROWSER_UA).catch(() => {});
    lp.on('dialog', async d => { addLog({ message: `💬 Popup: ${d.message().substring(0, 60)}`, type: 'info' }); await d.accept().catch(() => {}); });
    await login(lp, naukriEmail, naukriPassword, addLog);
    return { browser: b, loginPage: lp };
  }

  let browser = null;
  let loginPage = null;
  try {
    addLog({ message: '🌐 Browser kholat aaho...', type: 'info' });
    ({ browser, loginPage } = await launchAndLogin());

    if (shouldStop) {
      addLog({ message: '🛑 User ne rok dila!', type: 'warning' });
      return { success: false, error: 'Stopped by user' };
    }

    const jobs = await collectJobs(loginPage, addLog);
    if (jobs.length === 0) {
      addLog({ message: '⚠️  Koi eligible recommended jobs nahi milya!', type: 'warning' });
      return { success: true, applied: 0, skipped: 0, failed: 0 };
    }

    await loginPage.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);

    const toApply = jobs.slice(0, maxJobs);
    addLog({ message: `🚀 ${toApply.length} jobs la apply karayla suru! aiAnswer.js ready hai!`, type: 'info' });
    if ((config.skills || []).length > 0) {
      addLog({ message: `🧠 ${config.skills.length} skills loaded — aiAnswer.js ne set kele!`, type: 'info' });
    }

    let applied = 0, skipped = 0, failed = 0, processedCount = 0;
    const RESTART_EVERY = 20;

    for (let i = 0; i < toApply.length; i++) {
      if (shouldStop) { addLog({ message: '🛑 Stopped!', type: 'warning' }); break; }

      // Browser restart every 20 jobs to prevent memory leak
      if (processedCount > 0 && processedCount % RESTART_EVERY === 0) {
        addLog({ message: `♻️  ${processedCount} jobs done — browser restart...`, type: 'info' });
        await browser.close().catch(() => {});
        ({ browser, loginPage } = await launchAndLogin());
        await loginPage.goto(RECOMMENDED_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        await sleep(2000);
        await loginPage.evaluate(() => window.scrollTo(0, 0));
        await sleep(500);
        addLog({ message: '✅ Browser restarted!', type: 'success' });
      }

      const job = toApply[i];
      addLog({ message: `[${i + 1}/${toApply.length}] "${job.title}" @ ${job.company}`, type: 'info' });

      let jobPage = null;
      try {
        // ── Click: find article by data-job-id → click the title element ──
        // (user's proven approach — avoids clicking wrong element)
        const newTabPromise = new Promise(resolve => {
          browser.once('targetcreated', async target => {
            if (target.type() !== 'page') return;
            const p = await target.page().catch(() => null);
            if (!p) return;
            try {
              await p.waitForFunction(
                () => document.readyState !== 'loading' && location.href !== 'about:blank',
                { timeout: 15000 }
              );
            } catch (_) {}
            resolve(p);
          });
        });

        // Navigate to recommended page if not already there
        const currentUrl = loginPage.url();
        if (!currentUrl.includes('recommendedjobs')) {
          await loginPage.goto(RECOMMENDED_URL, { waitUntil: 'networkidle2', timeout: 30000 });
          await sleep(2000);
          await autoScroll(loginPage);
          await loginPage.evaluate(() => window.scrollTo(0, 0));
          await sleep(500);
        }

        // Scroll the job card into view, then click its title
        const clicked = await loginPage.evaluate((jobId) => {
          const article = document.querySelector(`article[data-job-id="${jobId}"]`);
          if (!article) return false;

          // Scroll into view
          article.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Click the title element specifically (not just any part of the card)
          const titleEl =
            article.querySelector('a[class*="title"]') ||
            article.querySelector('a.title') ||
            article.querySelector('p.title') ||
            article.querySelector('.title') ||
            article.querySelector('h2 a') ||
            article.querySelector('h3 a') ||
            article.querySelector('[class*="title"] a') ||
            article.querySelector('a[title]');

          if (titleEl) { titleEl.click(); return true; }

          // Fallback: click the article itself
          article.click();
          return true;
        }, job.jobId);

        await sleep(800);

        if (clicked) {
          // Wait for new tab (max 15s)
          jobPage = await Promise.race([newTabPromise, sleep(15000).then(() => null)]);
        }

        // Fallback: navigate directly if click didn't open a tab
        if (!jobPage) {
          addLog({ message: `   ⚠️ Click nahi jhali / new tab nahi ala — directly navigate kartoy`, type: 'warning' });
          jobPage = await browser.newPage();
          await jobPage.setUserAgent(BROWSER_UA).catch(() => {});
          await jobPage.goto(job.jobUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } else {
          jobPage.on('dialog', async d => { await d.accept().catch(() => {}); });
        }

        await randomDelay(2000, 4000);

        const result = await applyOnPage(jobPage, addLog);
        await jobPage.close().catch(() => {});
        jobPage = null;
        await loginPage.bringToFront().catch(() => {});
        await sleep(300);

        if (result === 'applied') {
          applied++;
          addLog({ message: `   ✅ Apply jhala!`, type: 'success' });
        } else if (result === 'already applied') {
          skipped++;
          addLog({ message: `   ⏭️  Already applied — skip!`, type: 'info' });
        } else if (typeof result === 'string' && result.includes('external')) {
          skipped++;
          addLog({ message: `   🔗 External site — skip!`, type: 'info' });
        } else {
          skipped++;
          addLog({ message: `   ⚠️  ${result}`, type: 'warning' });
        }
      } catch (err) {
        failed++;
        addLog({ message: `   ❌ Error: ${err.message}`, type: 'error' });
        if (jobPage) { await jobPage.close().catch(() => {}); jobPage = null; }
        await loginPage.bringToFront().catch(() => {});
      }

      processedCount++;
      await randomDelay(3000, 5000);
    }

    addLog({ message: '━━━━━ SESSION COMPLETE ━━━━━', type: 'info' });
    addLog({ message: `✅ Applied  : ${applied}`, type: 'success' });
    addLog({ message: `⏭️  Skipped  : ${skipped}`, type: 'info' });
    addLog({ message: `❌ Failed   : ${failed}`, type: failed > 0 ? 'error' : 'info' });

    return { success: true, applied, skipped, failed };

  } catch (error) {
    addLog({ message: `❌ Fatal error: ${error.message}`, type: 'error' });
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      addLog({ message: '🔒 Browser band kartoy...', type: 'info' });
      await sleep(2000);
      await browser.close().catch(() => {});
    }
  }
}
