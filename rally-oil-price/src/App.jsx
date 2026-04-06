import { useEffect, useRef, useState } from "react";
import LineByYearChart from "./LineByYearChart";

const ACCENT = "#ffd166";

const UI_TEXT = {
  en: {
    heading: "Oil 2026: the most aggressive rally in years",
    subtitle:
      "Brent Crude year-to-date price change for each year since 1987",
    noteLabel: "Note:",
    sourceLabel: "Source:",
    reloadLabel: "Reload",
    downloadLabel: "Download CSV",
    downloadPngLabel: "Download PNG",
    g1Label: "Historical Oil Prices",
    momentumLabel: "Momentum",
    homeLabel: "Open Macro Plots",
    playLabel: "Play",
    chartTitle: "",
    chartSubtitle:
      "Each grey line is a prior year. The gold line is the current year. Values are percentage change from the first trading day of each year.",
    dayAxis: "Trading day",
    pctAxis: "YTD change (%)",
    valueLabel: "Value",
    changeLabel: "YTD",
    asOfLabel: "As of",
    minLabel: "Min",
    maxLabel: "Max",
    loading: "Loading chart…",
    error: "Could not load data:",
  },
  es: {
    heading: "Petróleo 2026: el rally más agresivo en años",
    subtitle:
      "Cambio acumulado en el año del precio del Brent para cada año desde 1987",
    noteLabel: "Nota:",
    sourceLabel: "Fuente:",
    reloadLabel: "Recargar",
    downloadLabel: "Descargar CSV",
    downloadPngLabel: "Descargar PNG",
    g1Label: "Historia del precio del petróleo",
    momentumLabel: "Momentum",
    homeLabel: "Abrir Macro Plots",
    playLabel: "Reproducir",
    chartTitle: "",
    chartSubtitle:
      "Cada línea gris es un año previo. La línea dorada es el año actual. Los valores muestran el cambio porcentual desde el primer día de trading de cada año.",
    dayAxis: "Día de trading",
    pctAxis: "Cambio YTD (%)",
    valueLabel: "Valor",
    changeLabel: "YTD",
    asOfLabel: "Al",
    minLabel: "Minimo",
    maxLabel: "Maximo",
    loading: "Cargando gráfico…",
    error: "No se pudieron cargar los datos:",
  },
};

function downloadNormalizedCsv(series) {
  const rows = [
    ["year", "day", "date", "price", "change_pct"],
    ...series.flatMap((entry) =>
      entry.points.map((point) => [entry.year, point.day, point.date, point.price, point.changePct]),
    ),
  ];

  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "wti-ytd-one-line-per-year.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatPct(value) {
  if (value == null || Number.isNaN(value)) return "N/A";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatDate(date, locale) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(locale === "es" ? "es-CL" : "en-US", {
    year: locale === "es" ? "2-digit" : "numeric",
    month: "short",
    day: "numeric",
  });
}

function getHistoricalExtremes(series, currentYear) {
  const priorYears = series.filter((entry) => entry.year !== currentYear);
  const changes = priorYears.flatMap((entry) => entry.points.map((point) => point.changePct));
  return {
    min: changes.length ? Math.min(...changes) : null,
    max: changes.length ? Math.max(...changes) : null,
  };
}

function yearPathStyle(isCurrent) {
  return {
    fill: "none",
    stroke: isCurrent ? ACCENT : GREY,
    strokeWidth: isCurrent ? 3.25 : 1.1,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState("es");
  const [animationKey, setAnimationKey] = useState(0);
  const chartRef = useRef(null);
  const exportRef = useRef(null);
  const baseUrl = import.meta.env.BASE_URL;
  const dataUrl = `${baseUrl}data/oil-ytd-multiline.json`;
  const historicalUrl = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:4179/"
    : (baseUrl.endsWith("/rally-oil-price/") ? baseUrl.replace(/\/rally-oil-price\/$/, "/historical-real-oil-price/") : "/historical-real-oil-price/");
  const momentumUrl = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:4217/oil-price/ROC(12)/"
    : (baseUrl.endsWith("/rally-oil-price/") ? baseUrl.replace(/\/rally-oil-price\/$/, "/ROC(12)/") : "/ROC(12)/");
  const macroPlotsUrl = "https://sebabecerra.github.io/macro-plots/";

  useEffect(() => {
    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [dataUrl]);

  const ui = UI_TEXT[lang];

  if (error) {
    return <main className="page"><div className="status">{ui.error} {error}</div></main>;
  }

  if (!data) {
    return <main className="page"><div className="status">{ui.loading}</div></main>;
  }

  const currentSeries = data.series.find((entry) => entry.year === data.summary.currentYear) ?? data.series.at(-1);
  const currentPoint = currentSeries?.points.at(-1);
  const extremes = getHistoricalExtremes(data.series, data.summary.currentYear);
  const locale = lang === "es" ? "es" : "en";
  const downloadPanelPng = () => {
    const chartUrl = chartRef.current?.getPngDataUrl();
    const exportNode = exportRef.current;
    if (!chartUrl || !exportNode) return;
    const image = new Image();

    image.onload = () => {
      const exportWidth = Math.round(exportNode.getBoundingClientRect().width) || 1580;
      const headerHeight = 156;
      const chartHeight = 760;
      const footerHeight = 34;
      const canvas = document.createElement("canvas");
      canvas.width = exportWidth * 2;
      canvas.height = (headerHeight + chartHeight + footerHeight) * 2;
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      context.scale(2, 2);
      context.fillStyle = "#050505";
      context.fillRect(0, 0, exportWidth, headerHeight + chartHeight + footerHeight);

      context.fillStyle = "#ffd166";
      context.font = "700 30px Arial";
      context.fillText(ui.heading, 28, 42);

      context.fillStyle = "rgba(220, 220, 220, 0.62)";
      context.font = "12px Arial";
      context.fillText(ui.subtitle, 28, 66);

      context.fillStyle = "rgba(242, 242, 242, 0.92)";
      context.font = "14px Arial";
      context.fillText(`${data.summary.currentYear} YTD ${formatPct(data.summary.currentChangePct)}`, 14, 110);
      if (currentPoint) {
        context.fillText(`${ui.asOfLabel} ${formatDate(currentPoint.date, locale)}`, 210, 110);
      }
      context.fillStyle = "rgba(220, 220, 220, 0.82)";
      context.fillText(`${ui.minLabel} ${formatPct(extremes.min)}`, 14, 132);
      context.fillText(`${ui.maxLabel} ${formatPct(extremes.max)}`, 170, 132);

      context.drawImage(image, 0, headerHeight, exportWidth, chartHeight);

      context.font = "italic 14px Arial";
      context.fillText(`${ui.noteLabel} ${ui.chartSubtitle}`, 14, headerHeight + chartHeight - 18);
      context.fillText(`${ui.sourceLabel} ${data.source}`, 14, headerHeight + chartHeight + 8);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          return;
        }
        const pngUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = "rally-oil-price.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };

    image.src = chartUrl;
  };

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
              <button type="button" className="lang-btn" onClick={downloadPanelPng}>
                {ui.downloadPngLabel}
              </button>
              <button type="button" className="lang-btn" onClick={() => downloadNormalizedCsv(data.series)}>
                {ui.downloadLabel}
              </button>
              <button type="button" className={`lang-btn ${lang === "es" ? "lang-btn-active" : ""}`} onClick={() => setLang("es")}>ES</button>
              <button type="button" className={`lang-btn ${lang === "en" ? "lang-btn-active" : ""}`} onClick={() => setLang("en")}>EN</button>
            </div>
          </div>
          <div className="brand-row">
            <a className="lang-btn link-btn" href={macroPlotsUrl} target="_blank" rel="noreferrer">{ui.homeLabel}</a>
            <a className="lang-btn link-btn" href={historicalUrl}>{ui.g1Label}</a>
            <a className="lang-btn link-btn" href={momentumUrl}>{ui.momentumLabel}</a>
            <img src={`${import.meta.env.BASE_URL}logo_clean.png`} alt="SB" className="brand-logo" />
          </div>
        </div>

        <div className="frame" ref={exportRef}>
          <div className="metrics-strip">
            <div className="metrics-top">
              <span>{data.summary.currentYear} YTD <strong className={data.summary.currentChangePct >= 0 ? "positive" : "negative"}>{formatPct(data.summary.currentChangePct)}</strong></span>
              <span>{currentPoint ? `${ui.asOfLabel} ${formatDate(currentPoint.date, locale)}` : ""}</span>
            </div>
            <div className="metrics-bottom">
              <span>{ui.minLabel} {formatPct(extremes.min)}</span>
              <span>{ui.maxLabel} {formatPct(extremes.max)}</span>
            </div>
          </div>
          {ui.chartTitle ? <div className="chart-title">{ui.chartTitle}</div> : null}
          <LineByYearChart
            ref={chartRef}
            key={animationKey}
            dataset={data}
            accent={ACCENT}
            animationKey={animationKey}
            labels={{
              dayAxis: ui.dayAxis,
              pctAxis: ui.pctAxis,
              valueLabel: ui.valueLabel,
              changeLabel: ui.changeLabel,
            }}
          />

          <div className="footer-note"><em>{ui.noteLabel} {ui.chartSubtitle}</em></div>
          <div className="footer-source"><em>{ui.sourceLabel} {data.source}</em></div>
          <div className="corner-actions">
            <button
              type="button"
              className="play-btn"
              aria-label={ui.playLabel}
              onClick={() => setAnimationKey((value) => value + 1)}
            >
              ▶
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
