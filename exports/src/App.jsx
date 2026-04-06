import { useMemo, useRef, useState } from 'react';

const UI = {
  en: {
    heading: 'Crude Oil Exports Transiting the Strait of Hormuz, 2025',
    subtitle: 'Flow diagram reconstructed from the labeled shares in the reference graphic.',
    downloadPng: 'Download PNG',
    noteLabel: 'Note:',
    noteText: 'Percent labels and category mix follow the reference graphic. Band widths are computed directly from those shares.',
    sourceLabel: 'Source:',
    sourceText: 'Reference graphic based on U.S. Energy Information Administration analysis using Vortexa tanker tracking.',
    homeLabel: 'Open Macro Plots',
    historicalLabel: 'Historical Oil Prices',
    rallyLabel: 'Rally 2026',
    momentumLabel: 'Momentum',
    originLabel: 'Origin',
    straitLabel: 'Strait of Hormuz',
    destinationLabel: 'Destination',
  },
  es: {
    heading: 'Exportaciones de crudo que transitan por el Estrecho de Ormuz, 2025',
    subtitle: 'Diagrama de flujos reconstruido desde las participaciones rotuladas en el gráfico de referencia.',
    downloadPng: 'Descargar PNG',
    noteLabel: 'Nota:',
    noteText: 'Los porcentajes y categorías siguen el gráfico de referencia. El ancho de cada banda se calcula directamente desde esas participaciones.',
    sourceLabel: 'Fuente:',
    sourceText: 'Gráfico de referencia basado en análisis de la U.S. Energy Information Administration usando trazado de buques de Vortexa.',
    homeLabel: 'Abrir Macro Plots',
    historicalLabel: 'Historia del precio del petróleo',
    rallyLabel: 'Rally 2026',
    momentumLabel: 'Momentum',
    originLabel: 'Origen',
    straitLabel: 'Estrecho de Ormuz',
    destinationLabel: 'Destino',
  },
};

const ORIGINS = [
  { name: 'Qatar', pct: 5 },
  { name: 'Kuwait', pct: 10 },
  { name: 'Iran', pct: 11 },
  { name: 'United Arab\nEmirates', pct: 14 },
  { name: 'Iraq', pct: 22 },
  { name: 'Saudi Arabia', pct: 38 },
];

const DESTINATIONS = [
  { name: 'Rest of\nWorld', pct: 2, dx: -34 },
  { name: 'United\nStates', pct: 3, dx: -18 },
  { name: 'Europe', pct: 4 },
  { name: 'Other Asia\nand Oceania', pct: 16, boxed: true },
  { name: 'Japan', pct: 12 },
  { name: 'South\nKorea', pct: 12 },
  { name: 'India', pct: 14 },
  { name: 'China', pct: 37, boxed: true },
];

const WIDTH = 1080;
const HEIGHT = 980;
const BG = '#050505';
const TEXT = '#f2f2f2';
const TOP_FLOW_FILL = '#16a34a';
const TOP_FLOW_STROKE = 'rgba(34, 197, 94, 0.72)';
const BOTTOM_FLOW_FILL = '#dc2626';
const BOTTOM_FLOW_STROKE = 'rgba(248, 113, 113, 0.72)';
const BOX_FILL = 'rgba(255, 255, 255, 0.05)';
const BOX_STROKE = 'rgba(255, 255, 255, 0.18)';

const LEFT = 90;
const FULL_WIDTH = 720;
const TOP_BOX_Y = 96;
const TOP_FLOW_Y = 118;
const STRAIT_Y = 428;
const STRAIT_H = 18;
const BOTTOM_FLOW_Y = 446;
const BOTTOM_BOX_Y = 748;
const BOX_H = 20;
const FULL_GAP = 18;
const THROAT_SCALE = 0.92;
const THROAT_GAP = 0;
const THROAT_LEFT = LEFT + (FULL_WIDTH - FULL_WIDTH * THROAT_SCALE);
const THROAT_WIDTH = FULL_WIDTH * THROAT_SCALE;

function splitLines(label) {
  return label.split('\n');
}

function layoutBands(items, left, width, gap) {
  const total = items.reduce((sum, item) => sum + item.pct, 0);
  const usable = width - gap * (items.length - 1);
  let x = left;
  return items.map((item) => {
    const w = (item.pct / total) * usable;
    const out = { ...item, x, w };
    x += w + gap;
    return out;
  });
}

function flowBandPath(top, throat, y0, y1) {
  const c1y = y0 + (y1 - y0) * 0.34;
  const c2y = y0 + (y1 - y0) * 0.78;
  return [
    `M ${top.x} ${y0}`,
    `C ${top.x} ${c1y}, ${throat.x} ${c2y}, ${throat.x} ${y1}`,
    `L ${throat.x + throat.w} ${y1}`,
    `C ${throat.x + throat.w} ${c2y}, ${top.x + top.w} ${c1y}, ${top.x + top.w} ${y0}`,
    'Z',
  ].join(' ');
}

function downloadSvgAsPng(svgNode) {
  if (!svgNode) return;
  const clone = svgNode.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const serialized = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH * 2;
    canvas.height = HEIGHT * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = 'hormuz-exports-2025.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pngUrl);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };
  image.src = url;
}

export default function App() {
  const [lang, setLang] = useState('es');
  const svgRef = useRef(null);
  const ui = UI[lang];

  const historicalUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:4224/'
    : '/oil-price/historical-real-oil-price/';
  const rallyUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:4222/'
    : '/oil-price/rally-oil-price/';
  const momentumUrl = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:4223/'
    : '/oil-price/ROC(12)/';
  const macroPlotsUrl = 'https://sebabecerra.github.io/macro-plots/';

  const { topBands, bottomBands, topThroat, bottomThroat } = useMemo(() => {
    const topBands = layoutBands(ORIGINS, LEFT, FULL_WIDTH, FULL_GAP);
    const bottomBands = layoutBands(DESTINATIONS, LEFT, FULL_WIDTH, FULL_GAP);
    const topThroatBase = layoutBands(ORIGINS, THROAT_LEFT, THROAT_WIDTH, THROAT_GAP);
    const bottomThroatBase = layoutBands(DESTINATIONS, THROAT_LEFT, THROAT_WIDTH, THROAT_GAP);

    const topThroat = topThroatBase;
    const bottomThroat = bottomThroatBase;

    return { topBands, bottomBands, topThroat, bottomThroat };
  }, []);

  return (
    <main className="page">
      <section className="panel">
        <div className="panel-head">
          <div className="panel-controls">
            <div>
              <h1 className="dashboard-title dashboard-title-accent">{ui.heading}</h1>
              <p className="dashboard-subtitle">{ui.subtitle}</p>
            </div>
            <div className="lang-switch">
              <button type="button" className="lang-btn" onClick={() => downloadSvgAsPng(svgRef.current)}>{ui.downloadPng}</button>
              <button type="button" className={`lang-btn ${lang === 'es' ? 'lang-btn-active' : ''}`} onClick={() => setLang('es')}>ES</button>
              <button type="button" className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`} onClick={() => setLang('en')}>EN</button>
            </div>
          </div>
          <div className="brand-row">
            <a className="lang-btn link-btn" href={macroPlotsUrl} target="_blank" rel="noreferrer">{ui.homeLabel}</a>
            <a className="lang-btn link-btn" href={historicalUrl}>{ui.historicalLabel}</a>
            <a className="lang-btn link-btn" href={rallyUrl}>{ui.rallyLabel}</a>
            <a className="lang-btn link-btn" href={momentumUrl}>{ui.momentumLabel}</a>
          </div>
        </div>
        <div className="frame">
          <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart" role="img" aria-label={ui.heading}>
            <rect width={WIDTH} height={HEIGHT} fill={BG} />

            <text x={LEFT + FULL_WIDTH / 2} y="34" textAnchor="middle" fill={TEXT} fontSize="18" fontWeight="700">{ui.originLabel}</text>
            <text x={LEFT + FULL_WIDTH / 2} y={STRAIT_Y + STRAIT_H / 2 + 5} textAnchor="middle" fill={TEXT} fontSize="16" fontWeight="700">{ui.straitLabel}</text>

            {topBands.map((band, index) => (
              <g key={band.name}>
                <path d={flowBandPath(band, topThroat[index], TOP_FLOW_Y, STRAIT_Y)} fill={TOP_FLOW_FILL} stroke={TOP_FLOW_STROKE} strokeWidth="1" opacity="0.95" />
                {splitLines(band.name).map((line, idx, arr) => (
                  <text key={idx} x={band.x + band.w / 2} y={82 - (arr.length - idx - 1) * 14} textAnchor="middle" fill={TEXT} fontSize="14" fontWeight="700">{line}</text>
                ))}
                <text x={band.x + band.w / 2} y={TOP_BOX_Y + 14} textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="800">{band.pct}%</text>
              </g>
            ))}


            {bottomBands.map((band, index) => (
              <g key={band.name}>
                <path d={flowBandPath(bottomThroat[index], band, BOTTOM_FLOW_Y, BOTTOM_BOX_Y)} fill={BOTTOM_FLOW_FILL} stroke={BOTTOM_FLOW_STROKE} strokeWidth="1" opacity="0.95" />
                <text x={band.x + band.w / 2} y={BOTTOM_BOX_Y + 14} textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="800">{band.pct}%</text>
                {splitLines(band.name).map((line, idx) => (
                  <text key={idx} x={band.x + band.w / 2 + (band.dx ?? 0)} y={786 + idx * 14} textAnchor="middle" fill={TEXT} fontSize="14" fontWeight="700">{line}</text>
                ))}
              </g>
            ))}

            <text x={LEFT + FULL_WIDTH / 2} y="852" textAnchor="middle" fill={TEXT} fontSize="18" fontWeight="700">{ui.destinationLabel}</text>
          </svg>
          <div className="footer-note"><em>{ui.noteLabel} {ui.noteText}</em></div>
          <div className="footer-source"><em>{ui.sourceLabel} {ui.sourceText}</em></div>
        </div>
      </section>
    </main>
  );
}
