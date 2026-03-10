// api/streak.js — Streak Stats Card
import { fetchStreakStats } from "../lib/github.js";
import { getTheme, parseParams, cardWrapper, titleText, errorCard, escapeXml } from "../lib/theme.js";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default async function handler(req, res) {
  const p = parseParams(req.query);
  const t = getTheme(p.theme);

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");

  try {
    const s = await fetchStreakStats(p.username);
    const title = p.custom_title || `${p.username}'s Streak`;
    const width = p.width;
    const height = 175;

    // Three pillars: Total, Current Streak, Longest Streak
    const sections = [
      {
        top: s.totalContributions.toLocaleString(),
        label: "Total Contributions",
        sub: `${formatDate(s.firstContribution)} – Present`,
      },
      {
        top: `${s.currentStreak}`,
        label: "Current Streak",
        sub: s.currentStreak > 0
          ? `${formatDate(s.lastContribution)} 🔥`
          : "Start contributing!",
        highlight: true,
      },
      {
        top: `${s.longestStreak}`,
        label: "Longest Streak",
        sub: "days",
      },
    ];

    const colW = Math.floor((width - 40) / 3);
    let cols = "";
    sections.forEach((sec, i) => {
      const cx = 20 + i * colW + colW / 2;
      const isHighlight = sec.highlight;
      const valColor = isHighlight ? t.accent : t.title;
      // Divider line between sections
      if (i > 0) {
        cols += `<line x1="${20 + i * colW}" y1="55" x2="${20 + i * colW}" y2="${height - 30}" stroke="${t.border}" stroke-width="1"/>`;
      }
      cols += `
        <text x="${cx}" y="90" fill="${valColor}" font-size="${isHighlight ? 32 : 26}" font-weight="700"
          text-anchor="middle" font-family="'DM Mono', monospace">${escapeXml(sec.top)}</text>
        <text x="${cx}" y="115" fill="${t.text}" font-size="11" font-weight="500" text-anchor="middle" letter-spacing="0.3">
          ${escapeXml(sec.label.toUpperCase())}
        </text>
        <text x="${cx}" y="133" fill="${t.muted}" font-size="10" text-anchor="middle">
          ${escapeXml(sec.sub)}
        </text>
      `;
      if (isHighlight) {
        // Subtle glow circle behind big number
        cols = `<circle cx="${cx}" cy="82" r="30" fill="${t.accentSoft}" opacity="0.5"/>` + cols;
      }
    });

    const svg = cardWrapper({
      width,
      height,
      theme: t,
      border_radius: p.border_radius,
      hide_border: p.hide_border,
      children: `
        ${p.hide_title ? "" : titleText({ text: title, theme: t })}
        ${cols}
      `,
    });

    res.status(200).send(svg);
  } catch (err) {
    res.status(200).send(errorCard({ message: err.message, theme: p.theme, width: p.width }));
  }
}
