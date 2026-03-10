// api/streak.js — Streak Stats Card (fixed layout)
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
    const height = 170;

    const sections = [
      {
        value: s.totalContributions.toLocaleString(),
        label: "Total Contributions",
        sub: `${formatDate(s.firstContribution)} – Present`,
        highlight: false,
      },
      {
        value: String(s.currentStreak),
        label: "Current Streak",
        sub: s.currentStreak > 0 ? `${formatDate(s.lastContribution)} 🔥` : "Start contributing!",
        highlight: true,
      },
      {
        value: String(s.longestStreak),
        label: "Longest Streak",
        sub: `Best: ${formatDate(s.lastContribution)}`,
        highlight: false,
      },
    ];

    const colW = Math.floor(width / 3);
    let cols = "";

    sections.forEach((sec, i) => {
      const cx = i * colW + colW / 2;
      const valColor = sec.highlight ? t.accent : t.title;
      const valSize = sec.highlight ? 34 : 28;

      // Dividers
      if (i > 0) {
        cols += `<line x1="${i * colW}" y1="50" x2="${i * colW}" y2="${height - 25}" stroke="${t.border}" stroke-width="1"/>`;
      }

      // Highlight ring (clean, no muddy fill)
      if (sec.highlight) {
        cols += `
          <circle cx="${cx}" cy="88" r="32" fill="none" stroke="${t.accent}" stroke-width="1.5" opacity="0.35"/>
          <circle cx="${cx}" cy="88" r="26" fill="${t.accentSoft}" opacity="0.3"/>
        `;
      }

      cols += `
        <text x="${cx}" y="${sec.highlight ? 100 : 97}" fill="${valColor}"
          font-size="${valSize}" font-weight="700" text-anchor="middle"
          font-family="'DM Mono', monospace">${escapeXml(sec.value)}</text>
        <text x="${cx}" y="120" fill="${t.muted}" font-size="10" text-anchor="middle" letter-spacing="0.5">
          ${escapeXml(sec.label.toUpperCase())}
        </text>
        <text x="${cx}" y="137" fill="${t.muted}" font-size="10" text-anchor="middle">
          ${escapeXml(sec.sub)}
        </text>
      `;
    });

    const svg = cardWrapper({
      width, height, theme: t,
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