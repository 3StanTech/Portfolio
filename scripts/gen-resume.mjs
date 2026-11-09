// Prints resume/resume.html to a one-page US Letter PDF with headless Chrome.
//
// Usage: npm run resume
// Writes Tristan_Dolfo_Resume.pdf at the repo root and copies the same bytes to
// public/Tristan_Dolfo_Resume.pdf (the file the site links to).
//
// Runs locally by hand when the résumé changes; it is not part of the site build.
// Set CHROME to use a different Chrome or Chromium binary.
// Fails if a font family is missing, if the page requests anything outside file:,
// or if the PDF is not exactly one page.

import { spawn } from 'node:child_process';
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = pathToFileURL(join(root, 'resume', 'resume.html')).href;
const out = join(root, 'Tristan_Dolfo_Resume.pdf');
const publicCopy = join(root, 'public', 'Tristan_Dolfo_Resume.pdf');
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9300 + Math.floor(Math.random() * 500);
const families = [
  ['Geist', '400 10px "Geist"'],
  ['Geist Mono', '400 10px "Geist Mono"'],
  ['DM Serif Display', 'italic 400 10px "DM Serif Display"'],
];

const profile = mkdtempSync(join(tmpdir(), 'resume-chrome-'));
const browser = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const spawnFailed = new Promise((_, reject) => {
  browser.once('error', (err) => reject(new Error(`Chrome not found at ${chrome}; set CHROME (${err.code || err.message})`)));
});
spawnFailed.catch(() => {});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageSocketUrl() {
  for (let i = 0; i < 100; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* browser not up yet */
    }
    await sleep(100);
  }
  throw new Error('Chrome did not expose a DevTools page');
}

async function run() {
  const ws = new WebSocket(await Promise.race([pageSocketUrl(), spawnFailed]));
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = () => rej(new Error('DevTools socket failed'));
  });

  let id = 0;
  const pending = new Map();
  const requests = [];
  let onLoad;
  const loaded = new Promise((r) => (onLoad = r));
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    } else if (msg.method === 'Network.requestWillBeSent') {
      requests.push(msg.params.request.url);
    } else if (msg.method === 'Page.loadEventFired') {
      onLoad();
    }
  };
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const n = ++id;
      pending.set(n, { res, rej });
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  await send('Page.enable');
  await send('Network.enable');
  await send('Page.navigate', { url: source });
  await loaded;
  await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true });

  for (const [name, spec] of families) {
    const { result } = await send('Runtime.evaluate', {
      expression: `document.fonts.check(${JSON.stringify(spec)}) && [...document.fonts].some(f => f.family.replace(/["']/g, '') === ${JSON.stringify(name)} && f.status === 'loaded')`,
      returnByValue: true,
    });
    if (result.value !== true) throw new Error(`Font not loaded: ${name}`);
  }

  const remote = requests.filter((u) => !u.startsWith('file:') && u !== 'about:blank');
  if (remote.length) throw new Error(`Non-file request made: ${remote.join(', ')}`);

  const { data } = await send('Page.printToPDF', {
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: false,
  });
  const pdf = Buffer.from(data, 'base64');

  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
  console.log(`Pages: ${pages}`);
  if (pages !== 1) throw new Error(`Expected 1 page, got ${pages}`);

  writeFileSync(out, pdf);
  copyFileSync(out, publicCopy);
  console.log(`Wrote ${out} (${pdf.length} bytes) and copied to ${publicCopy}`);
  ws.close();
}

try {
  await run();
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  browser.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
