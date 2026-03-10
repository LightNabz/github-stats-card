// lib/github.js — GitHub GraphQL + REST fetchers

const GH_API = "https://api.github.com/graphql";
const GH_REST = "https://api.github.com";

function getToken() {
  return process.env.GITHUB_TOKEN || "";
}

export async function fetchGraphQL(query, variables = {}) {
  const token = getToken();
  if (!token) throw new Error("GITHUB_TOKEN not set in environment");

  const res = await fetch(GH_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0]?.message || "GraphQL error");
  return data.data;
}

export async function fetchUserStats(username) {
  const query = `
    query($login: String!) {
      user(login: $login) {
        name
        login
        avatarUrl
        bio
        followers { totalCount }
        following { totalCount }
        repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
          totalCount
          nodes {
            stargazerCount
            forkCount
            primaryLanguage { name color }
          }
        }
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          totalPullRequestReviewContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { login: username });
  const u = data.user;
  if (!u) throw new Error(`User "${username}" not found`);

  const repos = u.repositories.nodes;
  const totalStars = repos.reduce((acc, r) => acc + r.stargazerCount, 0);
  const totalForks = repos.reduce((acc, r) => acc + r.forkCount, 0);

  return {
    name: u.name || u.login,
    login: u.login,
    followers: u.followers.totalCount,
    following: u.following.totalCount,
    totalRepos: u.repositories.totalCount,
    totalStars,
    totalForks,
    commits: u.contributionsCollection.totalCommitContributions,
    prs: u.contributionsCollection.totalPullRequestContributions,
    issues: u.contributionsCollection.totalIssueContributions,
    reviews: u.contributionsCollection.totalPullRequestReviewContributions,
    totalContributions: u.contributionsCollection.contributionCalendar.totalContributions,
    contributionWeeks: u.contributionsCollection.contributionCalendar.weeks,
  };
}

export async function fetchTopLanguages(username, langsCount = 8) {
  const query = `
    query($login: String!) {
      user(login: $login) {
        repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
          nodes {
            primaryLanguage { name color }
            languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node { name color }
              }
            }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { login: username });
  const repos = data.user?.repositories?.nodes || [];

  const langMap = {};
  for (const repo of repos) {
    for (const edge of repo.languages?.edges || []) {
      const { name, color } = edge.node;
      langMap[name] = langMap[name] || { name, color, size: 0 };
      langMap[name].size += edge.size;
    }
  }

  const sorted = Object.values(langMap)
    .sort((a, b) => b.size - a.size)
    .slice(0, langsCount);

  const total = sorted.reduce((acc, l) => acc + l.size, 0);
  return sorted.map((l) => ({ ...l, percent: (l.size / total) * 100 }));
}

export async function fetchStreakStats(username) {
  // Uses streaks computed from contribution calendar
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { login: username });
  const weeks = data.user?.contributionsCollection?.contributionCalendar?.weeks || [];

  const days = weeks.flatMap((w) => w.contributionDays).sort((a, b) => a.date.localeCompare(b.date));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let totalContributions = 0;
  let firstContribution = null;
  let lastContribution = null;

  const today = new Date().toISOString().split("T")[0];

  for (const day of days) {
    if (day.contributionCount > 0) {
      totalContributions += day.contributionCount;
      if (!firstContribution) firstContribution = day.date;
      lastContribution = day.date;
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak from today backwards
  const reversed = [...days].reverse();
  let counting = true;
  for (const day of reversed) {
    if (!counting) break;
    if (day.date > today) continue;
    if (day.contributionCount > 0) {
      currentStreak++;
    } else if (day.date <= today) {
      counting = false;
    }
  }

  return {
    totalContributions,
    currentStreak,
    longestStreak,
    firstContribution,
    lastContribution,
  };
}
