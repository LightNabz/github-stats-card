// api/langs.js — Top Languages Card
import { fetchTopLanguages } from "../lib/github.js";
import { getTheme, parseParams, cardWrapper, titleText, progressBar, errorCard, escapeXml } from "../lib/theme.js";

export default async function handler(req, res) {
  const p = parseParams(req.query);
  const t = getTheme(p.theme);
  const count = Math.min(p.langs_count, 10);

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");

  try {
    const langs = await fetchTopLanguages(p.username, count);
    if (!langs.length) throw new Error("No language data found");

    const title = p.custom_title || "Top Languages";
    const width = p.width;
    const rowH = 28;
    const padTop = 60;
    const height = padTop + langs.length * rowH + 20;

    let bars = "";
    langs.forEach((lang, i) => {
      const dotColor = lang.color || t.accent;
      const pct = lang.percent.toFixed(1) + "%";
      bars += `
        <circle cx="25" cy="${padTop + i * rowH - 4}" r="5" fill="${escapeXml(dotColor)}" />
        ${progressBar({
          x: 38,
          y: padTop + i * rowH - 12,
          width: width - 10,
          percent: lang.percent,
          theme: t,
          label: lang.name,
          value: pct,
        })}
      `;
    });

    // Compact donut chart in top-right corner
    const cx = width - 52, cy = 32, r = 20;
    let donutSvg = "";
    let startAngle = -Math.PI / 2;
    langs.forEach((lang) => {
      const slice = (lang.percent / 100) * 2 * Math.PI;
      const endAngle = startAngle + slice;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = slice > Math.PI ? 1 : 0;
      const color = lang.color || t.accent;
      donutSvg += `<path d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${largeArc},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${escapeXml(color)}" />`;
      startAngle = endAngle;
    });
    // Inner circle to make it a donut
    donutSvg += `<circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="${t.bg}" />`;

    const svg = cardWrapper({
      width,
      height,
      theme: t,
      border_radius: p.border_radius,
      hide_border: p.hide_border,
      children: `
        ${p.hide_title ? "" : titleText({ text: title, theme: t })}
        ${donutSvg}
        ${bars}
      `,
    });

    res.status(200).send(svg);
  } catch (err) {
    res.status(200).send(errorCard({ message: err.message, theme: p.theme, width: p.width }));
  }
}
