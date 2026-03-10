// api/banner.js — Blue Archive Banner Card
// Returns an SVG with SMIL animations (works in <img> tags on GitHub README)

import { fetchUserStats, fetchTopLanguages } from "../lib/github.js";
import { escapeXml } from "../lib/theme.js";

// ── Chibi placeholder SVG (replace innards with your OC later) ──
// To swap in your OC:
//   • SVG file  → paste your <svg>...</svg> code inside chibis() return
//   • PNG/image → use <image href="YOUR_URL" width="48" height="64"/>
function chibiPlaceholder(x, flipX = false) {
  const transform = flipX ? `translate(${x + 36}, 0) scale(-1,1)` : `translate(${x}, 0)`;
  return `
    <image href="https://avatars.githubusercontent.com/u/87846302?s=64&v=4" width="48" height="64" transform="${transform}"/>
  `;
}

function buildSVG({ name, login, commits, stars, prs, issues, followers, topLang, topLangColor, totalContributions }) {
  const W = 520, H = 320;
  const accentBlue  = "#4a9eff";
  const accentPink  = "#ff6b9d";
  const accentYellow= "#ffd166";
  const navy        = "#1a3a6e";
  const muted       = "#8baecf";
  const bg1         = "#e8f4ff";
  const bg2         = "#f5f9ff";
  const bg3         = "#fffaf5";
  const white       = "#ffffff";
  const softBorder  = "rgba(74,158,255,0.25)";

  // stat cells: 2 rows × 3 cols
  const stats = [
    { label: "COMMITS",   value: commits.toLocaleString() },
    { label: "STARS",     value: stars.toLocaleString() },
    { label: "PULL REQ",  value: prs.toLocaleString() },
    { label: "ISSUES",    value: issues.toLocaleString() },
    { label: "FOLLOWERS", value: followers.toLocaleString() },
    { label: "TOP LANG",  value: topLang, color: topLangColor || accentBlue },
  ];

  const CELL_W = 148, CELL_H = 54, CELL_GAP = 8;
  const GRID_X = 18, GRID_Y = 118;

  let statCells = "";
  stats.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = GRID_X + col * (CELL_W + CELL_GAP);
    const cy = GRID_Y + row * (CELL_H + CELL_GAP);
    const valColor = s.color || navy;
    statCells += `
      <!-- stat cell ${i} -->
      <rect x="${cx}" y="${cy}" width="${CELL_W}" height="${CELL_H}" rx="10"
        fill="rgba(255,255,255,0.6)" stroke="${softBorder}" stroke-width="1"/>
      <text x="${cx + 12}" y="${cy + 18}" fill="${muted}"
        font-size="9" font-weight="700" letter-spacing="1"
        font-family="'Rajdhani',sans-serif">${escapeXml(s.label)}</text>
      <text x="${cx + 12}" y="${cy + 42}" fill="${valColor}"
        font-size="22" font-weight="700"
        font-family="'Rajdhani',sans-serif">${escapeXml(s.value)}</text>
    `;
  });

  // shimmer sweep
  const shimmer = `
    <rect x="0" y="0" width="${W}" height="${H}" rx="20" fill="url(#shimmerGrad)" opacity="0">
      <animate attributeName="opacity" values="0;0;0.7;0" dur="4s" repeatCount="indefinite" begin="1s"/>
    </rect>
  `;

  // floating particles with SMIL float
  const particles = [
    { x: 55,  y: 258, r: 3,   color: accentBlue,   dur: "3.2s", delay: "0s"   },
    { x: 130, y: 262, r: 2.5, color: accentPink,   dur: "4.1s", delay: "0.8s" },
    { x: 240, y: 255, r: 3.5, color: accentYellow, dur: "3.7s", delay: "1.5s" },
    { x: 330, y: 260, r: 2.5, color: accentBlue,   dur: "4.5s", delay: "0.3s" },
    { x: 420, y: 257, r: 3,   color: accentPink,   dur: "3.0s", delay: "2.0s" },
    { x: 480, y: 253, r: 2,   color: accentYellow, dur: "5.0s", delay: "1.2s" },
    { x: 290, y: 248, r: 2.5, color: accentBlue,   dur: "3.5s", delay: "2.5s" },
  ].map((p, i) => `
    <circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${p.color}" opacity="0.8">
      <animate attributeName="cy"
        values="${p.y};${p.y - 18};${p.y}"
        dur="${p.dur}" repeatCount="indefinite" begin="${p.delay}"
        calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
      <animate attributeName="opacity"
        values="0.5;1;0.5"
        dur="${p.dur}" repeatCount="indefinite" begin="${p.delay}"/>
    </circle>
  `).join("");

  // chibi walk animations — from off-left to off-right
  const chibiStageY = 248;
  const chibiH = 52;

  const chibi1 = `
    <g>
      ${chibiPlaceholder(0)}
      <animateTransform attributeName="transform" type="translate"
        values="-50,${chibiStageY}; ${W + 50},${chibiStageY}"
        dur="13s" repeatCount="indefinite" begin="0s"/>
    </g>
  `;
  const chibi2 = `
    <g>
      ${chibiPlaceholder(0, true)}
      <animateTransform attributeName="transform" type="translate"
        values="${W + 50},${chibiStageY}; -50,${chibiStageY}"
        dur="16s" repeatCount="indefinite" begin="4s"/>
    </g>
  `;

  // border glow pulse
  const borderGlow = `
    <rect x="1" y="1" width="${W-2}" height="${H-2}" rx="19" fill="none"
      stroke="${accentBlue}" stroke-width="1.5" opacity="0.3">
      <animate attributeName="opacity" values="0.15;0.5;0.15" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="stroke-width" values="1;2.5;1" dur="3s" repeatCount="indefinite"/>
    </rect>
  `;

  return `<svg
    width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    role="img" aria-label="${escapeXml(name)}'s GitHub Stats Banner"
  >
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&amp;display=swap');
    </style>

    <!-- card background gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${bg1}"/>
      <stop offset="45%"  stop-color="${bg2}"/>
      <stop offset="100%" stop-color="${bg3}"/>
    </linearGradient>

    <!-- shimmer sweep gradient -->
    <linearGradient id="shimmerGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="white" stop-opacity="0"/>
      <stop offset="45%"  stop-color="white" stop-opacity="0.5"/>
      <stop offset="55%"  stop-color="white" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
      <animateTransform attributeName="gradientTransform" type="translate"
        values="-1.5 0; 1.5 0" dur="4s" repeatCount="indefinite" begin="1s"/>
    </linearGradient>

    <!-- top/bottom bar gradient -->
    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${accentPink}"/>
      <stop offset="50%"  stop-color="${accentBlue}"/>
      <stop offset="100%" stop-color="${accentYellow}"/>
    </linearGradient>

    <!-- chibi stage subtle gradient -->
    <linearGradient id="stageGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="rgba(74,158,255,0.04)"/>
      <stop offset="100%" stop-color="rgba(74,158,255,0.0)"/>
    </linearGradient>

    <clipPath id="cardClip">
      <rect width="${W}" height="${H}" rx="20"/>
    </clipPath>
  </defs>

  <!-- card background -->
  <g clip-path="url(#cardClip)">
    <rect width="${W}" height="${H}" fill="url(#bgGrad)"/>

    <!-- top rainbow bar -->
    <rect x="0" y="0" width="${W}" height="4" fill="url(#barGrad)"/>

    <!-- header section -->
    <!-- halo icon -->
    <ellipse cx="36" cy="42" rx="11" ry="3" stroke="${accentYellow}" stroke-width="1.5" fill="rgba(255,209,102,0.12)"/>
    <line x1="36" y1="42" x2="36" y2="58" stroke="${accentBlue}" stroke-width="1.2"
      stroke-dasharray="2 2" opacity="0.5"/>
    <circle cx="36" cy="58" r="3" fill="${accentBlue}" opacity="0.8"/>
    <circle cx="36" cy="42" r="2" fill="${accentYellow}"/>

    <!-- title -->
    <text x="56" y="40" fill="${navy}"
      font-size="17" font-weight="700" letter-spacing="0.5"
      font-family="'Rajdhani',sans-serif">${escapeXml(name)}'s GitHub Stats</text>
    <text x="56" y="56" fill="${muted}"
      font-size="10" letter-spacing="1.2"
      font-family="'Rajdhani',sans-serif">ATLANTIS · ${escapeXml(login.toUpperCase())}</text>

    <!-- underline accent -->
    <line x1="56" y1="62" x2="120" y2="62" stroke="${accentBlue}" stroke-width="2" stroke-linecap="round"/>

    <!-- SSR badge -->
    <rect x="${W - 80}" y="24" width="62" height="22" rx="11"
      fill="${accentBlue}"/>
    <rect x="${W - 80}" y="24" width="62" height="22" rx="11"
      fill="${accentBlue}" opacity="0.4">
      <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite"/>
    </rect>
    <text x="${W - 49}" y="39" fill="white"
      font-size="11" font-weight="700" text-anchor="middle" letter-spacing="0.5"
      font-family="'Rajdhani',sans-serif">★ SSR</text>

    <!-- divider -->
    <line x1="18" y1="76" x2="${W - 18}" y2="76"
      stroke="rgba(74,158,255,0.2)" stroke-width="1"/>

    <!-- contributions this year label -->
    <text x="18" y="96" fill="${muted}"
      font-size="9" letter-spacing="1" font-weight="700"
      font-family="'Rajdhani',sans-serif">CONTRIBUTIONS THIS YEAR</text>
    <text x="${W - 18}" y="96" fill="${accentBlue}"
      font-size="13" font-weight="700" text-anchor="end"
      font-family="'Rajdhani',sans-serif">${totalContributions.toLocaleString()}</text>

    <!-- stat cells -->
    ${statCells}

    <!-- chibi stage bg -->
    <rect x="0" y="242" width="${W}" height="74" fill="url(#stageGrad)"/>
    <!-- ground line -->
    <line x1="0" y1="${chibiStageY + chibiH + 4}" x2="${W}" y2="${chibiStageY + chibiH + 4}"
      stroke="rgba(74,158,255,0.15)" stroke-width="1"/>

    <!-- particles -->
    ${particles}

    <!-- chibis -->
    ${chibi1}
    ${chibi2}

    <!-- shimmer -->
    ${shimmer}

    <!-- bottom bar -->
    <rect x="0" y="${H - 3}" width="${W}" height="3" fill="url(#barGrad)" opacity="0.5"/>
  </g>

  <!-- border glow (outside clip so it renders on top) -->
  ${borderGlow}
</svg>`;
}

export default async function handler(req, res) {
  const username = req.query.username || "octocat";

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");

  try {
    const [stats, langs] = await Promise.all([
      fetchUserStats(username),
      fetchTopLanguages(username, 1),
    ]);

    const topLang = langs[0] || { name: "N/A", color: "#8baecf" };

    const svg = buildSVG({
      name:               stats.name,
      login:              stats.login,
      commits:            stats.commits,
      stars:              stats.totalStars,
      prs:                stats.prs,
      issues:             stats.issues,
      followers:          stats.followers,
      topLang:            topLang.name,
      topLangColor:       topLang.color || "#4a9eff",
      totalContributions: stats.totalContributions,
    });

    res.status(200).send(svg);
  } catch (err) {
    // fallback error card
    res.status(200).send(`<svg width="520" height="80" xmlns="http://www.w3.org/2000/svg">
      <rect width="520" height="80" rx="12" fill="#e8f4ff" stroke="rgba(74,158,255,0.3)" stroke-width="1"/>
      <text x="20" y="46" fill="#8baecf" font-size="13" font-family="sans-serif">⚠ ${escapeXml(err.message)}</text>
    </svg>`);
  }
}