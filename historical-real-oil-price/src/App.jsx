import { useEffect, useMemo, useState } from 'react';

const WIDTH = 1580;
const HEIGHT = 760;
const MARGIN = { top: 110, right: 34, bottom: 120, left: 62 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const Y_MAX = 140;
const ACCENT = "#ffd166";
const Y_TICKS = [0, 20, 40, 60, 80, 100, 120, 140];
const X_TICKS = [1861, 1870, 1880, 1890, 1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020, 2026];
const ANIMATION_MS = 16000;

const UI_TEXT = {
  en: {
    heading: 'History of Oil Prices',
    subtitle: 'Long-run reconstructed real oil price series extended to 2026 and rendered in the visual language of the commodity monitor.',
    noteLabel: 'Note:',
    sourceLabel: 'Source:',
    reloadLabel: 'Reload',
    downloadLabel: 'Download CSV',
    macroPlotsLabel: 'Open Macro Plots',
    rallyLabel: 'Rally 2026',
    chartTitle: 'Crude oil prices, $2014/bbl',
    chartSubtitle: '2026 is year-to-date data.',
  },
  es: {
    heading: 'Historia del Precio del Petroleo',
    subtitle: 'Serie historica reconstruida del precio real del petroleo extendida a 2026 y renderizada con el lenguaje visual del monitor de commodities.',
    noteLabel: 'Nota:',
    sourceLabel: 'Fuente:',
    reloadLabel: 'Recargar',
    downloadLabel: 'Descargar CSV',
    macroPlotsLabel: 'Abrir Macro Plots',
    rallyLabel: 'Rally 2026',
    chartTitle: 'Precio del petroleo, $2014/bbl',
    chartSubtitle: '2026 corresponde a datos acumulados del año.',
  },
};

const TITLE_TRANSLATIONS = {
  es: {
    '1862-1865': '1862-1865',
    '1865-1890': '1865-1890',
    '1891-1894': '1891-1894',
    '1894': '1894',
    '1920': '1920',
    '1931': '1931',
    '1947': '1947',
    '1973-1974': '1973-1974',
    '1978-1979': '1978-1979',
    '1980': '1980',
    '1980s': 'Años 80',
    '1988': '1988',
    '1990': '1990',
    'Mid-2000s': 'Mediados de los 2000',
    '2011': '2011',
    '2014-2015': '2014-2015',
    'March 2026': 'Marzo 2026',
    '1864 — Civil War': '1864 — Guerra Civil',
    '1973 — Arab Oil Embargo': '1973 — Embargo petrolero arabe',
    '1979 — Iranian Revolution': '1979 — Revolucion irani',
    '1990 — Gulf War': '1990 — Guerra del Golfo',
    '2008 — Financial Crisis': '2008 — Crisis financiera',
    '2026 — We are here 🔴': '2026 — Estamos aqui 🔴',
  },
};

const BODY_TRANSLATIONS = {
  es: {
    'US Civil War drives up\ncommodity prices': 'La Guerra Civil de EE.UU.\nimpulsa al alza\nlos precios de las commodities',
    'Prices boom\nand bust with\nfluctuations in\nUS drilling': 'Los precios suben\ny caen con las\nfluctuaciones de la\nproduccion en EE.UU.',
    'Pennsylvania\noilfields begin to\ndecline, setting the\nstage for higher\nprices in 1895': 'Los campos petroleros\nde Pensilvania\nempiezan a declinar,\npreparando el terreno\npara precios mas altos en 1895',
    'Cholera epidemic\ncuts production in\nBaku, Azerbaijan,\ncontributing to 1895\nspike': 'La epidemia de colera\nreduce la produccion en\nBaku, Azerbaiyan,\ncontribuyendo al salto\nde 1895',
    'Rapid adoption of the\nautomobile drastically\nraises oil consumption,\nleading to the "West\nCoast Gasoline\nFamine"': 'La adopcion rapida del\nautomovil eleva con fuerza\nel consumo de petroleo,\nllevando a la "hambruna\nde gasolina de la\ncosta oeste"',
    'Prices hit record\nlow as onset of\nGreat Depression\nreduces demand': 'Los precios tocan\nminimos historicos\ncuando el inicio de la\nGran Depresion reduce la demanda',
    'Post-war\nautomotive\nboom creates\nfuel shortages\nin some US\nstates': 'El boom automotriz\nde posguerra genera\nescasez de combustible\nen algunos estados\nde EE.UU.',
    'Arab states\ninstitute\nembargo against\ncountries\nsupporting Israel\nin the Yom\nKippur War': 'Los estados arabes\nimponen un embargo\ncontra los paises que\napoyan a Israel\nen la guerra de\nYom Kippur',
    'Iran cuts production and\nexports during revolution,\ncancels contracts with\nUS companies': 'Iran reduce produccion y\nexportaciones durante la revolucion,\ny cancela contratos con\nempresas estadounidenses',
    'Iran-Iraq War begins;\nexports from the\nregion slow further': 'Comienza la guerra\nIran-Irak; las exportaciones\nde la region se frenan aun mas',
    'Demand\nresponse\nto supply\nshocks\npushes\nprices\ndown': 'La respuesta\nde la demanda\na los shocks\nde oferta\nempuja\nlos precios\na la baja',
    'Iran, Iraq\nincrease\noutput with\nend of war': 'Iran e Irak\naumentan\nproduccion\ncon el fin\nde la guerra',
    'Iraq invades\nKuwait; Kuwaiti\nexports cut\nuntil 1994': 'Irak invade\nKuwait; las exportaciones\nde Kuwait caen\nhasta 1994',
    'Asia drives\nrising\ndemand as\nproduction\nstagnates\nand spare\ncapacity\ndeclines': 'Asia impulsa\nuna demanda\nen alza mientras\nla produccion\nse estanca y\nla capacidad\nociosa cae',
    'Arab Spring;\nLibyan civil war\ndisrupts output': 'Primavera arabe;\nla guerra civil libia\ndisrumpe la produccion',
    'Global\noversupply\nleaves oil\nmarkets\nsearching for\nnew equilibrium': 'El exceso global\nde oferta deja al\nmercado petrolero\nbuscando\nun nuevo\nequilibrio',
    'Oil flows\nthrough the\nStrait of\nHormuz are\ndisrupted amid\nthe US/Israel-\nIran war': 'Los flujos de petroleo\npor el estrecho\nde Ormuz se ven\ninterrumpidos en medio\nde la guerra entre\nEE.UU./Israel\ne Iran',
  },
};

function translate(lang, text, map) {
  if (lang === 'en') return text;
  return map[lang]?.[text] ?? text;
}

function downloadSeriesCsv(series) {
  const rows = [
    ['year', 'date', 'value_2014_bbl'],
    ...series.map((item) => [item.year, item.date, item.value_2014_bbl]),
  ];
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'historical-real-oil-price.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function xScale(year, minYear, maxYear) {
  return MARGIN.left + ((year - minYear) / (maxYear - minYear)) * INNER_WIDTH;
}

function yScale(value) {
  return MARGIN.top + (1 - value / Y_MAX) * INNER_HEIGHT;
}

function interpolateValueAtYear(series, year) {
  if (!series.length) return 0;
  if (year <= series[0].year) return series[0].value_2014_bbl;
  if (year >= series[series.length - 1].year) return series[series.length - 1].value_2014_bbl;

  for (let index = 0; index < series.length - 1; index += 1) {
    const left = series[index];
    const right = series[index + 1];
    if (year >= left.year && year <= right.year) {
      const span = right.year - left.year || 1;
      const t = (year - left.year) / span;
      return left.value_2014_bbl + (right.value_2014_bbl - left.value_2014_bbl) * t;
    }
  }

  return series[series.length - 1].value_2014_bbl;
}

function buildPath(series, minYear, maxYear) {
  return series
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${xScale(point.year, minYear, maxYear).toFixed(2)} ${yScale(point.value_2014_bbl).toFixed(2)}`)
    .join(' ');
}

function resolveAnnotationYear(item) {
  if (typeof item.anchorYear === 'number') return item.anchorYear;
  const match = item.title.match(/(\d{4})(?:-(\d{4}))?/);
  if (!match) return 1861;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : start;
  return (start + end) / 2;
}

function annotationTriggerYear(item) {
  return resolveAnnotationYear(item) - 0.8;
}

function resolveAnnotationBoxX(item, minYear, maxYear) {
  const anchorYear = resolveAnnotationYear(item);
  const centeredX = xScale(anchorYear, minYear, maxYear) - (item.w / 2) + (item.xOffset ?? 0);
  const minX = MARGIN.left + 4;
  const maxX = WIDTH - MARGIN.right - item.w - 4;
  return Math.max(minX, Math.min(maxX, centeredX));
}

function Annotation({ item, visible, showConnector, minYear, maxYear, series, lang }) {
  const isHighlight = item.variant === 'highlight';
  const titleColor = isHighlight ? '#ffd166' : '#f3f4f6';
  const bodyColor = isHighlight ? '#ffe5a3' : 'rgba(229, 231, 235, 0.88)';
  const anchorYear = resolveAnnotationYear(item);
  const bodyText = translate(lang, item.body, BODY_TRANSLATIONS);
  const bodyLines = bodyText.split('\n');
  const pointX = xScale(anchorYear, minYear, maxYear);
  const pointY = yScale(interpolateValueAtYear(series, anchorYear));
  const boxX = resolveAnnotationBoxX(item, minYear, maxYear);
  const lineStartX = Math.max(boxX + 6, Math.min(boxX + item.w - 6, pointX));
  const connectorFromTop = item.connectorSide === 'top';
  const lineStartY = connectorFromTop ? item.y : item.y + 24 + bodyLines.length * 14;
  return (
    <>
      <line
        x1={lineStartX}
        y1={lineStartY}
        x2={pointX}
        y2={pointY}
        stroke="rgba(180, 180, 180, 0.65)"
        strokeWidth="1.25"
        strokeDasharray="4 4"
        style={{
          opacity: showConnector ? 1 : 0,
          transition: 'opacity 0.45s ease',
        }}
      />
      <foreignObject x={boxX} y={item.y} width={item.w} height={item.h}>
        <div xmlns="http://www.w3.org/1999/xhtml" className={`annotation-box align-left ${visible ? 'annotation-visible' : 'annotation-hidden'}`}>
          <div className="annotation-title" style={{ color: titleColor }}>{translate(lang, item.title, TITLE_TRANSLATIONS)}</div>
          <div className="annotation-body" style={{ color: bodyColor }}>
            {bodyLines.map((line, index) => (
              <div key={`${item.title}-${index}`}>{line}</div>
            ))}
          </div>
        </div>
      </foreignObject>
    </>
  );
}

function OverlayBox({ item, visible, lang }) {
  return (
    <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className="overlay-box"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.45s ease 0.35s',
        }}
      >
        {translate(lang, item.title, TITLE_TRANSLATIONS)}
      </div>
    </foreignObject>
  );
}

function OverlayConnector({ item, minYear, maxYear, series, visible }) {
  const anchorYear = item.anchorYear;
  const pointX = xScale(anchorYear, minYear, maxYear);
  const pointY = yScale(interpolateValueAtYear(series, anchorYear));
  const startX = Math.max(item.x + 8, Math.min(item.x + item.w - 8, pointX));
  const startY = item.y + item.h;
  return (
    <line
      x1={startX}
      y1={startY}
      x2={pointX}
      y2={pointY}
      stroke="rgba(255,255,255,0.82)"
      strokeWidth="1.4"
      strokeDasharray="4 4"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.45s ease',
      }}
    />
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [lang, setLang] = useState('en');
  const [animationKey, setAnimationKey] = useState(0);
  const dataUrl = `${import.meta.env.BASE_URL}data/oil-history.json`;
  const baseUrl = import.meta.env.BASE_URL;
  const rallyUrl = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:4182/"
    : (baseUrl.endsWith("/historical-real-oil-price/") ? baseUrl.replace(/\/historical-real-oil-price\/$/, "/rally-oil-price/") : "/rally-oil-price/");

  useEffect(() => {
    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [dataUrl]);

  useEffect(() => {
    if (!data) return undefined;

    let frame = 0;
    const start = performance.now();

    const tick = (now) => {
      const next = Math.min((now - start) / ANIMATION_MS, 1);
      setProgress(next);
      if (next < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [data, animationKey]);

  const chart = useMemo(() => {
    if (!data) return null;
    const minYear = data.range.startYear;
    const maxYear = data.range.endYear;
    return {
      minYear,
      maxYear,
      path: buildPath(data.series, minYear, maxYear),
      currentYear: minYear + progress * (maxYear - minYear),
    };
  }, [data, progress]);

  if (error) {
    return <main className="page"><div className="status">Could not load data: {error}</div></main>;
  }

  if (!data || !chart) {
    return <main className="page"><div className="status">Loading chart…</div></main>;
  }

  const ui = UI_TEXT[lang];

  return (
    <main className="page">
      <section className="panel">
        <div className="panel-head">
          <div className="panel-controls">
            <div>
              <h1 className="dashboard-title dashboard-title-accent">{ui.heading}</h1>
              <p className="dashboard-subtitle">{ui.subtitle}</p>
            </div>
            <div className="lang-switch" role="group" aria-label="Language switch">
              <button type="button" className="lang-btn" onClick={() => downloadSeriesCsv(data.series)}>
                {ui.downloadLabel}
              </button>
              <button type="button" className={`lang-btn ${lang === 'es' ? 'lang-btn-active' : ''}`} onClick={() => setLang('es')}>ES</button>
              <button type="button" className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`} onClick={() => setLang('en')}>EN</button>
            </div>
          </div>
          <div className="brand-row">
            <a
              className="lang-btn link-btn"
              href="https://sebabecerra.github.io/macro-plots/"
              target="_blank"
              rel="noreferrer"
            >
              {ui.macroPlotsLabel}
            </a>
            <a
              className="lang-btn link-btn"
              href={rallyUrl}
            >
              {ui.rallyLabel}
            </a>
            <img src={`${import.meta.env.BASE_URL}logo_clean.png`} alt="SB" className="brand-logo" />
          </div>
        </div>

        <div className="frame">
          <div className="chart-title">{ui.chartTitle}</div>

          <svg className="chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={data.title}>
          <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#050505" />

            <line x1={MARGIN.left} y1={MARGIN.top} x2={MARGIN.left} y2={MARGIN.top + INNER_HEIGHT} stroke="rgba(255,255,255,0.32)" strokeWidth="1" />
            <line x1={MARGIN.left} y1={MARGIN.top + INNER_HEIGHT} x2={WIDTH - MARGIN.right} y2={MARGIN.top + INNER_HEIGHT} stroke="rgba(255,255,255,0.32)" strokeWidth="1" />

          {Y_TICKS.map((tick) => {
            const y = yScale(tick);
            return (
              <g key={tick}>
                  <line x1={MARGIN.left - 4} y1={y} x2={MARGIN.left} y2={y} stroke="rgba(255,255,255,0.32)" strokeWidth="1" />
                  <text x={MARGIN.left - 10} y={y + 4} className="axis axis-y" textAnchor="end">{tick}</text>
              </g>
            );
            })}

            {X_TICKS.map((tick) => {
            const x = xScale(tick, chart.minYear, chart.maxYear);
            return (
                <g key={tick}>
                  <text x={x} y={MARGIN.top + INNER_HEIGHT + 24} className="axis axis-x" textAnchor="middle">
                    {tick === 2026 ? '2026*' : tick}
                  </text>
                </g>
              );
            })}

            <path
              d={chart.path}
              fill="none"
              stroke={ACCENT}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - progress}
            />

          {data.annotations.map((item) => (
              <Annotation
                key={item.title}
                item={item}
                showConnector={progress >= 1}
                minYear={chart.minYear}
                maxYear={chart.maxYear}
                series={data.series}
                lang={lang}
                visible={chart.currentYear >= annotationTriggerYear(item)}
              />
            ))}

          {(data.overlayBoxes ?? []).map((item) => (
              <OverlayConnector
                key={`${item.title}-connector`}
                item={item}
                minYear={chart.minYear}
                maxYear={chart.maxYear}
                series={data.series}
                visible={progress >= 1}
              />
            ))}

          {(data.overlayBoxes ?? []).map((item) => (
              <OverlayBox key={item.title} item={item} visible={progress >= 1} lang={lang} />
            ))}
          </svg>

          <div className="footer-note"><em>{ui.noteLabel} {ui.chartSubtitle}</em></div>
          <div className="footer-source"><em>{ui.sourceLabel} {data.source}</em></div>
          <div className="corner-actions">
            <button
              type="button"
              className="play-btn"
              aria-label={ui.reloadLabel}
              onClick={() => {
                setProgress(0);
                setAnimationKey((value) => value + 1);
              }}
            >
              ▶
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
