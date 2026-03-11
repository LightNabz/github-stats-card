// api/langs.js — Top Languages Card (fixed layout)
import { fetchTopLanguages } from "../lib/github.js";
import { getTheme, parseParams, cardWrapper, titleText, errorCard, escapeXml } from "../lib/theme.js";

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

    const PADDING_LEFT = 25;
    const PADDING_RIGHT = 25;
    const TITLE_H = 52;
    const ROW_H = 30;
    const DOT_R = 5;
    const DOT_COL_W = 16;
    const PCT_COL_W = 48;
    const LABEL_COL_W = 110;
    const BAR_GAP = 10;

    const barAreaStart = PADDING_LEFT + DOT_COL_W + LABEL_COL_W + BAR_GAP;
    const barAreaEnd = width - PADDING_RIGHT - PCT_COL_W;
    const barWidth = barAreaEnd - barAreaStart;

    const height = TITLE_H + langs.length * ROW_H + 22;

    // Donut chart
    const DONUT_R = 22;
    const DONUT_CX = width - PADDING_RIGHT - DONUT_R;
    const DONUT_CY = 30;

    let donutSvg = "";
    let startAngle = -Math.PI / 2;
    langs.forEach((lang) => {
      const slice = (lang.percent / 100) * 2 * Math.PI;
      const endAngle = startAngle + slice;
      const x1 = DONUT_CX + DONUT_R * Math.cos(startAngle);
      const y1 = DONUT_CY + DONUT_R * Math.sin(startAngle);
      const x2 = DONUT_CX + DONUT_R * Math.cos(endAngle);
      const y2 = DONUT_CY + DONUT_R * Math.sin(endAngle);
      const largeArc = slice > Math.PI ? 1 : 0;
      const color = lang.color || t.accent;
      donutSvg += `<path d="M${DONUT_CX},${DONUT_CY} L${x1.toFixed(2)},${y1.toFixed(2)} A${DONUT_R},${DONUT_R} 0 ${largeArc},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z" fill="${escapeXml(color)}" />`;
      startAngle = endAngle;
    });
    donutSvg += `<circle cx="${DONUT_CX}" cy="${DONUT_CY}" r="${DONUT_R * 0.52}" fill="${t.bg}" />`;

    let rows = "";
    langs.forEach((lang, i) => {
      const rowY = TITLE_H + i * ROW_H;
      const midY = rowY + ROW_H / 2;
      const dotColor = lang.color || t.accent;
      const pct = lang.percent ?? 0;
      const fillW = Math.max(2, (barWidth * pct) / 100);
      const pctText = pct.toFixed(1) + "%";

      rows += `
        <circle cx="${PADDING_LEFT + DOT_R}" cy="${midY}" r="${DOT_R}" fill="${escapeXml(dotColor)}" />
        <text x="${PADDING_LEFT + DOT_COL_W}" y="${midY + 4}" fill="${t.text}" font-size="12" font-weight="500">${escapeXml(lang.name)}</text>
        <rect x="${barAreaStart}" y="${midY - 3}" width="${barWidth}" height="6" rx="3" fill="${t.bar}" />
        <rect x="${barAreaStart}" y="${midY - 3}" width="${fillW.toFixed(2)}" height="6" rx="3" fill="${escapeXml(dotColor)}" />
        <text x="${barAreaEnd + PCT_COL_W - 8}" y="${midY + 4}" fill="${t.muted}" font-size="11" text-anchor="end">${escapeXml(pctText)}</text>
      `;
    });

    const svg = cardWrapper({
      width,
      height,
      theme: t,
      border_radius: p.border_radius,
      hide_border: p.hide_border,
      children: `
        ${p.hide_title ? "" : titleText({ text: title, theme: t })}
        ${donutSvg}
        ${rows}
      `,
    });

    res.status(200).send(svg);
  } catch (err) {
    res.status(200).send(errorCard({ message: err.message, theme: p.theme, width: p.width }));
  }
}