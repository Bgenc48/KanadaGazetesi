#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const output = process.argv[2] || path.join(process.cwd(), 'source-link-audit.csv');
const articlesDir = path.join(process.cwd(), 'src', 'content', 'articles');
const urlArticles = new Map();

for (const file of fs.readdirSync(articlesDir).filter((name) => name.endsWith('.md'))) {
  const raw = fs.readFileSync(path.join(articlesDir, file), 'utf8');
  for (const match of raw.matchAll(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/giu)) {
    const url = match[1];
    if (!urlArticles.has(url)) urlArticles.set(url, new Set());
    urlArticles.get(url).add(file);
  }
}

async function inspect(url) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; KanadaGazetesiEditorialAudit/1.0)',
        accept: 'text/html,application/xhtml+xml,application/pdf,*/*;q=0.8',
        range: 'bytes=0-8191',
      },
    });
    await response.body?.cancel();
    return {
      url,
      status: response.status,
      finalUrl: response.url,
      result:
        response.ok || response.status === 206
          ? 'pass'
          : [401, 403, 405, 429].includes(response.status)
            ? 'protected'
            : 'fail',
      ms: Date.now() - started,
      error: '',
    };
  } catch (error) {
    return {
      url,
      status: 0,
      finalUrl: '',
      result: 'error',
      ms: Date.now() - started,
      error: error.message,
    };
  }
}

const urls = [...urlArticles.keys()].sort();
const results = [];
let cursor = 0;
async function worker() {
  while (cursor < urls.length) {
    const index = cursor++;
    results[index] = await inspect(urls[index]);
  }
}
await Promise.all(Array.from({ length: Math.min(16, urls.length) }, () => worker()));

const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const headers = ['result', 'status', 'url', 'final_url', 'articles', 'ms', 'error'];
const lines = results.map((row) =>
  [
    row.result,
    row.status,
    row.url,
    row.finalUrl,
    [...urlArticles.get(row.url)].sort().join(';'),
    row.ms,
    row.error,
  ]
    .map(csv)
    .join(','),
);
fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
fs.writeFileSync(output, `${headers.join(',')}\n${lines.join('\n')}\n`, 'utf8');

const summary = Object.groupBy(results, (row) => row.result);
console.log(
  JSON.stringify(
    {
      uniqueUrls: urls.length,
      pass: summary.pass?.length || 0,
      protected: summary.protected?.length || 0,
      fail: summary.fail?.length || 0,
      error: summary.error?.length || 0,
      output: path.resolve(output),
    },
    null,
    2,
  ),
);
for (const row of results.filter((item) => ['fail', 'error'].includes(item.result))) {
  console.log(`${row.result}\t${row.status}\t${row.url}\t${row.error}`);
}
