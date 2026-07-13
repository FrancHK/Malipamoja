// Apply a .sql file to the Neon database, one statement at a time.
// Splits on ';' while respecting line comments and $$-dollar-quoted bodies.
// Usage: node db/apply.mjs db/schema.sql
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';

const url = readFileSync('.env.local', 'utf8').match(/DATABASE_URL="([^"]+)"/)[1];
const file = process.argv[2] ?? 'db/schema.sql';
const raw = readFileSync(file, 'utf8');

function splitSql(src) {
  const stmts = [];
  let cur = '', i = 0, dollar = null;
  while (i < src.length) {
    if (!dollar && src[i] === '-' && src[i + 1] === '-') {
      const nl = src.indexOf('\n', i);
      const end = nl === -1 ? src.length : nl;
      cur += src.slice(i, end); i = end; continue;
    }
    if (src[i] === '$') {
      const m = /^\$[A-Za-z0-9_]*\$/.exec(src.slice(i));
      if (m) {
        if (!dollar) dollar = m[0];
        else if (dollar === m[0]) dollar = null;
        cur += m[0]; i += m[0].length; continue;
      }
    }
    if (src[i] === ';' && !dollar) {
      const s = cur.trim(); if (s) stmts.push(s);
      cur = ''; i++; continue;
    }
    cur += src[i]; i++;
  }
  const last = cur.trim(); if (last) stmts.push(last);
  return stmts;
}

const sql = neon(url);
const statements = splitSql(raw);
console.log(`Applying ${statements.length} statements from ${file}...`);
for (const stmt of statements) {
  const label = stmt.replace(/\s+/g, ' ').slice(0, 60);
  try {
    await sql.query(stmt);
    console.log(`  ok   ${label}`);
  } catch (e) {
    console.error(`  FAIL ${label}\n       ${e.message}`);
    process.exit(1);
  }
}
console.log('Done.');
