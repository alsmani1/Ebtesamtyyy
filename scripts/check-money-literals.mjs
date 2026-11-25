/**
 * Fails when a UI file hardcodes an EGP amount instead of deriving it from
 * src/lib/clinic-pricing.ts, clinic-costs.ts or clinic-finance.ts.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const ALLOWED_FILES = new Set([
  'src/lib/clinic-pricing.ts',
  'src/lib/clinic-costs.ts',
  'src/lib/clinic-finance.ts',
  'src/lib/complete-arabic.json',
  'src/lib/interface-messages.ts',
]);

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json']);

const PATTERNS = [
  { name: 'EGP followed by a literal amount', re: /EGP\s+[1-9][\d,]*/g },
  { name: 'literal amount followed by EGP', re: /[1-9][\d,]*\s*EGP\b/g },
  { name: 'literal amount followed by ج.م', re: /[1-9][\d,]*\s*ج\.م/g },
];

function walk(dir) {
  const output = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) output.push(...walk(full));
    else output.push(full);
  }
  return output;
}

function isComment(line) {
  const trimmed = line.trimStart();
  return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
}

const violations = [];
for (const file of walk(SRC)) {
  if (!EXTENSIONS.has(file.slice(file.lastIndexOf('.')))) continue;
  const rel = relative(ROOT, file).replaceAll('\\', '/');
  if (ALLOWED_FILES.has(rel)) continue;

  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (isComment(line)) return;
    for (const { name, re } of PATTERNS) {
      re.lastIndex = 0;
      const match = re.exec(line);
      if (match) {
        violations.push(`${rel}:${index + 1} — ${name} — "${match[0]}"`);
      }
    }
  });
}

if (violations.length > 0) {
  console.error('Hardcoded EGP literals found. Derive these amounts from the pricing/finance libraries:\n');
  for (const entry of violations) console.error(`  ${entry}`);
  console.error(`\n${violations.length} violation(s).`);
  process.exit(1);
}

console.log('No hardcoded EGP literals found.');
