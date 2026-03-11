# 📊 GitHub Stats Cards — Self-Hosted

Your own Vercel-deployed GitHub stats cards. No shared rate limits, full customization, always online.
<br>
<div align="center">
  <img src="https://github-stats-card-two.vercel.app/api/banner-readme?username=LightNabz&theme=light&oc_url=https%3A%2F%2Fraw.githubusercontent.com%2FLightNabz%2Fgithub-stats-card%2Fmain%2Fpublic%2Fshork.gif"/>
</div>
<br>
<br>

**Click here to create one! https://github-stats-card-two.vercel.app/**

---

## 🚀 Deploy in 3 Steps

### 1. Fork / Clone this repo
```bash
git clone https://github.com/LightNabz/github-stats-card.git
cd github-stats-card
```

### 2. Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### 3. Set Environment Variables in Vercel Dashboard

Go to **Project → Settings → Environment Variables** and add:

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | ✅ Yes | GitHub PAT with `read:user` and `repo` scopes |
| `WAKATIME_API_KEY` | Only for WakaTime | Your WakaTime API key (if profile is private) |

**Get a GitHub token:** https://github.com/settings/tokens/new
- Scopes needed: `read:user`, `repo`

---

## 📌 Usage in README.md

Replace `YOUR_VERCEL_URL` with your deployment URL and `YOUR_USERNAME` with your GitHub username.

### GitHub Stats
```markdown
![GitHub Stats](https://YOUR_VERCEL_URL/api/stats?username=YOUR_USERNAME&theme=light)
```

### Top Languages
```markdown
![Top Languages](https://YOUR_VERCEL_URL/api/langs?username=YOUR_USERNAME&theme=light)
```

### Streak Stats
```markdown
![Streak Stats](https://YOUR_VERCEL_URL/api/streak?username=YOUR_USERNAME&theme=light)
```

### WakaTime Activity
```markdown
![WakaTime](https://YOUR_VERCEL_URL/api/wakatime?username=YOUR_WAKATIME_USERNAME&theme=light)
```

---

## 🎨 Themes

| Theme | Preview |
|---|---|
| `light` | White background, sky blue accent |
| `dark` | GitHub dark, blue accent |
| `light-warm` | Warm white, orange accent |
| `dark-warm` | Deep warm dark, orange accent |
| `light-green` | Soft green tint, emerald accent |
| `dark-green` | Deep forest dark, green accent |

---

## ⚙️ URL Parameters (all cards)

| Param | Default | Description |
|---|---|---|
| `username` | `octocat` | GitHub username |
| `theme` | `light` | Theme name (see above) |
| `hide_border` | `false` | Remove card border |
| `hide_title` | `false` | Hide card title |
| `border_radius` | `12` | Card corner radius (0–20) |
| `custom_title` | _(auto)_ | Override the card title |
| `width` | `495` | Card width in px |

### Extra: Languages card
| Param | Default | Description |
|---|---|---|
| `langs_count` | `8` | Number of languages to show (max 10) |

### Extra: WakaTime card
| Param | Default | Description |
|---|---|---|
| `wakatime_username` | same as `username` | WakaTime username (if different) |

---

## 🔧 Local Development

```bash
npm install
vercel dev
```

Then visit:
- `http://localhost:3000/api/stats?username=YOUR_USERNAME`
- `http://localhost:3000/api/langs?username=YOUR_USERNAME`
- `http://localhost:3000/api/streak?username=YOUR_USERNAME`
- `http://localhost:3000/api/wakatime?username=YOUR_WAKATIME_USERNAME`

---

## 📁 Project Structure

```
github-stats-card/
├── api/
│   ├── stats.js       # GitHub Stats card
│   ├── langs.js       # Top Languages card
│   ├── streak.js      # Streak Stats card
│   └── wakatime.js    # WakaTime Activity card
├── lib/
│   ├── theme.js       # Themes, SVG helpers, shared utilities
│   └── github.js      # GitHub GraphQL + REST API fetchers
├── vercel.json        # Vercel config + cache headers
├── package.json
└── README.md
```

---

## 💡 Tips

- Cards are **cached for 30 minutes** on Vercel's CDN — so stats won't hammer the API
- WakaTime public stats work without an API key, but if your profile is private, add `WAKATIME_API_KEY`
- You can use the cards side by side in your README with an HTML table:

```html
<div align="center">
  <img src="https://YOUR_VERCEL_URL/api/stats?username=YOU&theme=dark" height="165" />
  <img src="https://YOUR_VERCEL_URL/api/langs?username=YOU&theme=dark" height="165" />
</div>
<div align="center">
  <img src="https://YOUR_VERCEL_URL/api/streak?username=YOU&theme=dark" width="495" />
</div>
<div align="center">
  <img src="https://YOUR_VERCEL_URL/api/wakatime?username=YOU&theme=dark" width="495" />
</div>
```