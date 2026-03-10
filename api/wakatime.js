// api/wakatime.js — WakaTime Activity Card
import { getTheme, parseParams, cardWrapper, titleText, progressBar, errorCard, escapeXml } from "../lib/theme.js";

const WAKA_API = "https://wakatime.com/api/v1";

async function fetchWakaStats(username) {
  // Public stats endpoint (requires profile to be public on WakaTime)
  const url = `${WAKA_API}/users/${username}/stats/last_7_days?is_including_today=true`;
  const res = await fetch(url, {
    headers: process.env.WAKATIME_API_KEY
      ? { Authorization: `Basic ${Buffer.from(process.env.WAKATIME_API_KEY).toString("base64")}` }
      : {},
  });

  if (res.status === 401) throw new Error("WakaTime profile is private — set WAKATIME_API_KEY env var");
  if (res.status === 404) throw new Error(`WakaTime user "${username}" not found`);
  if (!res.ok) throw new Error(`WakaTime API error: ${res.status}`);

  const data = await res.json();
  return data.data;
}

export default async function handler(req, res) {
  const p = parseParams(req.query);
  const t = getTheme(p.theme);
  const wakaUser = p.wakatime_username;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  try {
    const stats = await fetchWakaStats(wakaUser);
    const title = p.custom_title || "WakaTime (Last 7 Days)";
    const width = p.width;

    const langs = (stats.languages || []).slice(0, 6);
    const editors = (stats.editors || []).slice(0, 3);

    const rowH = 28;
    const padTop = 60;
    const langSection = langs.length * rowH;
    const editorSection = editors.length > 0 ? 20 + editors.length * rowH : 0;
    const height = padTop + langSection + editorSection + 30;

    let content = "";

    // Total time badge
    const totalText = stats.human_readable_total_including_other_language || stats.human_readable_total || "—";
    content += `
      <rect x="${width - 130}" y="18" width="105" height="22" rx="11" fill="${t.accentSoft}" />
      <text x="${width - 77}" y="33" fill="${t.accent}" font-size="11" font-weight="600" text-anchor="middle">
        ⏱ ${escapeXml(totalText)}
      </text>
    `;

    // Languages section
    langs.forEach((lang, i) => {
      const pct = lang.percent ?? 0;
      const timeText = lang.text || `${pct.toFixed(1)}%`;
      content += progressBar({
        x: 25,
        y: padTop + i * rowH - 10,
        width: width - 10,
        percent: pct,
        theme: t,
        label: lang.name,
        value: timeText,
      });
    });

    // Editors sub-section
    if (editors.length > 0) {
      const editorY = padTop + langSection + 10;
      content += `
        <text x="25" y="${editorY}" fill="${t.muted}" font-size="10" letter-spacing="0.5">EDITORS</text>
        <line x1="25" y1="${editorY + 4}" x2="${width - 25}" y2="${editorY + 4}" stroke="${t.border}" stroke-width="1"/>
      `;
      editors.forEach((ed, i) => {
        const pct = ed.percent ?? 0;
        content += progressBar({
          x: 25,
          y: editorY + 10 + i * rowH,
          width: width - 10,
          percent: pct,
          theme: t,
          label: ed.name,
          value: ed.text || `${pct.toFixed(1)}%`,
          height: 4,
        });
      });
    }

    const svg = cardWrapper({
      width,
      height,
      theme: t,
      border_radius: p.border_radius,
      hide_border: p.hide_border,
      children: `
        ${p.hide_title ? "" : titleText({ text: title, theme: t })}
        ${content}
      `,
    });

    res.status(200).send(svg);
  } catch (err) {
    res.status(200).send(errorCard({ message: err.message, theme: p.theme, width: p.width }));
  }
}
