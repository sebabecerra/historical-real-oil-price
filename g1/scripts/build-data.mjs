import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'public/data');
const outFile = resolve(outDir, 'oil-history.json');

const OWID_REAL_DATA_URL = 'https://ourworldindata.org/grapher/oil-prices-inflation-adjusted.csv';
const FRED_WTI_URL = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILWTICO';
const FRED_CPI_URL = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=CPIAUCSL';
const BARRELS_PER_CUBIC_METER = 6.28981;

const recessions = [
  ['1865-04-01', '1867-12-01'],
  ['1869-06-01', '1870-12-01'],
  ['1873-10-01', '1879-03-01'],
  ['1882-03-01', '1885-05-01'],
  ['1887-03-01', '1888-04-01'],
  ['1890-07-01', '1891-05-01'],
  ['1893-01-01', '1894-06-01'],
  ['1895-12-01', '1897-06-01'],
  ['1899-06-01', '1900-12-01'],
  ['1902-09-01', '1904-08-01'],
  ['1907-05-01', '1908-06-01'],
  ['1910-01-01', '1912-01-01'],
  ['1913-01-01', '1914-12-01'],
  ['1918-08-01', '1919-03-01'],
  ['1920-01-01', '1921-07-01'],
  ['1923-05-01', '1924-07-01'],
  ['1926-10-01', '1927-11-01'],
  ['1929-08-01', '1933-03-01'],
  ['1937-05-01', '1938-06-01'],
  ['1945-02-01', '1945-10-01'],
  ['1948-11-01', '1949-10-01'],
  ['1953-07-01', '1954-05-01'],
  ['1957-08-01', '1958-04-01'],
  ['1960-04-01', '1961-02-01'],
  ['1969-12-01', '1970-11-01'],
  ['1973-11-01', '1975-03-01'],
  ['1980-01-01', '1980-07-01'],
  ['1981-07-01', '1982-11-01'],
  ['1990-07-01', '1991-03-01'],
  ['2001-03-01', '2001-11-01'],
  ['2007-12-01', '2009-06-01'],
  ['2020-02-01', '2020-04-01'],
].map(([start, end]) => ({ start, end }));

const annotations = [
  { title: '1862-1865', anchorYear: 1863.5, body: 'US Civil War drives up\ncommodity prices', x: 58, y: 112, w: 178, h: 64, align: 'left' },
  { title: '1865-1890', anchorYear: 1877.5, body: 'Prices boom\nand bust with\nfluctuations in\nUS drilling', x: 108, y: 180, w: 138, h: 118, align: 'left' },
  { title: '1891-1894', anchorYear: 1892.5, body: 'Pennsylvania\noilfields begin to\ndecline, setting the\nstage for higher\nprices in 1895', x: 210, y: 416, w: 158, h: 118, align: 'left' },
  { title: '1894', anchorYear: 1894, body: 'Cholera epidemic\ncuts production in\nBaku, Azerbaijan,\ncontributing to 1895\nspike', x: 300, y: 322, w: 150, h: 116, align: 'left' },
  { title: '1920', anchorYear: 1920, body: 'Rapid adoption of the\nautomobile drastically\nraises oil consumption,\nleading to the "West\nCoast Gasoline\nFamine"', x: 485, y: 224, w: 162, h: 144, align: 'left' },
  { title: '1931', anchorYear: 1931, body: 'Prices hit record\nlow as onset of\nGreat Depression\nreduces demand', x: 555, y: 388, w: 120, h: 102, align: 'left' },
  { title: '1947', anchorYear: 1947, body: 'Post-war\nautomotive\nboom creates\nfuel shortages\nin some US\nstates', x: 666, y: 238, w: 108, h: 136, align: 'left' },
  { title: '1973-1974', anchorYear: 1973.5, body: 'Arab states\ninstitute\nembargo against\ncountries\nsupporting Israel\nin the Yom\nKippur War', x: 786, y: 296, w: 116, h: 166, align: 'left' },
  { title: '1978-1979', anchorYear: 1978.5, body: 'Iran cuts production and\nexports during revolution,\ncancels contracts with\nUS companies', x: 762, y: 176, w: 160, h: 96, align: 'left' },
  { title: '1980', anchorYear: 1980, body: 'Iran-Iraq War begins;\nexports from the\nregion slow further', x: 880, y: 94, w: 140, h: 88, align: 'left' },
  { title: '1980s', anchorYear: 1985, xOffset: 50, body: 'Demand\nresponse\nto supply\nshocks\npushes\nprices\ndown', x: 1067, y: 180, w: 76, h: 160, align: 'left' },
  { title: '1988', anchorYear: 1988, xOffset: 50, body: 'Iran, Iraq\nincrease\noutput with\nend of war', x: 1120, y: 350, w: 90, h: 108, align: 'left' },
  { title: '1990', anchorYear: 1990, body: 'Iraq invades\nKuwait; Kuwaiti\nexports cut\nuntil 1994', x: 920, y: 555, w: 128, h: 104, align: 'left', connectorSide: 'top' },
  { title: 'Mid-2000s', anchorYear: 2005, body: 'Asia drives\nrising\ndemand as\nproduction\nstagnates\nand spare\ncapacity\ndeclines', x: 1084, y: 184, w: 112, h: 182, align: 'left' },
  { title: '2011', anchorYear: 2011, body: 'Arab Spring;\nLibyan civil war\ndisrupts output', x: 1218, y: 118, w: 108, h: 82, align: 'left' },
  { title: '2014-2015', anchorYear: 2014.5, body: 'Global\noversupply\nleaves oil\nmarkets\nsearching for\nnew equilibrium', x: 1192, y: 530, w: 120, h: 142, align: 'left', connectorSide: 'top' },
  { title: 'March 2026', anchorYear: 2026, xOffset: 60, body: 'Oil flows\nthrough the\nStrait of\nHormuz are\ndisrupted amid\nthe US/Israel-\nIran war', x: 1298, y: 132, w: 88, h: 182, align: 'left', variant: 'highlight' },
];

const overlayBoxes = [
  { title: '1864 — Civil War', anchorYear: 1864, x: 64, y: 22, w: 186, h: 40 },
  { title: '1973 — Arab Oil Embargo', anchorYear: 1973, x: 748, y: 22, w: 148, h: 40 },
  { title: '1979 — Iranian Revolution', anchorYear: 1979, x: 912, y: 22, w: 172, h: 40 },
  { title: '1990 — Gulf War', anchorYear: 1990, x: 1100, y: 22, w: 146, h: 40 },
  { title: '2008 — Financial Crisis', anchorYear: 2008, x: 1262, y: 22, w: 154, h: 40 },
  { title: '2026 — We are here 🔴', anchorYear: 2026, x: 1418, y: 22, w: 148, h: 40 },
];

function parseCsv(text) {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const columns = header.split(',');
  return lines.map((line) => {
    const parts = line.split(',');
    const row = {};
    columns.forEach((column, index) => {
      row[column] = parts[index] ?? '';
    });
    return row;
  });
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'historical-real-oil-price/1.0',
      Accept: 'text/csv,application/json;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  return response.text();
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function groupByYear(rows, dateKey, valueKey) {
  const map = new Map();

  rows.forEach((row) => {
    const year = Number(String(row[dateKey]).slice(0, 4));
    const value = Number(row[valueKey]);
    if (!Number.isFinite(year) || !Number.isFinite(value)) return;
    if (!map.has(year)) map.set(year, []);
    map.get(year).push({ date: row[dateKey], value });
  });

  return map;
}

const owidRows = parseCsv(await fetchText(OWID_REAL_DATA_URL));
const owidValueColumn = Object.keys(owidRows[0]).find((key) => !['Entity', 'Code', 'Year'].includes(key));

const realEffective = owidRows
  .filter((row) => row.Entity === 'World')
  .map((row) => ({
    year: Number(row.Year),
    value_2024_m3: Number(row[owidValueColumn]),
  }))
  .filter((row) => Number.isFinite(row.year) && Number.isFinite(row.value_2024_m3) && row.year <= 2024)
  .sort((a, b) => a.year - b.year);

const fredRows = parseCsv(await fetchText(FRED_WTI_URL))
  .map((row) => ({ observation_date: row.observation_date ?? row.DATE, nominal_value_bbl: Number(row.DCOILWTICO) }))
  .filter((row) => row.observation_date && Number.isFinite(row.nominal_value_bbl));

const cpiRows = parseCsv(await fetchText(FRED_CPI_URL))
  .map((row) => ({ observation_date: row.observation_date ?? row.DATE, cpi: Number(row.CPIAUCSL) }))
  .filter((row) => row.observation_date && Number.isFinite(row.cpi));

const fredByYear = groupByYear(fredRows, 'observation_date', 'nominal_value_bbl');
const cpiByYear = groupByYear(cpiRows, 'observation_date', 'cpi');

const cpiAnnual = [...cpiByYear.entries()].map(([year, entries]) => ({ year, cpi: mean(entries.map((entry) => entry.value)) }));
const cpiMap = new Map(cpiAnnual.map((entry) => [entry.year, entry.cpi]));

const baseCpi = cpiMap.get(2024);
const cpi2014 = cpiMap.get(2014);
if (!baseCpi || !cpi2014) throw new Error('Missing CPI base years 2014 or 2024');

const recentStats = [2025, 2026].map((year) => {
  const entries = fredByYear.get(year) ?? [];
  if (!entries.length) return null;
  const values = entries.map((entry) => entry.value);
  return {
    year,
    mean_bbl: mean(values),
    last_bbl: values.at(-1),
    max_bbl: Math.max(...values),
  };
}).filter(Boolean);

const fredRecent = recentStats.map((entry) => ({
  year: entry.year,
  nominal_value_bbl: entry.year === 2026 ? entry.max_bbl : entry.mean_bbl,
}));

const fredLinkYears = [2024, 2025, 2026]
  .map((year) => {
    const entries = fredByYear.get(year) ?? [];
    const cpi = cpiMap.get(year);
    if (!entries.length || !cpi) return null;
    const nominalValueBbl = mean(entries.map((entry) => entry.value));
    const nominalValueM3 = nominalValueBbl * BARRELS_PER_CUBIC_METER;
    return {
      year,
      rebuilt_real_value_m3: nominalValueM3 * (baseCpi / cpi),
    };
  })
  .filter(Boolean);

const fred2024 = fredLinkYears.find((entry) => entry.year === 2024)?.rebuilt_real_value_m3;
const owid2024 = realEffective.find((entry) => entry.year === 2024)?.value_2024_m3;
if (!fred2024 || !owid2024) throw new Error('Missing link year 2024');

const linkFactor = owid2024 / fred2024;
const usd2024To2014 = cpi2014 / baseCpi;

const recentReal = fredRecent
  .map((entry) => {
    const cpi = cpiMap.get(entry.year);
    if (!cpi) return null;
    const nominalValueM3 = entry.nominal_value_bbl * BARRELS_PER_CUBIC_METER;
    const rebuiltRealValueM3 = nominalValueM3 * (baseCpi / cpi);
    return {
      year: entry.year,
      value_2024_m3: rebuiltRealValueM3 * linkFactor,
    };
  })
  .filter(Boolean);

const finalSeries = [...realEffective, ...recentReal]
  .sort((a, b) => a.year - b.year)
  .map((entry) => ({
    year: entry.year,
    date: `${entry.year}-01-01`,
    value_2014_bbl: (entry.value_2024_m3 / BARRELS_PER_CUBIC_METER) * usd2024To2014,
  }));

const payload = {
  generatedAt: new Date().toISOString(),
  title: 'Crude oil prices, $2014/bbl',
  subtitle: '2026 is year-to-date data.',
  source: 'Bloomberg, BP, Federal Reserve, Haver Analytics, various news sources, Goldman Sachs GIR.',
  range: { startYear: finalSeries[0].year, endYear: finalSeries.at(-1).year },
  series: finalSeries,
  recessions,
  annotations,
  overlayBoxes,
};

await mkdir(outDir, { recursive: true });
await writeFile(outFile, JSON.stringify(payload, null, 2));
console.log(`Wrote ${outFile}`);
