/**
 * render.js — turns content.js data into the HTML for the swappable sections.
 * Pure string functions (no DOM) so they can be tested in Node.
 */
import { shared } from './content.js';

export const PLACEHOLDER_RE = /\[[^\]]+\]/g;

// On localhost, wrap [placeholders] so they get a dashed underline.
// Anywhere else the text is left untouched.
export function fmt(html, { highlight = false } = {}) {
  if (!highlight) return html;
  return html.replace(PLACEHOLDER_RE, (m) => `<span class="ph" title="Placeholder: fill in before deploying">${m}</span>`);
}

export function renderHeroLede(v, opts) {
  return fmt(v.heroLede, opts);
}

export function renderStatement(v, opts) {
  return fmt(v.aboutStatement, opts);
}

export function renderWork(v, opts) {
  const rows = shared.work
    .map((w, i) => `
          <li class="work-row" data-cursor="Open">
            <div class="work-line"></div>
            <button class="work-head" aria-expanded="false">
              <span class="work-no mono">${String(i + 1).padStart(2, '0')}</span>
              <span class="work-title">${w.title}</span>
              <span class="work-tag mono">${w.tag}</span>
              <span class="work-plus" aria-hidden="true">+</span>
            </button>
            <div class="work-body"><div>
              <p>${fmt(v.workDescriptions[i], opts)}</p>
              <div class="tags">${w.tags.map((t) => `<span>${t}</span>`).join('')}</div>
            </div></div>
          </li>`)
    .join('');
  return `${rows}
          <li class="work-end"><div class="work-line"></div></li>
        `;
}

export function renderRoles(v, opts) {
  return v.roles
    .map((r) => `
          <article class="role">
            <header>
              <span class="mono role-date">${r.date}</span>
              <h3>${r.title}</h3>
              <p class="role-co">${r.company}</p>
            </header>
            <div class="role-body">
              ${r.summary ? `<p class="role-sum">${fmt(r.summary, opts)}</p>` : ''}
              <ul>
                ${r.bullets.map((b) => `<li>${fmt(b, opts)}</li>`).join('\n                ')}
              </ul>
            </div>
          </article>`)
    .join('\n');
}

export function renderToolkit(v) {
  return v.toolkit
    .map((g) => `
          <div class="skill-group">
            <h3 class="mono">${g.label}</h3>
            <div class="chips">${g.chips.map((c) => `<span>${c}</span>`).join('')}</div>
          </div>`)
    .join('\n');
}

/** Walk the data and list every unfilled [placeholder] with where it lives. */
export function findPlaceholders(v, path = 'product') {
  const found = [];
  const walk = (node, p) => {
    if (typeof node === 'string') {
      (node.match(PLACEHOLDER_RE) || []).forEach((m) => found.push({ path: p, placeholder: m }));
    } else if (Array.isArray(node)) {
      node.forEach((n, i) => walk(n, `${p}[${i}]`));
    } else if (node && typeof node === 'object') {
      Object.entries(node).forEach(([k, n]) => walk(n, `${p}.${k}`));
    }
  };
  walk(v, path);
  return found;
}
