import { useEffect, useMemo, useRef, useState } from "react";

const UI = {
  en: {
    heading: "WTI: Prices and Momentum at Historically Elevated Levels",
    subtitle: "Monthly WTI prices. Bottom panel: 12-month rate of change (ROC, %).",
    downloadCsv: "Download CSV",
    downloadPng: "Download PNG",
    reloadLabel: "Reload",
    noteLabel: "Note:",
    topNoteText: "Monthly WTI prices (green: close > open; red: close < open). The current month uses the latest available data point (Yahoo Finance, CL=F). The bottom panel shows 12-month ROC:",
    bottomNoteText: "",
    formulaText: "(p",
    formulaTailText: " - p",
    formulaMidText: ") / p",
    formulaEndText: "where p is the monthly closing price.",
    sourceLabel: "Source:",
    sourceText: "FRED DCOILWTICO; Yahoo Finance CL=F; Ted @TedPillows, @marketmike.",
    homeLabel: "Open Macro Plots",
    historicalLabel: "Historical Oil Prices",
    rallyLabel: "Rally 2026",
  },
  es: {
    heading: "WTI: precios y momentum en niveles históricamente elevados",
    subtitle: "Precios mensuales del WTI. Panel inferior: tasa de variación a 12 meses (ROC, %).",
    downloadCsv: "Descargar CSV",
    downloadPng: "Descargar PNG",
    reloadLabel: "Recargar",
    noteLabel: "Nota:",
    topNoteText: "Precios mensuales del WTI (verde: cierre > apertura; rojo: cierre < apertura). El mes en curso usa el ultimo dato disponible (Yahoo Finance, CL=F). El panel inferior muestra el ROC a 12 meses:",
    bottomNoteText: "",
    formulaText: "(p",
    formulaTailText: " - p",
    formulaMidText: ") / p",
    formulaEndText: "donde p es el precio de cierre mensual.",
    sourceLabel: "Fuente:",
    sourceText: "FRED DCOILWTICO; Yahoo Finance CL=F; Ted @TedPillows, @marketmike.",
    homeLabel: "Abrir Macro Plots",
    historicalLabel: "Historia del precio del petróleo",
    rallyLabel: "Rally 2026",
  },
};

const WIDTH = 1380;
const HEIGHT = 760;
const PRICE_PANEL_TOP = 8;
const PRICE_PANEL_HEIGHT = 470;
const ROC_PANEL_TOP = 570;
const ROC_PANEL_HEIGHT = 140;
const LEFT = 56;
const RIGHT = 46;
const INNER_WIDTH = WIDTH - LEFT - RIGHT;
const DOMAIN_END = "2029-01-01";
const EVENT_LAYOUTS = {
  "1987 Crash": { labelDx: -4, anchor: "end", searchStart: "1986-01-01", searchEnd: "1988-12-01" },
  "1990 Crash": { labelDx: -8, anchor: "end", searchStart: "1989-06-01", searchEnd: "1991-06-01" },
  "DOT COM": { labelDx: 0, anchor: "middle", searchStart: "1999-01-01", searchEnd: "2001-03-01" },
  "Financial Crisis": { labelDx: 0, anchor: "middle", searchStart: "2007-06-01", searchEnd: "2009-06-01" },
  "2022 Bear Market\nInflation / War / Rates": { labelDx: -72, anchor: "end", searchStart: "2021-01-01", searchEnd: "2023-06-01", arrowDx: -4, arrowDy: 14, horizontalArrow: true, rightArrowHead: true, lineStartDx: 10, labelDy: -12 },
};

function monthDistance(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

function yearTickDates(startDate, endDate) {
  const dates = [];
  const startYear = Number(startDate.slice(0, 4));
  const endYear = Number(endDate.slice(0, 4));
  for (let year = startYear; year <= endYear; year += 1) {
    dates.push(`${year}-01-01`);
  }
  return dates;
}

function formatDate(date, lang) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(lang === "es" ? "es-CL" : "en-US", {
    year: "numeric",
    month: "short",
  });
}

function downloadCsv(rows) {
  const out = [
    ["date", "open", "high", "low", "close", "roc12"],
    ...rows.map((row) => [row.date, row.open, row.high, row.low, row.close, row.roc12 ?? ""]),
  ];
  const csv = out
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "wti-roc12.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function drawWrappedCanvasText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return lines.length * lineHeight;
}

function inlineExportStyles(svgNode) {
  const apply = (selector, styles) => {
    svgNode.querySelectorAll(selector).forEach((node) => {
      Object.entries(styles).forEach(([key, value]) => {
        node.style.setProperty(key, value);
      });
    });
  };

  apply(".axis-label", {
    fill: "rgba(242,242,242,0.9)",
    "font-size": "17px",
    "font-weight": "600",
    "font-family": "Arial, Helvetica, sans-serif",
  });
  apply(".x-axis-year", {
    fill: "rgba(242,242,242,0.9)",
    "font-size": "17px",
    "font-weight": "600",
    "font-family": "Arial, Helvetica, sans-serif",
  });
  apply(".event-label", {
    fill: "#385dff",
    "font-size": "14px",
    "font-weight": "700",
    "font-family": "Arial, Helvetica, sans-serif",
  });
  apply(".event-highlight", {
    fill: "#f8fafc",
    "font-size": "14px",
    "font-weight": "700",
    "font-family": "Arial, Helvetica, sans-serif",
  });
  apply(".tooltip-title", {
    fill: "#f2f2f2",
    "font-size": "14px",
    "font-weight": "700",
    "font-family": "Arial, Helvetica, sans-serif",
  });
  apply(".tooltip-body", {
    fill: "rgba(244,247,251,0.92)",
    "font-size": "12px",
    "font-family": "Arial, Helvetica, sans-serif",
  });
}

function downloadPanelPng(svgNode, ui) {
  if (!svgNode) return;
  const clone = svgNode.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  inlineExportStyles(clone);
  const serialized = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.onload = () => {
    const exportWidth = WIDTH;
    const headerHeight = 92;
    const footerHeight = 118;
    const canvas = document.createElement("canvas");
    canvas.width = exportWidth * 2;
    canvas.height = (headerHeight + HEIGHT + footerHeight) * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, exportWidth, headerHeight + HEIGHT + footerHeight);

    ctx.fillStyle = "#ffd166";
    ctx.font = "700 30px Arial";
    ctx.fillText(ui.heading, 28, 42);

    ctx.fillStyle = "rgba(220, 220, 220, 0.62)";
    ctx.font = "12px Arial";
    drawWrappedCanvasText(ctx, ui.subtitle, 28, 66, exportWidth - 56, 16);

    ctx.drawImage(image, 0, headerHeight, exportWidth, HEIGHT);

    ctx.fillStyle = "rgba(220, 220, 220, 0.82)";
    ctx.font = "italic 14px Arial";
    const noteText = `${ui.noteLabel} ${ui.topNoteText} ${ui.bottomNoteText}${ui.formulaText}`;
    drawWrappedCanvasText(ctx, noteText, 16, headerHeight + HEIGHT + 20, exportWidth - 32, 18);
    drawWrappedCanvasText(ctx, `${ui.sourceLabel} ${ui.sourceText}`, 16, headerHeight + HEIGHT + 72, exportWidth - 32, 18);

    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "wti-roc12.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pngUrl);
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  image.src = url;
}

function yScale(value, min, max, top, height) {
  return top + (1 - (value - min) / (max - min || 1)) * height;
}

function linePath(points) {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
}

function InlineFormula({ ui }) {
  return (
    <>
      <span className="formula-inline">
        <span> {ui.formulaText}</span>
        <sub>t</sub>
        <span>{ui.formulaTailText}</span>
        <sub>t-12</sub>
        <span>{ui.formulaMidText}</span>
        <sub>t-12</sub>
        <span> * 100</span>
      </span>
      <span>, {ui.formulaEndText}</span>
    </>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [lang, setLang] = useState("es");
  const [error, setError] = useState(null);
  const [hover, setHover] = useState(null);
  const [chartKey, setChartKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const [highlightReady, setHighlightReady] = useState(false);
  const svgRef = useRef(null);
  const baseUrl = import.meta.env.BASE_URL;
  const historicalUrl = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:5174/"
    : (baseUrl.endsWith("/ROC(12)/") ? baseUrl.replace(/\/ROC\(12\)\/$/, "/historical-real-oil-price/") : "/historical-real-oil-price/");
  const rallyUrl = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:5175/"
    : (baseUrl.endsWith("/ROC(12)/") ? baseUrl.replace(/\/ROC\(12\)\/$/, "/rally-oil-price/") : "/rally-oil-price/");
  const macroPlotsUrl = "https://sebabecerra.github.io/macro-plots/";

  useEffect(() => {
    fetch(`${baseUrl}data/wti-roc12.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [baseUrl]);

  useEffect(() => {
    if (!data) return undefined;

    let frame = 0;
    const start = performance.now();
    const duration = 2200;

    const tick = (now) => {
      const next = Math.min((now - start) / duration, 1);
      setProgress(next);
      if (next < 1) frame = requestAnimationFrame(tick);
    };

    setProgress(0);
    setHighlightReady(false);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [data, chartKey]);

  useEffect(() => {
    if (progress < 1) return undefined;
    const timeout = window.setTimeout(() => setHighlightReady(true), 450);
    return () => window.clearTimeout(timeout);
  }, [progress]);

  const ui = UI[lang];

  const chart = useMemo(() => {
    if (!data) return null;
    const candles = data.candles;
    const positiveLows = candles.map((d) => d.low).filter((value) => value > 0);
    const rawPriceMin = Math.min(...positiveLows);
    const rawPriceMax = Math.max(...candles.map((d) => d.high));
    const priceMin = Math.floor((rawPriceMin - 5) / 5) * 5;
    const priceMax = Math.ceil((rawPriceMax + 5) / 5) * 5;
    const rocVals = candles.map((d) => d.roc12).filter((v) => v != null);
    const rocMin = Math.min(-60, ...rocVals);
    const rocMax = Math.max(220, ...rocVals);
    const priceTicks = [];
    for (let tick = priceMin; tick <= priceMax; tick += 20) priceTicks.push(tick);
    const domainStart = candles[0].date;
    const domainEnd = DOMAIN_END;
    const totalMonths = monthDistance(domainStart, domainEnd);
    const xForDate = (date) => LEFT + (monthDistance(domainStart, date) / (totalMonths || 1)) * INNER_WIDTH;
    const yearTicks = yearTickDates(domainStart, domainEnd);
    return { candles, priceMin, priceMax, priceTicks, rocMin, rocMax, xForDate, yearTicks, domainStart, domainEnd };
  }, [data]);

  if (error) return <main className="page"><div className="status">Error: {error}</div></main>;
  if (!chart) return <main className="page"><div className="status">Loading…</div></main>;

  const visibleCount = Math.max(1, Math.ceil(chart.candles.length * progress));
  const visibleCandles = chart.candles.slice(0, visibleCount);
  const tickYears = chart.yearTicks.map((date) => ({ date }));
  const rocPoints = visibleCandles
    .filter((d) => d.roc12 != null)
    .map((d) => {
      return [chart.xForDate(d.date), yScale(d.roc12, chart.rocMin, chart.rocMax, ROC_PANEL_TOP, ROC_PANEL_HEIGHT)];
    });

  const eventAnchors = data.events.reduce((acc, event) => {
    if (event.variant === "highlight") return acc;
    const layout = EVENT_LAYOUTS[event.label] ?? {};
    const candidates = chart.candles.filter((row) => row.roc12 != null && (!layout.searchStart || row.date >= layout.searchStart) && (!layout.searchEnd || row.date <= layout.searchEnd));
    const target = candidates.length ? candidates.reduce((best, row) => (row.roc12 > best.roc12 ? row : best)) : chart.candles.find((row) => row.date === event.date);
    if (target) acc[event.label] = target.date;
    return acc;
  }, {});

  const late2022Candidates = chart.candles.filter((row) => row.roc12 != null && row.date >= "2021-08-01" && row.date <= "2022-06-01");
  const late2022Marker = late2022Candidates.length ? late2022Candidates.reduce((best, row) => (row.roc12 > best.roc12 ? row : best)) : null;

  const latestRoc = [...visibleCandles].reverse().find((row) => row.roc12 != null);
  const latestRocY = latestRoc ? yScale(latestRoc.roc12, chart.rocMin, chart.rocMax, ROC_PANEL_TOP, ROC_PANEL_HEIGHT) : null;
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
              <button type="button" className="lang-btn" onClick={() => downloadPanelPng(svgRef.current, ui)}>{ui.downloadPng}</button>
              <button type="button" className="lang-btn" onClick={() => downloadCsv(chart.candles)}>{ui.downloadCsv}</button>
              <button type="button" className={`lang-btn ${lang === "es" ? "lang-btn-active" : ""}`} onClick={() => setLang("es")}>ES</button>
              <button type="button" className={`lang-btn ${lang === "en" ? "lang-btn-active" : ""}`} onClick={() => setLang("en")}>EN</button>
            </div>
          </div>
          <div className="brand-row">
            <a className="lang-btn link-btn" href={macroPlotsUrl} target="_blank" rel="noreferrer">{ui.homeLabel}</a>
            <a className="lang-btn link-btn" href={historicalUrl}>{ui.historicalLabel}</a>
            <a className="lang-btn link-btn" href={rallyUrl}>{ui.rallyLabel}</a>
            <img src={`${baseUrl}logo_clean.png`} alt="SB" className="brand-logo" />
          </div>
        </div>

        <div className="frame">
          <svg key={chartKey} ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart" role="img" aria-label={ui.heading}>
            <rect width={WIDTH} height={HEIGHT} fill="#050505" />

            <g>
              {chart.priceTicks.map((tick) => {
                const y = yScale(tick, chart.priceMin, chart.priceMax, PRICE_PANEL_TOP, PRICE_PANEL_HEIGHT);
                return (
                  <g key={`p-${tick}`}>
                    <text x={WIDTH - 8} y={y + 4} textAnchor="end" className="axis-label">{tick}</text>
                  </g>
                );
              })}
              {[-50, 0, 50, 100, 150, 200].map((tick) => {
                const y = yScale(tick, chart.rocMin, chart.rocMax, ROC_PANEL_TOP, ROC_PANEL_HEIGHT);
                return (
                  <g key={`r-${tick}`}>
                    <text x={WIDTH - 8} y={y + 4} textAnchor="end" className="axis-label">{tick}</text>
                  </g>
                );
              })}
              {latestRocY != null ? <line x1={LEFT} y1={latestRocY} x2={WIDTH - RIGHT} y2={latestRocY} stroke="rgba(180,180,180,0.8)" strokeWidth="1" /> : null}
            </g>

            {visibleCandles.map((candle) => {
              const x = chart.xForDate(candle.date);
              const openY = yScale(candle.open, chart.priceMin, chart.priceMax, PRICE_PANEL_TOP, PRICE_PANEL_HEIGHT);
              const closeY = yScale(candle.close, chart.priceMin, chart.priceMax, PRICE_PANEL_TOP, PRICE_PANEL_HEIGHT);
              const highY = yScale(candle.high, chart.priceMin, chart.priceMax, PRICE_PANEL_TOP, PRICE_PANEL_HEIGHT);
              const lowY = yScale(candle.low, chart.priceMin, chart.priceMax, PRICE_PANEL_TOP, PRICE_PANEL_HEIGHT);
              const up = candle.close >= candle.open;
              const color = up ? "#0ea34a" : "#c81e1e";
              return (
                <g key={candle.date} onMouseMove={() => setHover({ type: "candle", candle, x, y: Math.min(openY, closeY) })} onMouseLeave={() => setHover(null)}>
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.1" />
                  <rect x={x - 2.2} y={Math.min(openY, closeY)} width={4.4} height={Math.max(1.2, Math.abs(closeY - openY))} fill={color} />
                </g>
              );
            })}

            {visibleCandles.filter((d) => d.roc12 != null).map((d) => {
              const x = chart.xForDate(d.date);
              const y = yScale(d.roc12, chart.rocMin, chart.rocMax, ROC_PANEL_TOP, ROC_PANEL_HEIGHT);
              return <rect key={`roc-${d.date}`} x={x - 3} y={ROC_PANEL_TOP} width={6} height={ROC_PANEL_HEIGHT} fill="transparent" onMouseMove={() => setHover({ type: "roc", candle: d, x, y })} onMouseLeave={() => setHover(null)} />;
            })}

            {highlightReady ? data.events.filter((event) => event.variant === "highlight").map((event) => {
              const boxX = chart.xForDate(event.date);
              const boxWidth = WIDTH - RIGHT - boxX;
              const highlightLines = event.label.split("\n");
              const latestVisibleCandle = visibleCandles.at(-1);
              const latestHighlightX = latestVisibleCandle ? chart.xForDate(latestVisibleCandle.date) : null;
              const latestHighlightY = latestVisibleCandle ? yScale(latestVisibleCandle.roc12 ?? 0, chart.rocMin, chart.rocMax, ROC_PANEL_TOP, ROC_PANEL_HEIGHT) : null;
              const textX = boxX + 24;
              const textY = ROC_PANEL_TOP + 16;
              const textLineHeight = 18;
              const arrowStartX = textX - 6;
              const arrowStartY = textY + textLineHeight - 6;
              const arrowEndX = latestHighlightX != null ? latestHighlightX : null;
              const arrowEndY = latestHighlightY != null ? latestHighlightY - 10 : null;
              return (
                <g key={event.label} pointerEvents="none">
                  <rect x={boxX} y={ROC_PANEL_TOP - 4} width={boxWidth} height={ROC_PANEL_HEIGHT - 10} fill="rgba(255,96,80,0.16)" />
                  <text x={textX} y={textY} className="event-highlight">
                    {highlightLines.map((line, index) => (
                      <tspan key={`${event.label}-${index}`} x={textX} dy={index === 0 ? 0 : textLineHeight}>{line}</tspan>
                    ))}
                  </text>
                  {arrowEndX != null && arrowEndY != null ? (
                    <>
                      <path d={`M ${arrowStartX} ${arrowStartY} L ${arrowEndX} ${arrowEndY}`} stroke="#3a66ff" strokeWidth="3.6" />
                      <path d={`M ${arrowEndX - 6} ${arrowEndY - 6} L ${arrowEndX + 6} ${arrowEndY - 6} L ${arrowEndX} ${arrowEndY + 4} Z`} fill="#3a66ff" />
                    </>
                  ) : null}
                </g>
              );
            }) : null}

            <path d={linePath(rocPoints)} fill="none" stroke="#ffd166" strokeWidth="2.2" />

            {data.events.filter((event) => event.variant !== "highlight").map((event) => {
              if (progress < 0.92) return null;
              const anchorDate = eventAnchors[event.label] ?? event.date;
              const idx = chart.candles.findIndex((row) => row.date === anchorDate);
              if (idx < 0) return null;
              const x = chart.xForDate(anchorDate);
              const y = yScale(chart.candles[idx].roc12 ?? 0, chart.rocMin, chart.rocMax, ROC_PANEL_TOP, ROC_PANEL_HEIGHT);
              const layout = EVENT_LAYOUTS[event.label] ?? { labelDx: 0, anchor: "middle" };
              const lines = event.label.split("\n");
              const labelX = x + layout.labelDx;
              const arrowX = x + (layout.arrowDx ?? 0);
              const arrowY = y + (layout.arrowDy ?? 0);
              const lineY = arrowY - 12;
              const isHorizontalArrow = layout.horizontalArrow === true;
              const isRightArrowHead = layout.rightArrowHead === true;
              const lineStartX = labelX + (layout.lineStartDx ?? 0);
              const labelY = ROC_PANEL_TOP + 18 + (layout.labelDy ?? 0);
              return (
                <g key={event.label}>
                  <text x={labelX} y={labelY} textAnchor={layout.anchor} className="event-label">
                    {lines.map((line, lineIdx) => (
                      <tspan key={lineIdx} x={labelX} dy={lineIdx === 0 ? 0 : 16}>{line}</tspan>
                    ))}
                  </text>
                  <path d={isHorizontalArrow
                    ? `M ${lineStartX} ${lineY} L ${arrowX} ${lineY}`
                    : `M ${labelX} ${ROC_PANEL_TOP + 24 + (lines.length - 1) * 16} L ${arrowX} ${arrowY - 12}`}
                    stroke="#3a66ff"
                    strokeWidth="3.6"
                  />
                  <path d={isRightArrowHead
                    ? `M ${arrowX - 10} ${arrowY - 18} L ${arrowX - 10} ${arrowY - 6} L ${arrowX} ${arrowY - 12} Z`
                    : `M ${arrowX - 6} ${arrowY - 12} L ${arrowX + 6} ${arrowY - 12} L ${arrowX} ${arrowY - 2} Z`}
                    fill="#3a66ff"
                  />
                </g>
              );
            })}
            {highlightReady && late2022Marker ? (() => {
              const markerX = chart.xForDate(late2022Marker.date);
              return <path d={`M ${markerX - 6} ${ROC_PANEL_TOP + 18} L ${markerX + 6} ${ROC_PANEL_TOP + 18} L ${markerX} ${ROC_PANEL_TOP + 30} Z`} fill="#3a66ff" />;
            })() : null}

            {tickYears.map((entry) => {
              const x = chart.xForDate(entry.date);
              return <text key={`x-${entry.date}`} x={x} y={ROC_PANEL_TOP - 10} textAnchor="middle" className="x-axis-year">{entry.date.slice(2, 4)}</text>;
            })}

            {hover ? (
              <g transform={`translate(${Math.min(WIDTH - 220, hover.x + 12)}, ${Math.max(22, hover.y - 56)})`}>
                <rect width="196" height={hover.type === "candle" ? "108" : "56"} rx="8" fill="rgba(8,8,8,0.96)" stroke="rgba(255,209,102,0.26)" />
                <text x="12" y="20" className="tooltip-title">{formatDate(hover.candle.date, lang)}</text>
                {hover.type === "candle" ? (
                  (() => {
                    const candleColor = hover.candle.close >= hover.candle.open ? "#0ea34a" : "#c81e1e";
                    return (
                      <>
                        <text x="12" y="40" className="tooltip-body" style={{ fill: candleColor }}>Open {hover.candle.open.toFixed(2)}</text>
                        <text x="12" y="58" className="tooltip-body" style={{ fill: candleColor }}>High {hover.candle.high.toFixed(2)}</text>
                        <text x="12" y="76" className="tooltip-body" style={{ fill: candleColor }}>Low {hover.candle.low.toFixed(2)}</text>
                        <text x="12" y="94" className="tooltip-body" style={{ fill: candleColor }}>Close {hover.candle.close.toFixed(2)}</text>
                      </>
                    );
                  })()
                ) : (
                  <text x="12" y="40" className="tooltip-body">ROC(12): {hover.candle.roc12?.toFixed(2)}%</text>
                )}
              </g>
            ) : null}
          </svg>
          <p className="footer-note">
            <span className="footer-label">{ui.noteLabel}</span> {ui.topNoteText}
            {" "}{ui.bottomNoteText}
            <InlineFormula ui={ui} />
          </p>
          <p className="footer-source"><span className="footer-label">{ui.sourceLabel}</span> {ui.sourceText}</p>
          <div className="corner-actions">
            <button
              type="button"
              className="play-btn"
              aria-label={ui.reloadLabel}
              onClick={() => {
                setHover(null);
                setChartKey((value) => value + 1);
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
