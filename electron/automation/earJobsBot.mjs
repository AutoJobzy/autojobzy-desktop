/**
 * EAR (Early Access Recommended) Jobs Bot
 * Shares interest in Naukri recommended jobs automatically.
 * Credentials are passed via config — no hardcoding.
 */

import puppeteer from 'puppeteer';
import { ensureChromeAvailable } from '../../server/utils/puppeteerHelper.js';

// ─── STOP FLAG ────────────────────────────────────────────────────────────────
let shouldStop = false;

export async function stopEarJobsBot() {
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

// ─── LOGIN ────────────────────────────────────────────────────────────────────
async function login(page, email, password, onLog) {
  onLog({ message: '🔐 Bhai, Naukri.com par apun login karne ja raha hai... tension nahi lene ka!', type: 'info' });

  await page.goto('https://www.naukri.com/nlogin/login', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

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
  await cSleep(2000);

  const url = page.url();
  if (url.includes('nlogin') || url.includes('/login')) {
    const errEl = await page.$('.erMsg, .nI-gNb-err');
    if (errEl) {
      const txt = await page.evaluate(e => e.innerText, errEl);
      throw new Error('Login failed: ' + txt);
    }
    onLog({ message: '⚠️  Aye bidu! OTP / CAPTCHA aa gaya scene — 30 second mein manually complete kar, apun wait karega!', type: 'warning' });
    await cSleep(30000);
  }

  onLog({ message: '✅ Login ekdum mast ho gaya bhai! Jaadoo ki jhappi!', type: 'success' });
}

// ─── AUTO SCROLL ──────────────────────────────────────────────────────────────
async function autoScroll(page) {
  let prevHeight = 0;
  let attempts = 0;
  while (attempts < 20) {
    if (shouldStop) return;
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === prevHeight) break;
    prevHeight = currentHeight;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await cSleep(1500);
    attempts++;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await cSleep(500);
}

// ─── SHARE ALL INTERESTS ──────────────────────────────────────────────────────
async function shareAllInterests(page, onLog) {
  const earJobsUrl = 'https://www.naukri.com/mnjuser/recommended-earjobs';

  onLog({ message: '📋 Bhai, Early Access Jobs wali secret page par aa raha hai Circuit...', type: 'info' });
  await page.goto(earJobsUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await cSleep(3000);

  onLog({ message: '⏬ Scroll maar raha hai bidu... saare jobs load hone de, jaldi nahi karne ka!', type: 'info' });
  await autoScroll(page);

  const totalCount = await page.evaluate(() => {
    const allBtns = document.querySelectorAll('button.unshared, button[class*="unshared"]');
    const alreadyDone = document.querySelectorAll('button.shared, button[class*="shared"]:not([class*="unshared"])');
    return { pending: allBtns.length, done: alreadyDone.length };
  });

  onLog({ message: `📊 Bhai, ${totalCount.pending} jobs ka interest baaki hai — Circuit karega kaam!`, type: 'info' });
  onLog({ message: `✅ Pehle se share kiye hue: ${totalCount.done} — solid bidu!`, type: 'info' });

  if (totalCount.pending === 0) {
    onLog({ message: '✅ Bidu, saglyanche interest already share jhale! Apun ka kaam ho gaya — bindaas!', type: 'success' });
    return { shared: 0, alreadyShared: totalCount.done, failed: 0 };
  }

  onLog({ message: `🚀 Chalo bhai, interest share karna shuru karata hai Circuit! (${totalCount.pending} baaki hai)`, type: 'info' });

  let sharedCount = 0;
  let failedCount = 0;
  let idx = 0;

  while (idx < totalCount.pending) {
    if (shouldStop) {
      onLog({ message: '🛑 Bhai ne thamba mhantla! Apun rukla — no problem bidu!', type: 'warning' });
      break;
    }

    await page.goto(earJobsUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await cSleep(2000);

    const jobInfo = await page.evaluate(() => {
      const btn = document.querySelector('button.unshared');
      if (!btn) return null;
      let el = btn;
      for (let i = 0; i < 10; i++) {
        if (!el.parentElement) break;
        el = el.parentElement;
        const titleEl = el.querySelector('.title, a.title');
        const compEl = el.querySelector('.comp-name');
        if (titleEl) {
          return {
            title: titleEl.innerText.trim() || titleEl.getAttribute('title') || 'Unknown',
            company: compEl ? compEl.innerText.trim() : 'Unknown',
          };
        }
      }
      return { title: 'Unknown Job', company: 'Unknown' };
    });

    if (!jobInfo) {
      onLog({ message: '✅ Bhai, sagle interests share ho gaye! Circuit ka kaam tamam — ek number!', type: 'success' });
      break;
    }

    idx++;
    onLog({
      message: `[${idx}/${totalCount.pending}] "${jobInfo.title}" @ ${jobInfo.company}`,
      type: 'info',
    });

    const [navResult] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null),
      page.evaluate(() => {
        const btn = document.querySelector('button.unshared');
        if (btn) { btn.scrollIntoView(); btn.click(); return true; }
        return false;
      }),
    ]);

    await cSleep(1000);
    const currentUrl = page.url();

    if (currentUrl.includes('saveApply') || currentUrl.includes('myapply')) {
      onLog({ message: `   ✅ Jaadoo ki jhappi bhai! Interest share ho gaya! (${jobInfo.title})`, type: 'success' });
      sharedCount++;
    } else if (currentUrl.includes('recommendedjobs') || currentUrl.includes('earjobs')) {
      onLog({ message: `   ℹ️  Bidu, yeh wala already share tha ya kuch change ho gaya: ${jobInfo.title}`, type: 'info' });
    } else {
      onLog({ message: `   ✅ Solid! Interest share ho gaya bhai! (${jobInfo.title})`, type: 'success' });
      sharedCount++;
    }

    await cSleep(1500);
  }

  return { shared: sharedCount, alreadyShared: totalCount.done, failed: failedCount };
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export async function runEarJobsBot(config, onLog = () => {}) {
  shouldStop = false;

  const { naukriEmail, naukriPassword } = config;
  if (!naukriEmail || !naukriPassword) {
    throw new Error('Naukri credentials not found. Please add them in Job Profile settings.');
  }

  const addLog = (entry) => {
    const log = typeof entry === 'string'
      ? { message: entry, type: 'info' }
      : entry;
    onLog({
      timestamp: new Date().toLocaleTimeString(),
      ...log,
    });
  };

  let browser = null;
  try {
    // Resolve Chrome executable
    let executablePath;
    try {
      const chromeStatus = await ensureChromeAvailable();
      executablePath = chromeStatus.executablePath;
    } catch (e) {
      // fallback to puppeteer default
    }

    addLog({ message: '🌐 Bhai, browser kholat aaho... Chrome wala scene shuru!', type: 'info' });

    browser = await puppeteer.launch({
      headless: false,
      slowMo: 60,
      executablePath: executablePath || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1280,900',
      ],
      defaultViewport: { width: 1280, height: 900 },
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    page.on('dialog', async dialog => {
      addLog({ message: `💬 Aye bidu, popup aa gaya: ${dialog.message().substring(0, 60)} — Circuit handle karega!`, type: 'info' });
      await dialog.accept();
    });

    await login(page, naukriEmail, naukriPassword, addLog);

    if (shouldStop) {
      addLog({ message: '🛑 Bhai ne rok diya sharing se pehle! Theek hai, apun ruk gaya — tension nahi!', type: 'warning' });
      return { success: false, error: 'Stopped by user' };
    }

    const result = await shareAllInterests(page, addLog);

    addLog({ message: '━━━━━━ CIRCUIT KI FINAL REPORT — BHAI KO! ━━━━━━', type: 'info' });
    addLog({ message: `✅ Interest Share Kiye  : ${result.shared} — ekdum solid!`, type: 'success' });
    addLog({ message: `ℹ️  Pehle Se Share      : ${result.alreadyShared} — sahi tha bidu!`, type: 'info' });
    addLog({ message: `❌ Fail Hue            : ${result.failed}`, type: result.failed > 0 ? 'error' : 'info' });

    return { success: true, ...result };

  } catch (error) {
    addLog({ message: `❌ Aye bhai, bada scene ho gaya: ${error.message} — don't worry, apun investigate karega!`, type: 'error' });
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      addLog({ message: '🔒 Kaam tamam bidu! Browser band karat aaho... jaadoo ki jhappi!', type: 'info' });
      await cSleep(2000);
      await browser.close().catch(() => {});
    }
  }
}
