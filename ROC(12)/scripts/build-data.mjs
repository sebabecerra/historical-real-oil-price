import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "public/data");
const outFile = resolve(outDir, "wti-roc12.json");
const FRED_WTI_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILWTICO";
const YAHOO_WTI_URL = "https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=2mo&includePrePost=false";

const events = [
  { label: "1987 Crash", date: "1987-10-01" },
  { label: "1990 Crash", date: "1990-08-01" },
  { label: "DOT COM", date: "2000-03-01" },
  { label: "Financial Crisis", date: "2008-10-01" },
  { label: "2022 Bear Market\nInflation / War / Rates", date: "2022-06-01" },
  { label: "Rally\n2026", date: "2026-01-01", variant: "highlight" },
];

function parseCsv(text) {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const columns = header.split(",");
  return lines.map((line) => {
    const parts = line.split(",");
    const row = {};
    columns.forEach((column, index) => {
      row[column] = parts[index] ?? "";
    });
    return row;
  });
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "roc-12-oil-price/1.0",
      Accept: "text/csv,application/json;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  return response.text();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "roc-12-oil-price/1.0",
      Accept: "application/json,text/plain;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  return response.json();
}

function monthKey(date) {
  return date.slice(0, 7);
}

function toIsoDate(timestamp) {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function aggregateMonthly(rows) {
  const buckets = new Map();

  for (const row of rows) {
    const date = row.observation_date ?? row.DATE;
    const value = Number(row.DCOILWTICO);
    if (!date || !Number.isFinite(value) || value <= 0) continue;
    const key = monthKey(date);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ date, value });
  }

  return [...buckets.entries()]
    .map(([key, entries]) => {
      const sorted = entries.sort((a, b) => a.date.localeCompare(b.date));
      const values = sorted.map((entry) => entry.value);
      return {
        month: key,
        date: `${key}-01`,
        open: Number(values[0].toFixed(2)),
        high: Number(Math.max(...values).toFixed(2)),
        low: Number(Math.min(...values).toFixed(2)),
        close: Number(values.at(-1).toFixed(2)),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchCurrentMonthSnapshot() {
  const chart = await fetchJson(YAHOO_WTI_URL);
  const result = chart?.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const quotes = result?.indicators?.quote?.[0];

  if (!timestamps.length || !quotes) {
    throw new Error("Yahoo Finance returned no WTI snapshot data");
  }

  const rows = timestamps.map((timestamp, index) => {
    const open = Number(quotes.open?.[index]);
    const high = Number(quotes.high?.[index]);
    const low = Number(quotes.low?.[index]);
    const close = Number(quotes.close?.[index]);
    if (![open, high, low, close].every(Number.isFinite)) return null;
    return {
      date: toIsoDate(timestamp),
      open,
      high,
      low,
      close,
    };
  }).filter(Boolean);

  if (!rows.length) {
    throw new Error("Yahoo Finance returned no valid OHLC rows");
  }

  const lastRow = rows.at(-1);
  const latestMonth = monthKey(lastRow.date);
  const monthlyRows = rows.filter((row) => monthKey(row.date) === latestMonth);

  return {
    month: latestMonth,
    date: `${latestMonth}-01`,
    open: Number(monthlyRows[0].open.toFixed(2)),
    high: Number(Math.max(...monthlyRows.map((row) => row.high)).toFixed(2)),
    low: Number(Math.min(...monthlyRows.map((row) => row.low)).toFixed(2)),
    close: Number(monthlyRows.at(-1).close.toFixed(2)),
    snapshotDate: lastRow.date,
    snapshotSource: "Yahoo Finance CL=F",
  };
}

function mergeCurrentMonthSnapshot(monthly, snapshot) {
  const filtered = monthly.filter((entry) => entry.date !== snapshot.date);
  filtered.push(snapshot);
  return filtered.sort((a, b) => a.date.localeCompare(b.date));
}

function addRoc(monthly) {
  return monthly.map((entry, index) => {
    if (index < 12) {
      return { ...entry, roc12: null };
    }
    const prev = monthly[index - 12].close;
    const roc12 = ((entry.close / prev) - 1) * 100;
    return { ...entry, roc12: Number(roc12.toFixed(2)) };
  });
}

const rows = parseCsv(await fetchText(FRED_WTI_URL));
const currentMonthSnapshot = await fetchCurrentMonthSnapshot();
const monthly = addRoc(mergeCurrentMonthSnapshot(aggregateMonthly(rows), currentMonthSnapshot));
const latest = monthly.at(-1);

const payload = {
  generatedAt: new Date().toISOString(),
  title: "WTI Spot and ROC(12)",
  subtitle: "Monthly WTI spot candles with 12-month rate of change.",
  source: "FRED DCOILWTICO + Yahoo Finance CL=F current-month snapshot",
  currentMonthExtension: currentMonthSnapshot,
  latest,
  range: { start: monthly[0].date, end: latest.date },
  events,
  candles: monthly,
};

await mkdir(outDir, { recursive: true });
await writeFile(outFile, JSON.stringify(payload, null, 2));
console.log(`Wrote ${outFile}`);
