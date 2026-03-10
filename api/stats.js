// api/stats.js — GitHub Stats Card (fixed layout)
import { fetchUserStats } from "../lib/github.js";
import { getTheme, parseParams, cardWrapper, titleText, errorCard, escapeXml } from "../lib/theme.js";

function renderMiniGraph(weeks, t, x, y) {
  const days = weeks.flatMap((wk) => wk.contributionDays).slice(-63);
  const max = Math.max(...days.map((d) => d.contributionCount), 1);
  const COLS = 9, ROWS = 7, CELL = 8, GAP = 2;

  let cells = "";
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const day = days[col * 7 + row];
      if (!day) continue;
      const intensity = day.contributionCount / max;
      const opacity = intensity < 0.01 ? 0.08 : 0.15 + intensity * 0.85;
      cells += `<rect
        x="${x + col * (CELL + GAP)}"
        y="${y + row * (CELL + GAP)}"
        width="${CELL}" height="${CELL}" rx="2"
        fill="${t.accent}" opacity="${opacity.toFixed(2)}"
      />`;
    }
  }
  return cells;
}

export default async function handler(req, res) {
  const p = parseParams(req.query);
  const t = getTheme(p.theme);

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");

  try {
    const s = await fetchUserStats(p.username);
    const title = p.custom_title || `${s.name}'s GitHub Stats`;
    const width = p.width;

    // Layout constants
    const TITLE_H = 52;
    const GRAPH_W = 9 * (8 + 2) - 2;   // 88px
    const GRAPH_H = 7 * (8 + 2) - 2;   // 68px
    const GRAPH_X = width - 25 - GRAPH_W;
    const GRAPH_Y = TITLE_H - 8;

    const stats = [
      { label: "Total Commits",  value: s.commits.toLocaleString() },
      { label: "Pull Requests",  value: s.prs.toLocaleString() },
      { label: "Issues",         value: s.issues.toLocaleString() },
      { label: "Code Reviews",   value: s.reviews.toLocaleString() },
      { label: "Total Stars",    value: s.totalStars.toLocaleString() },
      { label: "Followers",      value: s.followers.toLocaleString() },
    ];

    // Stats live in the left portion, avoid the graph area
    const statAreaW = GRAPH_X - 25 - 10;
    const colW = Math.floor(statAreaW / 3);
    const ROW_H = 52;
    const STATS_Y = TITLE_H + 6;

    let statsSvg = "";
    stats.forEach((st, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 25 + col * colW;
      const y = STATS_Y + row * ROW_H;
      statsSvg += `
        <text x="${x}" y="${y + 12}" fill="${t.muted}" font-size="10" letter-spacing="0.6">${escapeXml(st.label.toUpperCase())}</text>
        <text x="${x}" y="${y + 34}" fill="${t.text}" font-size="22" font-weight="700" font-family="'DM Mono', monospace">${escapeXml(st.value)}</text>
      `;
    });

    const height = STATS_Y + 2 * ROW_H + 20;

    // Contribution graph sits right-aligned, vertically centered in card
    const graphCenterY = height / 2 - GRAPH_H / 2;
    const graph = s.contributionWeeks
      ? renderMiniGraph(s.contributionWeeks, t, GRAPH_X, graphCenterY)
      : "";

    const svg = cardWrapper({
      width, height, theme: t,
      border_radius: p.border_radius,
      hide_border: p.hide_border,
      children: `
        ${p.hide_title ? "" : titleText({ text: title, theme: t })}
        <text x="${width - 25}" y="35" fill="${t.muted}" font-size="10" text-anchor="end" letter-spacing="0.3">
          ${escapeXml(s.totalContributions.toLocaleString())} contributions this year
        </text>
        ${graph}
        ${statsSvg}
      `,
    });

    res.status(200).send(svg);
  } catch (err) {
    res.status(200).send(errorCard({ message: err.message, theme: p.theme, width: p.width }));
  }
}