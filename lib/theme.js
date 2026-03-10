// lib/theme.js — shared design tokens & SVG helpers

export const themes = {
  light: {
    bg: "#ffffff",
    border: "#e2e8f0",
    title: "#0f172a",
    text: "#334155",
    muted: "#94a3b8",
    accent: "#0ea5e9",
    accentSoft: "#e0f2fe",
    bar: "#e2e8f0",
    barFill: "#0ea5e9",
    shadow: "rgba(0,0,0,0.06)",
  },
  dark: {
    bg: "#0d1117",
    border: "#21262d",
    title: "#f0f6fc",
    text: "#c9d1d9",
    muted: "#484f58",
    accent: "#58a6ff",
    accentSoft: "#1f3a5f",
    bar: "#21262d",
    barFill: "#58a6ff",
    shadow: "rgba(0,0,0,0.4)",
  },
  "light-warm": {
    bg: "#faf9f7",
    border: "#e8e0d5",
    title: "#1c1917",
    text: "#44403c",
    muted: "#a8a29e",
    accent: "#ea580c",
    accentSoft: "#fff7ed",
    bar: "#e8e0d5",
    barFill: "#ea580c",
    shadow: "rgba(0,0,0,0.05)",
  },
  "dark-warm": {
    bg: "#13100e",
    border: "#2c2420",
    title: "#fafaf9",
    text: "#d6d3d1",
    muted: "#57534e",
    accent: "#fb923c",
    accentSoft: "#431407",
    bar: "#2c2420",
    barFill: "#fb923c",
    shadow: "rgba(0,0,0,0.5)",
  },
  "light-green": {
    bg: "#f8fffe",
    border: "#d1fae5",
    title: "#064e3b",
    text: "#065f46",
    muted: "#6ee7b7",
    accent: "#059669",
    accentSoft: "#d1fae5",
    bar: "#d1fae5",
    barFill: "#059669",
    shadow: "rgba(0,0,0,0.04)",
  },
  "dark-green": {
    bg: "#0a130f",
    border: "#14532d",
    title: "#f0fdf4",
    text: "#bbf7d0",
    muted: "#166534",
    accent: "#4ade80",
    accentSoft: "#14532d",
    bar: "#14532d",
    barFill: "#4ade80",
    shadow: "rgba(0,0,0,0.5)",
  },
};

export function getTheme(name = "light") {
  return themes[name] || themes["light"];
}

export function parseParams(query) {
  return {
    username: query.username || "octocat",
    theme: query.theme || "light",
    hide_border: query.hide_border === "true",
    hide_title: query.hide_title === "true",
    show_icons: query.show_icons !== "false",
    border_radius: parseFloat(query.border_radius ?? 12),
    custom_title: query.custom_title || null,
    width: parseInt(query.width ?? 495),
    langs_count: parseInt(query.langs_count ?? 8),
    wakatime_username: query.wakatime_username || query.username || "octocat",
  };
}

export function cardWrapper({ width = 495, height, theme, border_radius = 12, hide_border = false, children }) {
  const t = typeof theme === "string" ? getTheme(theme) : theme;
  return `<svg
    width="${width}"
    height="${height}"
    viewBox="0 0 ${width} ${height}"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="GitHub Stats Card"
  >
    <defs>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&amp;family=DM+Sans:wght@400;500;600&amp;display=swap');
        text { font-family: 'DM Sans', -apple-system, sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }
      </style>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="${t.shadow}" />
      </filter>
    </defs>
    <rect
      x="0.5" y="0.5"
      rx="${border_radius}" ry="${border_radius}"
      width="${width - 1}" height="${height - 1}"
      fill="${t.bg}"
      stroke="${hide_border ? "transparent" : t.border}"
      stroke-width="1"
    />
    ${children}
  </svg>`;
}

export function titleText({ text, theme, x = 25, y = 35, icon = null }) {
  const t = typeof theme === "string" ? getTheme(theme) : theme;
  return `
    <text x="${x}" y="${y}" fill="${t.title}" font-size="14" font-weight="600" letter-spacing="0.3">${escapeXml(text)}</text>
    <line x1="${x}" y1="${y + 8}" x2="${x + 30}" y2="${y + 8}" stroke="${t.accent}" stroke-width="2" stroke-linecap="round"/>
  `;
}

export function statItem({ label, value, x, y, theme, mono = true }) {
  const t = typeof theme === "string" ? getTheme(theme) : theme;
  return `
    <text x="${x}" y="${y}" fill="${t.muted}" font-size="11" letter-spacing="0.5" text-transform="uppercase">${escapeXml(label.toUpperCase())}</text>
    <text x="${x}" y="${y + 20}" fill="${t.text}" font-size="20" font-weight="600" class="${mono ? "mono" : ""}">${escapeXml(String(value))}</text>
  `;
}

export function progressBar({ x, y, width, percent, theme, label, value, height = 6 }) {
  const t = typeof theme === "string" ? getTheme(theme) : theme;
  const fill = Math.max(0, Math.min(100, percent));
  const barWidth = width - x - 25;
  return `
    <text x="${x}" y="${y}" fill="${t.text}" font-size="12">${escapeXml(label)}</text>
    <text x="${width - 10}" y="${y}" fill="${t.muted}" font-size="11" text-anchor="end">${escapeXml(value)}</text>
    <rect x="${x}" y="${y + 5}" width="${barWidth}" height="${height}" rx="${height / 2}" fill="${t.bar}" />
    <rect x="${x}" y="${y + 5}" width="${(barWidth * fill) / 100}" height="${height}" rx="${height / 2}" fill="${t.barFill}" />
  `;
}

export function errorCard({ message, theme = "light", width = 495 }) {
  const t = getTheme(theme);
  return cardWrapper({
    width,
    height: 120,
    theme: t,
    children: `
      <text x="25" y="55" fill="${t.muted}" font-size="13">⚠ ${escapeXml(message)}</text>
      <text x="25" y="78" fill="${t.muted}" font-size="11">Check your username or token configuration.</text>
    `,
  });
}

export function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
