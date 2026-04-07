import { useRef, useState } from 'react';

const UI = {
  en: {
    heading: 'World Oil Flows, 1H25',
    subtitle: 'Major maritime chokepoints shown as proportional funnels with selected origin and destination breakdowns from EIA figure data.',
    downloadPng: 'Download PNG',
    noteLabel: 'Note:',
    noteText: 'Each funnel is scaled by total average oil flow in 1H25. Origin and destination lists use EIA figure-data Excel files when available; Panama uses EIA table data by product and direction.',
    sourceLabel: 'Source:',
    sourceText: 'U.S. Energy Information Administration, World Oil Transit Chokepoints.',
    homeLabel: 'Open Macro Plots',
    historicalLabel: 'Historical Oil Prices',
    rallyLabel: 'Rally 2026',
    momentumLabel: 'Momentum',
    unitLabel: 'million barrels per day',
    originLabel: 'Origins',
    destinationLabel: 'Destinations',
    selectLabel: 'Chokepoint',
    transitLabel: 'transit',
    totalLabel: 'Total / Ranking',
    totalCenterLabel: 'World oil flow',
  },
  es: {
    heading: 'Flujos de petroleo mundial, 1S25',
    subtitle: 'Principales pasos maritimos como embudos proporcionales con aperturas seleccionadas de origen y destino desde los Excel de EIA.',
    downloadPng: 'Descargar PNG',
    noteLabel: 'Nota:',
    noteText: 'Cada embudo esta escalado por el flujo total promedio de petroleo en 1S25. Las listas de origen y destino usan data de EIA cuando existen; Panama usa la tabla EIA por producto y direccion.',
    sourceLabel: 'Fuente:',
    sourceText: 'U.S. Energy Information Administration, World Oil Transit Chokepoints.',
    homeLabel: 'Abrir Macro Plots',
    historicalLabel: 'Historia del precio del petroleo',
    rallyLabel: 'Rally 2026',
    momentumLabel: 'Momentum',
    unitLabel: 'millones de barriles diarios',
    originLabel: 'Origenes',
    destinationLabel: 'Destinos',
    selectLabel: 'Paso',
    transitLabel: 'transito',
    totalLabel: 'Total / Ranking',
    totalCenterLabel: 'Flujo del petroleo mundial',
  },
};

const TOTAL_CHOKEPOINT = {
  label: { en: 'Total / Ranking', es: 'Total / Ranking' },
  value: 73.2,
  isTotal: true,
  origin: [
    { label: { en: 'Malacca', es: 'Malaca' }, value: 23.2 },
    { label: { en: 'Hormuz', es: 'Ormuz' }, value: 20.9 },
    { label: { en: 'Good Hope', es: 'Buena Esperanza' }, value: 9.1 },
    { label: { en: 'Suez\n+\nSUMED', es: 'Suez\n+\nSUMED' }, value: 4.9 },
    { label: { en: 'Danish Straits', es: 'Estrechos daneses' }, value: 4.9 },
    { label: { en: 'Bab el-Mandeb', es: 'Bab el-Mandeb' }, value: 4.2 },
    { label: { en: 'Turkish Straits', es: 'Estrechos turcos' }, value: 3.7 },
    { label: { en: 'Panama Canal', es: 'Canal de Panama' }, value: 2.3, dx: 18 },
  ],
  destination: [
    { label: { en: 'Malacca', es: 'Malaca' }, value: 23.2 },
    { label: { en: 'Hormuz', es: 'Ormuz' }, value: 20.9 },
    { label: { en: 'Good Hope', es: 'Buena Esperanza' }, value: 9.1 },
    { label: { en: 'Suez\n+\nSUMED', es: 'Suez\n+\nSUMED' }, value: 4.9 },
    { label: { en: 'Danish Straits', es: 'Estrechos daneses' }, value: 4.9 },
    { label: { en: 'Bab el-Mandeb', es: 'Bab el-Mandeb' }, value: 4.2 },
    { label: { en: 'Turkish Straits', es: 'Estrechos turcos' }, value: 3.7 },
    { label: { en: 'Panama Canal', es: 'Canal de Panama' }, value: 2.3, dx: 18 },
  ],
};

const CHOKEPOINTS = [
  TOTAL_CHOKEPOINT,
  {
    label: { en: 'Strait of Malacca', es: 'Estrecho de Malaca' },
    value: 23.2,
    origin: [
      { label: { en: 'Saudi Arabia', es: 'Arabia Saudita' }, value: 4.2 },
      { label: { en: 'UAE', es: 'EAU' }, value: 2.5 },
      { label: { en: 'Iraq', es: 'Irak' }, value: 1.8 },
      { label: { en: 'Iran', es: 'Iran' }, value: 1.6 },
      { label: { en: 'Kuwait', es: 'Kuwait' }, value: 1.1 },
      { label: { en: 'Other', es: 'Otros' }, value: 5.4 },
    ],
    destination: [
      { label: { en: 'China', es: 'China' }, value: 7.9 },
      { label: { en: 'South Korea', es: 'Corea del Sur' }, value: 2.4 },
      { label: { en: 'Japan', es: 'Japon' }, value: 2.1 },
      { label: { en: 'Other Asia', es: 'Otra Asia' }, value: 1.5 },
      { label: { en: 'Other', es: 'Otros' }, value: 2.6 },
    ],
  },
  {
    label: { en: 'Strait of Hormuz', es: 'Estrecho de Ormuz' },
    value: 20.9,
    origin: [
      { label: { en: 'Saudi Arabia', es: 'Arabia Saudita' }, value: 5.6 },
      { label: { en: 'Iraq', es: 'Irak' }, value: 3.3 },
      { label: { en: 'UAE', es: 'EAU' }, value: 2.1 },
      { label: { en: 'Iran', es: 'Iran' }, value: 1.6 },
      { label: { en: 'Kuwait', es: 'Kuwait' }, value: 1.5 },
      { label: { en: 'Qatar', es: 'Qatar' }, value: 0.7 },
      { label: { en: 'Other', es: 'Otros' }, value: 0.1 },
    ],
    destination: [
      { label: { en: 'China', es: 'China' }, value: 5.4 },
      { label: { en: 'Other Asia', es: 'Otra Asia' }, value: 2.3 },
      { label: { en: 'India', es: 'India' }, value: 2.0 },
      { label: { en: 'South Korea', es: 'Corea del Sur' }, value: 1.7 },
      { label: { en: 'Japan', es: 'Japon' }, value: 1.7 },
      { label: { en: 'Europe', es: 'Europa' }, value: 0.6 },
      { label: { en: 'United States', es: 'Estados Unidos' }, value: 0.4 },
      { label: { en: 'Other', es: 'Otros' }, value: 0.6 },
    ],
  },
  {
    label: { en: 'Cape of Good Hope', es: 'Cabo de Buena Esperanza' },
    value: 9.1,
    origin: [
      { label: { en: 'United States', es: 'Estados Unidos' }, value: 1.4 },
      { label: { en: 'Brazil', es: 'Brasil' }, value: 1.1 },
      { label: { en: 'Angola', es: 'Angola' }, value: 0.8 },
      { label: { en: 'Other Africa', es: 'Otra Africa' }, value: 0.7 },
      { label: { en: 'Other Americas', es: 'Otra America' }, value: 0.7 },
      { label: { en: 'Other', es: 'Otros' }, value: 1.2 },
    ],
    destination: [
      { label: { en: 'China', es: 'China' }, value: 2.5 },
      { label: { en: 'India', es: 'India' }, value: 0.8 },
      { label: { en: 'South Korea', es: 'Corea del Sur' }, value: 0.7 },
      { label: { en: 'Europe', es: 'Europa' }, value: 0.5 },
      { label: { en: 'Other Asia', es: 'Otra Asia' }, value: 0.5 },
      { label: { en: 'Other', es: 'Otros' }, value: 1.1 },
    ],
  },
  {
    label: { en: 'Suez Canal + SUMED', es: 'Canal de Suez + SUMED' },
    value: 4.9,
    origin: [
      { label: { en: 'Russia', es: 'Rusia' }, value: 1.7 },
      { label: { en: 'Saudi Arabia', es: 'Arabia Saudita' }, value: 0.6 },
      { label: { en: 'Kazakhstan', es: 'Kazajistan' }, value: 0.2 },
      { label: { en: 'Egypt', es: 'Egipto' }, value: 0.2 },
      { label: { en: 'Other', es: 'Otros' }, value: 0.2 },
    ],
    destination: [
      { label: { en: 'India', es: 'India' }, value: 1.7 },
      { label: { en: 'Other Europe', es: 'Otra Europa' }, value: 0.4 },
      { label: { en: 'Poland', es: 'Polonia' }, value: 0.2 },
      { label: { en: 'Italy', es: 'Italia' }, value: 0.2 },
      { label: { en: 'Other', es: 'Otros' }, value: 0.4 },
    ],
  },
  {
    label: { en: 'Danish Straits', es: 'Estrechos daneses' },
    value: 4.9,
    origin: [
      { label: { en: 'Russia', es: 'Rusia' }, value: 1.4 },
      { label: { en: 'Norway', es: 'Noruega' }, value: 0.5 },
      { label: { en: 'Egypt', es: 'Egipto' }, value: 0.3 },
      { label: { en: 'Other', es: 'Otros' }, value: 0.5 },
    ],
    destination: [
      { label: { en: 'India', es: 'India' }, value: 1.1 },
      { label: { en: 'Poland', es: 'Polonia' }, value: 0.7 },
      { label: { en: 'Türkiye', es: 'Turquia' }, value: 0.2 },
      { label: { en: 'Other Europe', es: 'Otra Europa' }, value: 0.2 },
      { label: { en: 'Other', es: 'Otros' }, value: 0.7 },
    ],
  },
  {
    label: { en: 'Turkish Straits', es: 'Estrechos turcos' },
    value: 3.7,
    origin: [
      { label: { en: 'Kazakhstan', es: 'Kazajistan' }, value: 1.5 },
      { label: { en: 'Russia', es: 'Rusia' }, value: 0.5 },
      { label: { en: 'Other', es: 'Otros' }, value: 0.2 },
    ],
    destination: [
      { label: { en: 'India', es: 'India' }, value: 0.5 },
      { label: { en: 'Italy', es: 'Italia' }, value: 0.4 },
      { label: { en: 'Netherlands', es: 'Paises Bajos' }, value: 0.2 },
      { label: { en: 'Türkiye', es: 'Turquia' }, value: 0.2 },
      { label: { en: 'Other Europe', es: 'Otra Europa' }, value: 0.2 },
      { label: { en: 'Other', es: 'Otros' }, value: 0.4 },
    ],
  },
];

const WIDTH = 1080;
const HEIGHT = 820;
const BG = '#050505';
const TEXT = '#f2f2f2';
const MUTED = 'rgba(242, 242, 242, 0.62)';
const GOLD = '#ffd166';
const GREEN = '#16a34a';
const RED = '#dc2626';
const FLOW_CX = 450;
const FLOW_TOP_Y = 118;
const FLOW_THROAT_Y = 428;
const FLOW_BOTTOM_Y = 446;
const FLOW_BOTTOM_END_Y = 748;
const FLOW_W = 720;
const FLOW_THROAT_W = 302;
const LABEL_MIN_W = 48;
const SEGMENT_GAP = 18;
const THROAT_GAP = 0;
const EIA_DOC_URL = 'https://www.eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints';

function localizedLabel(item, lang) {
  return item.label?.[lang] ?? item.label?.en;
}

function localizedHeader(item, side, ui) {
  if (item.isTotal) return ui.totalLabel;
  const key = item[`${side}Header`];
  if (key) return ui[key];
  return side === 'origin' ? ui.originLabel : ui.destinationLabel;
}

function formatValue(value) {
  return value.toFixed(1);
}

function formatPercent(value, total) {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function splitLines(text) {
  return text.split('\n');
}

function trimLabel(text, max = 15) {
  return text.length > max ? `${text.slice(0, max - 1)}.` : text;
}

function wrapLabel(text, max = 12) {
  if (text.includes('\n')) return splitLines(text);
  const words = text.split(' ');
  const lines = [];
  let current = '';
  words.forEach((word) => {
    if ((current ? `${current} ${word}` : word).length <= max) {
      current = current ? `${current} ${word}` : word;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function DetailList({ x, y, title, items, lang }) {
  return (
    <g>
      <text x={x} y={y} fill={GOLD} fontSize="12" fontWeight="900">{title}</text>
      {items.map((entry, index) => (
        <g key={`${localizedLabel(entry, lang)}-${index}`}>
          <text x={x} y={y + 18 + index * 17} fill={TEXT} fontSize="12" fontWeight="800">
            {trimLabel(localizedLabel(entry, lang))}
          </text>
          <text x={x + 104} y={y + 18 + index * 17} fill={MUTED} fontSize="12" fontWeight="800" textAnchor="end">
            {formatValue(entry.value)}
          </text>
        </g>
      ))}
    </g>
  );
}

function segmentLayout(items, totalWidth, gap = SEGMENT_GAP) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const available = totalWidth - gap * (items.length - 1);
  let cursor = 0;
  return items.map((item) => {
    const width = Math.max(8, available * (item.value / total));
    const segment = { item, x: cursor, width };
    cursor += width + gap;
    return segment;
  });
}

function funnelPath(cx, topY, height, topW, throatW, invert = false) {
  const y0 = topY;
  const y1 = topY + height;
  const wide = topW / 2;
  const narrow = throatW / 2;
  const topLeft = invert ? cx - narrow : cx - wide;
  const topRight = invert ? cx + narrow : cx + wide;
  const bottomLeft = invert ? cx - wide : cx - narrow;
  const bottomRight = invert ? cx + wide : cx + narrow;
  const dy = y1 - y0;
  const c1y = y0 + dy * 0.42;
  const c2y = y0 + dy * 0.78;

  return [
    `M ${topLeft} ${y0}`,
    `C ${topLeft} ${c1y}, ${bottomLeft} ${c2y}, ${bottomLeft} ${y1}`,
    `L ${bottomRight} ${y1}`,
    `C ${bottomRight} ${c2y}, ${topRight} ${c1y}, ${topRight} ${y0}`,
    'Z',
  ].join(' ');
}

function flowSegmentPath(top, throat, y0, y1) {
  const dy = y1 - y0;
  const c1y = y0 + dy * 0.42;
  const c2y = y0 + dy * 0.78;

  return [
    `M ${top.x} ${y0}`,
    `C ${top.x} ${c1y}, ${throat.x} ${c2y}, ${throat.x} ${y1}`,
    `L ${throat.x + throat.w} ${y1}`,
    `C ${throat.x + throat.w} ${c2y}, ${top.x + top.w} ${c1y}, ${top.x + top.w} ${y0}`,
    'Z',
  ].join(' ');
}

function segmentedFlow(cx, topY, height, topW, throatW, items, invert = false) {
  const wideLeft = cx - topW / 2;
  const throatLeft = cx - throatW / 2;
  const wideSegments = segmentLayout(items, topW);
  const throatSegments = segmentLayout(items, throatW, THROAT_GAP);

  return wideSegments.map((segment, index) => {
    const wide = { x: wideLeft + segment.x, w: segment.width };
    const throatSegment = throatSegments[index];
    const throat = { x: throatLeft + throatSegment.x, w: throatSegment.width };
    return {
      item: segment.item,
      x: wide.x + wide.w / 2,
      w: wide.w,
      d: invert
        ? flowSegmentPath(throat, wide, topY, topY + height)
        : flowSegmentPath(wide, throat, topY, topY + height),
    };
  });
}

function FlowSegmentLabels({ segments, y, lang, anchor = 'top', total, forceAll = false }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (!forceAll && segment.w < LABEL_MIN_W) return null;
        const lines = wrapLabel(localizedLabel(segment.item, lang), 12);
        const valueY = anchor === 'top' ? y + lines.length * 13 + 10 : y;
        const firstLineY = anchor === 'top' ? y : y + 20;
        const fontSize = segment.w < LABEL_MIN_W ? 10 : 12;
        const pctSize = segment.w < LABEL_MIN_W ? 12 : 15;
        const labelX = segment.x + (segment.item.dx ?? 0);
        return (
          <g key={`${anchor}-${localizedLabel(segment.item, lang)}-${index}`}>
            {lines.map((line, lineIndex) => (
              <text
                key={line}
                x={labelX}
                y={firstLineY + lineIndex * 13}
                fill={TEXT}
                fontSize={fontSize}
                fontWeight="900"
                textAnchor="middle"
              >
                {line}
              </text>
            ))}
            <text
              x={labelX}
              y={valueY}
              fill="#ffffff"
              fontSize={pctSize}
              fontWeight="950"
              textAnchor="middle"
            >
              {formatPercent(segment.item.value, total)}
            </text>
          </g>
        );
      })}
    </>
  );
}

function LargeChokepointChart({ item, lang, ui }) {
  const topHeight = FLOW_THROAT_Y - FLOW_TOP_Y;
  const bottomHeight = FLOW_BOTTOM_END_Y - FLOW_BOTTOM_Y;
  const originTotal = item.origin.reduce((sum, entry) => sum + entry.value, 0);
  const destinationTotal = item.destination.reduce((sum, entry) => sum + entry.value, 0);
  const originSegments = segmentedFlow(FLOW_CX, FLOW_TOP_Y, topHeight, FLOW_W, FLOW_THROAT_W, item.origin);
  const destinationSegments = segmentedFlow(FLOW_CX, FLOW_BOTTOM_Y, bottomHeight, FLOW_W, FLOW_THROAT_W, item.destination, true);

  return (
    <g>
      <FlowSegmentLabels segments={originSegments} y={FLOW_TOP_Y - 38} lang={lang} anchor="top" total={originTotal} forceAll />
      {originSegments.map((segment, index) => (
        <path
          key={`${localizedLabel(segment.item, lang)}-origin-large-${index}`}
          d={segment.d}
          fill="url(#topGradient)"
          stroke="rgba(5, 5, 5, 0.8)"
          strokeWidth="2"
        />
      ))}

      <rect x={FLOW_CX - FLOW_THROAT_W / 2 - 12} y={FLOW_THROAT_Y - 10} width={FLOW_THROAT_W + 24} height="22" rx="11" fill={BG} />
      <text x={FLOW_CX} y={FLOW_THROAT_Y + 6} fill="#ffffff" fontSize="16" fontWeight="950" textAnchor="middle">
        {item.isTotal ? ui.totalCenterLabel : localizedLabel(item, lang)}
      </text>

      {destinationSegments.map((segment, index) => (
        <path
          key={`${localizedLabel(segment.item, lang)}-destination-large-${index}`}
          d={segment.d}
          fill="url(#bottomGradient)"
          stroke="rgba(5, 5, 5, 0.8)"
          strokeWidth="2"
        />
      ))}
      <FlowSegmentLabels segments={destinationSegments} y={FLOW_BOTTOM_END_Y + 22} lang={lang} anchor="bottom" total={destinationTotal} forceAll />
      <text x={FLOW_CX} y="34" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="800">{localizedHeader(item, 'origin', ui)}</text>
      <text x={FLOW_CX} y="852" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="800">{localizedHeader(item, 'destination', ui)}</text>
    </g>
  );
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
      link.download = 'world-oil-transit-chokepoints-1h25.png';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const svgRef = useRef(null);
  const ui = UI[lang];
  const selectedChokepoint = CHOKEPOINTS[selectedIndex];

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
              <div className="lang-buttons">
                <button type="button" className="lang-btn" onClick={() => downloadSvgAsPng(svgRef.current)}>{ui.downloadPng}</button>
                <button type="button" className={`lang-btn ${lang === 'es' ? 'lang-btn-active' : ''}`} onClick={() => setLang('es')}>ES</button>
                <button type="button" className={`lang-btn ${lang === 'en' ? 'lang-btn-active' : ''}`} onClick={() => setLang('en')}>EN</button>
              </div>
              <img src={`${import.meta.env.BASE_URL}logo_clean.png`} alt="SB" className="brand-logo" />
            </div>
          </div>
          <div className="brand-row">
            <a className="lang-btn link-btn" href={macroPlotsUrl} target="_blank" rel="noreferrer">{ui.homeLabel}</a>
            <a className="lang-btn link-btn" href={historicalUrl}>{ui.historicalLabel}</a>
            <a className="lang-btn link-btn" href={rallyUrl}>{ui.rallyLabel}</a>
            <a className="lang-btn link-btn" href={momentumUrl}>{ui.momentumLabel}</a>
            <label className="select-wrap">
              <select value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.target.value))}>
                {CHOKEPOINTS.map((item, index) => (
                  <option key={item.label.en} value={index}>
                    {localizedLabel(item, lang)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="frame">
          <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart" role="img" aria-label={ui.heading}>
            <defs>
              <linearGradient id="topGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={GREEN} stopOpacity="0.98" />
                <stop offset="100%" stopColor={GREEN} stopOpacity="0.72" />
              </linearGradient>
              <linearGradient id="bottomGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={RED} stopOpacity="0.82" />
                <stop offset="100%" stopColor={RED} stopOpacity="0.98" />
              </linearGradient>
            </defs>
            <rect width={WIDTH} height={HEIGHT} fill={BG} />
            <g transform={`translate(${FLOW_CX} 0) scale(0.8) translate(${-FLOW_CX} 0)`}>
              <LargeChokepointChart item={selectedChokepoint} lang={lang} ui={ui} />
            </g>
          </svg>
          <div className="footer-note"><em>{ui.noteLabel} {ui.noteText}</em></div>
          <div className="footer-source">
            <em>{ui.sourceLabel} </em>
            <a href={EIA_DOC_URL} target="_blank" rel="noreferrer">{ui.sourceText}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
