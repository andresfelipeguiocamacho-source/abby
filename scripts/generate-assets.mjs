/**
 * Genera el ícono, el ícono adaptativo de Android, el splash y el favicon
 * a partir del logo vectorial (scripts/brand-svg.mjs).
 *
 * Uso: npm run assets:generate   (requiere Playwright con Chromium instalado)
 */
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { gradientDef, markPaths } from './brand-svg.mjs';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (f) => path.join(root, 'assets', f);

const mark = (fill) => `<g ${fill ? `fill="none"` : ''}>${markPaths.replaceAll('url(#__G__)', fill ?? 'url(#__G__)').replaceAll('__G__', 'g')}</g>`;

/** Lienzo cuadrado con el logo centrado ocupando `scale` del ancho. */
function svg({ size, bg, scale, fill }) {
  const w = 200 * scale;
  const x = (1 - scale) / 2 * 200;
  const y = (200 - 170 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
    <defs>${gradientDef('g')}
      <radialGradient id="glow" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stop-color="#5B3FD6" stop-opacity="0.55"/><stop offset="1" stop-color="#05070D" stop-opacity="0"/></radialGradient>
    </defs>
    ${bg ? `<rect width="200" height="200" fill="${bg}"/><rect width="200" height="200" fill="url(#glow)"/>` : ''}
    <g transform="translate(${x},${y}) scale(${scale})">${mark(fill)}</g>
  </svg>`;
}

const jobs = [
  ['icon.png', svg({ size: 1024, bg: '#05070D', scale: 0.62 })],
  ['android-icon-foreground.png', svg({ size: 1024, scale: 0.5 })],
  ['android-icon-background.png', `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 200 200"><defs><radialGradient id="glow" cx="0.5" cy="0.42" r="0.6"><stop offset="0" stop-color="#5B3FD6" stop-opacity="0.55"/><stop offset="1" stop-color="#05070D" stop-opacity="0"/></radialGradient></defs><rect width="200" height="200" fill="#05070D"/><rect width="200" height="200" fill="url(#glow)"/></svg>`],
  ['android-icon-monochrome.png', svg({ size: 1024, scale: 0.5, fill: '#FFFFFF' })],
  ['splash-icon.png', svg({ size: 1024, scale: 0.9 })],
  ['favicon.png', svg({ size: 96, bg: '#05070D', scale: 0.78 })],
];

const browser = await playwright.chromium.launch();
const page = await browser.newPage();
for (const [file, markup] of jobs) {
  const size = Number(/width="(\d+)"/.exec(markup)[1]);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${markup}</body></html>`);
  await page.locator('svg').screenshot({ path: out(file), omitBackground: true });
  console.log('✓', file, `${size}px`);
}
await browser.close();
