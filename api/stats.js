// api/stats.js — GitHub Stats Card
import { fetchUserStats } from "../lib/github.js";
import { getTheme, parseParams, cardWrapper, titleText, statItem, errorCard, escapeXml } from "../lib/theme.js";

function renderMiniGraph(weeks, theme, x, y, w, h) {
  const t = theme;
  const days = weeks.flatMap((wk) => wk.contributionDays).slice(-63); // last 9 weeks
  const max = Math.max(...days.map((d) => d.contributionCount), 1);
  const cols = 9;
  const rows = 7;
  const cellSize = Math.floor(w / cols) - 1;

  let cells = "";
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const idx = col * 7 + row;
      const day = days[idx];
      if (!day) continue;
      const intensity = day.contributionCount / max;
      const opacity = intensity < 0.01 ? 0.08 : 0.15 + intensity * 0.85;
      cells += `<rect
        x="${x + col * (cellSize + 1)}"
        y="${y + row * (cellSize + 1)}"
        width="${cellSize}"
        height="${cellSize}"
        rx="1"
        fill="${t.accent}"
        opacity="${opacity.toFixed(2)}"
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
    const height = 200;

    const stats = [
      { label: "Total Commits", value: s.commits.toLocaleString() },
      { label: "Pull Requests", value: s.prs.toLocaleString() },
      { label: "Issues", value: s.issues.toLocaleString() },
      { label: "Code Reviews", value: s.reviews.toLocaleString() },
      { label: "Total Stars", value: s.totalStars.toLocaleString() },
      { label: "Followers", value: s.followers.toLocaleString() },
    ];

    const colW = Math.floor((width - 50) / 3);
    const rows = [
      stats.slice(0, 3),
      stats.slice(3, 6),
    ];

    let statsSvg = "";
    rows.forEach((row, ri) => {
      row.forEach((s2, ci) => {
        statsSvg += statItem({
          label: s2.label,
          value: s2.value,
          x: 25 + ci * colW,
          y: 72 + ri * 58,
          theme: t,
        });
      });
    });

    // Mini contribution graph
    const graphX = width - 130;
    const graphY = 18;
    const graph = s.contributionWeeks
      ? renderMiniGraph(s.contributionWeeks, t, graphX, graphY, 105, 56)
      : "";

    const svg = cardWrapper({
      width,
      height,
      theme: t,
      border_radius: p.border_radius,
      hide_border: p.hide_border,
      children: `
        ${p.hide_title ? "" : titleText({ text: title, theme: t })}
        <text x="${width - 25}" y="35" fill="${t.muted}" font-size="10" text-anchor="end" letter-spacing="0.5">
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
