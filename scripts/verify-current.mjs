// Verifies that the "current" version, rendered from content.js, reproduces the
// original hand-written HTML for every swappable section.
// Usage: node scripts/verify-current.mjs [git-ref]   (default: the commit before the toggle work)
import { execSync } from 'node:child_process';
import { content } from '../src/content.js';
import { renderHeroLede, renderStatement, renderWork, renderRoles, renderToolkit } from '../src/render.js';

const ref = process.argv[2] || 'HEAD';
const original = execSync(`git show ${ref}:index.html`, { encoding: 'utf-8', maxBuffer: 1 << 26 });

const norm = (s) => s.replace(/<\/?(?:article|li|div|span|p|ul|h3|header|button)\b/g, (m) => m) // keep tags
  .replace(/\s+/g, ' ')
  .replace(/>\s+</g, '><')
  .replace(/\s+>/g, '>')
  .trim();

const grab = (re) => {
  const m = original.match(re);
  if (!m) throw new Error('not found in original: ' + re);
  return m[1];
};

const v = content.current;
const checks = [
  ['hero lede', grab(/<p class="hero-lede"[^>]*>([\s\S]*?)<\/p>/), renderHeroLede(v)],
  ['about statement', grab(/<p class="statement" id="statement">([\s\S]*?)<\/p>/), renderStatement(v)],
  ['work list', grab(/<ol class="work-list">([\s\S]*?)<\/ol>/), renderWork(v)],
  ['roles', grab(/<div class="roles">([\s\S]*?)\n        <\/div>\n      <\/div>\n    <\/section>/).replace(/<article class="role" data-reveal>/g, '<article class="role">'), renderRoles(v)],
  ['toolkit', grab(/<div class="skill-groups">([\s\S]*?)\n        <\/div>\n\n        <div class="certs">/), renderToolkit(v)],
];

let bad = 0;
for (const [name, a, b] of checks) {
  const same = norm(a) === norm(b);
  console.log(`${same ? 'OK  ' : 'FAIL'} ${name}`);
  if (!same) {
    bad++;
    const A = norm(a), B = norm(b);
    let i = 0; while (i < A.length && A[i] === B[i]) i++;
    console.log('  original:', A.slice(Math.max(0, i - 40), i + 80));
    console.log('  rendered:', B.slice(Math.max(0, i - 40), i + 80));
  }
}
process.exit(bad ? 1 : 0);
