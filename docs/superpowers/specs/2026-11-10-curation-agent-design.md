# Curation agent and scheduled publishing: design

Date: 2026-11-10 · Status: draft for review · Owner: Peter Warnock

## Why

Peter positions this site as a curator of current trends (AI dev tools, cloud, developer
experience). Publishing has stalled: the last post is dated 2026-06-29, and earlier posts arrive in
bursts. Finding things is not the bottleneck. **Writing them up and getting them published is.**

The goal is a habit of releasing content on a schedule, with as little friction as possible between
"I saw something worth sharing" and "it's live on the site". A home page redesign that puts fresh
content above the fold is wanted too, but it is sequenced **after** this work (see *Later: home
page*), because a new home page without a steady flow of content solves nothing.

## Success

- At least **one published pick per week**, sustained over three months.
- Capturing a pick takes under a minute from a phone.
- Peter never has to open a terminal, an editor, or git to publish a pick.

## Goals

1. Capture a pick from a phone: a **URL plus a few words of context**.
2. An agent in the cloud drafts the pick in Peter's voice.
3. Drafts are **private** until published (the site repo is public).
4. Peter reviews, edits and approves in a web admin, reachable from Telegram.
5. Approved picks publish **on a schedule**: the agent places each in the next open slot unless
   Peter gives a date.
6. The site stays a Hugo static site, built and served by GitHub as it is today.

## Non-goals

- Redesigning the home page (later project; decisions so far are recorded below).
- An agent that discovers content by itself (scanning feeds, trending lists). Peter is always the
  trigger.
- Migrating existing posts, radar entries or bookmarks into the new system.
- Comments, newsletter, analytics.

## Anti-goals (would be a failure even if it technically works)

- Drafts or half-written takes becoming visible in the public repo, PRs, or Action logs.
- Picks that don't sound like Peter: generic summaries, filler phrases, invented claims about the
  source.
- Anything published without Peter's approval.
- A running cost that is more than a few dollars a month at one-to-a-few picks per week.
- A system so fiddly that skipping a week is easier than using it.

## Decisions Peter made

| Topic | Decision |
|---|---|
| Intake | URL + context words, sent to a cloud agent via Telegram or a form |
| Draft storage | A CMS, not PRs, because the repo is public |
| Static site | Keep Hugo, built and served via GitHub (Pages + Actions) as today |
| Agent/CMS host | **Vercel**, chosen over Azure for the free tier |
| Framework | **Django** (Peter wants to keep Django skills in use) |
| Model access | Through a **gateway or another provider**; not locked to one vendor's SDK |
| Publish timing | Agent picks the next open slot by default; Peter can specify a date |
| Approval | In the Django admin; Telegram links into the admin |
| Cadence target | At least one per week |
| Pick sizes | All three: link + one line, short note, full post |

## Shape of the system

```
 Phone ──Telegram──▶ Django app on Vercel ──▶ model (via gateway)
                     │  webhook, drafting,        │
                     │  drafts DB (Neon Postgres) ◀┘
                     │  admin (edit / approve / schedule)
                     │  publish feed (authenticated, approved+due only)
                     ▼
 GitHub Action (cron) ──pulls due picks──▶ writes Hugo files ──▶ commit ──▶ build ──▶ GitHub Pages
```

### 1. Intake

- A Telegram bot is the primary channel; a small form in the Django app is the fallback.
- Message format: a URL, optionally followed by free-text context. Optional hints Peter may type:
  a size (`link`, `note`, `post`) and a date (`fri`, `2026-11-20`). Exact syntax is the builder's
  call; it must be forgiving and have a sane default when hints are absent.
- The bot only accepts messages from Peter's Telegram user ID. Everything else is ignored.
- The bot acknowledges receipt immediately, then replies again when the draft is ready.

### 2. Drafting

- Fetch the URL, extract readable content, draft the pick.
- **On the site, every size renders as a regular curated blog post (Peter's decision)**: a link
  pick is just a short post. No new frontmatter field, layout or template changes in v1; the public
  repo gains only the publish workflow and the deploy split. Distinct styling for links and notes
  belongs to the home page project.
- **Size default (builder's call, mine):** no context or one line → `link`; a few sentences →
  `note`; explicit `post` hint → full post. Peter can change the size in the admin.
- Output fields map onto the existing Hugo frontmatter used by curated posts (see
  `packages/site/content/blog/posts/wsl-container-public-preview/index.md`): `title`, `summary`,
  `description`, `date`, `draft`, `content_type: curated`, `source_url`, `tags`, `author`.
- Voice: the prompt is grounded in a handful of Peter's existing curated and original posts as
  examples. When Peter edits a draft before approving, store the before/after pair; these become
  better voice examples over time. (Mechanism is the builder's call; the existing
  `packages/agents/src/core/voice-learning.ts` is prior art, not a dependency.)
- Never invent facts about the source. If the fetch fails (paywall, JS-only page), draft from
  Peter's context only and say so in the Telegram reply.
- Model calls go through a provider-neutral path (a gateway such as Vercel's AI gateway, or an
  OpenAI-compatible endpoint). The model is configuration, not code. Starting point: a Claude Opus
  or Sonnet class model; measured cost estimate is in *Research* below.
- Drafting must finish inside Vercel Hobby's **300 s** function limit. Do the work after
  acknowledging the webhook (Telegram retries slow webhooks), e.g. a background task or Vercel's
  durable/queue mechanism. Builder's call which.

### 3. Review and approval

- Django admin is the editor. Wagtail only if the plain admin proves too bare; not in v1.
- Telegram's "draft ready" reply contains a short preview, a link to that draft's admin page, and
  an **Approve** button for drafts that need no edits.
- Approve means "scheduled into a slot", not "published now". The Telegram confirmation states the
  slot date.
- States: `drafting → ready → approved(scheduled) → published`, plus `rejected` and `failed`.

### 4. Scheduling

- Slots are configurable in the admin. **Default (my call):** one slot per weekday at 09:00
  America/Los_Angeles. Approved picks fill the earliest open slot; a specific date from Peter
  overrides.
- **Habit nudge (my call):** if no pick is approved for the next 7 days, the bot messages Peter once
  (e.g. Monday morning). This serves the one-per-week target.

### 5. Publishing into the site

- A scheduled GitHub Action (default: hourly) calls the Django app's publish endpoint, authenticated
  with a token stored as a repo secret. It receives only picks that are approved and whose slot is
  now or past.
- The Action writes each as a Hugo page bundle under `packages/site/content/blog/posts/<slug>/`,
  lands them on `main` through a PR with a bot identity (below), and triggers a deploy. It then
  tells the Django app which picks were published, so they flip to `published`. Must be idempotent:
  a re-run never duplicates a post.
- Content is committed (not fetched at build time) so the site still builds from git alone and keeps
  history. Once published, a pick is public anyway, so this doesn't break the privacy anti-goal.
- **Deploy trigger (verified 2026-11-10):** `.github/workflows/auto-release.yml` runs on `push` to
  `main`, and a push made with the workflow's own `GITHUB_TOKEN` does not start new workflow runs.
  So a pick committed by the publish Action would never deploy on its own. My call: split the
  build-and-deploy steps so they can also run on `workflow_dispatch`, and have the publish Action
  dispatch them after committing (dispatch is allowed with `GITHUB_TOKEN`). No PAT needed.
- **No release per pick (my call):** the same workflow bumps the version, tags and creates a GitHub
  release for every push with new commits. Pick commits must not cut releases; the deploy path
  above skips the release steps. Releases stay for code changes.
- **Turn off `buildFuture = true`** in `packages/site/hugo.toml`. Today it publishes future-dated
  posts on the next deploy, which defeats scheduling. Check the tools/radar section, which the
  config comment says relies on it, before flipping.
- **Picks land through a PR (Peter's decision).** The publish Action commits picks to a branch,
  opens a PR, and merges it itself. `main` currently has no branch protection or rulesets, so
  nothing blocks the merge; the PR exists for the trail, not as a gate. One PR per Action run that
  has due picks (a run may carry several).
- PRs opened with `GITHUB_TOKEN` don't trigger the repo's other workflows, so `test.yml` won't run
  on them. My call: the publish Action runs the Hugo build itself before merging and only merges
  if it succeeds; on failure it leaves the PR open and the bot tells Peter on Telegram. After
  merging it dispatches the deploy (see above).

## Constraints

- Vercel **Hobby**: 300 s max function duration; 1M invocations, 4 h active CPU, 360 GB-hrs
  memory per month; **non-commercial use only**. Peter chose Vercel with this rule in view; the
  agent app itself advertises nothing, but the site it feeds has a "work with me" link. If Vercel
  ever classes it as commercial, the fallback is the paid Pro plan or Azure.
- Neon Free: 1 GB storage per project, 100 CU-hours/month, compute sleeps after 5 min idle.
- Secrets (Telegram token, model key, publish token) live in Vercel and GitHub secrets, never in
  the public repo.
- New Django app lives in **its own private repo** (my call: drafts, prompts and voice samples
  shouldn't sit in the public site repo). The public repo only gains the publish workflow.

## Left to the builder

Telegram library, background-task mechanism on Vercel, HTML extraction library, slug rules, exact
hint syntax, prompt wording, admin layout, test strategy.

## What happens to `packages/agents`

It is a TypeScript library whose content generation is fixed templates with placeholder text
("I found this interesting because...", `TODO: Enhance in T10-T14 with actual content generation`);
nothing in `packages/agents/src` calls a model. The new Django app replaces it for curation. Leave
it in place for now; deciding whether to delete it is out of scope.

## Research (2026-11-10)

| | Vercel Hobby + Neon Free | Azure (credits) |
|---|---|---|
| Django | Officially supported (detects `manage.py`, runs as one function) | Container Apps runs any container |
| Max run | 300 s, not raisable on Hobby | No equivalent cap |
| Free allowance | 1M invocations, 4 h active CPU (model I/O wait not counted), 360 GB-hrs | Container Apps: 180,000 vCPU-s, 2M requests/month, scales to zero |
| Database | Neon: 1 GB, 100 CU-h/month, scale-to-zero | Postgres B1ms free 12 months on *free accounts* only |

Model list prices per 1M tokens (input/output): Opus 5.5 $4/$20, Sonnet 5.5 $2/$10,
Haiku 5.5 $0.10/$0.50. Assumed ~15K input + ~3K output tokens per pick (output includes
thinking): Opus ≈ $0.12, Sonnet ≈ $0.06 per pick. Prices through a gateway may differ.

Sources: vercel.com/docs/functions/limitations, vercel.com/docs/limits/fair-use-guidelines,
vercel.com/docs/frameworks/full-stack/django, neon.com/pricing,
azure.microsoft.com/pricing/details/container-apps,
learn.microsoft.com/azure/postgresql/flexible-server/how-to-deploy-on-azure-free-account.

## Later: home page (separate project, decisions so far)

- Serve both trend followers (first) and recruiters/clients.
- Above the fold, desktop: two columns. **Left, wide:** one stream of latest picks, newest first,
  mixing links, notes, posts, **radar entries and bookmarks**, each with a small type label.
  **Right, narrow:** photo, one-line "what I curate and build", links to portfolio, work with me,
  subscribe.
- Mobile: one-line intro bar above the stream.
- The current full-height carousel goes; skills, recruiter CTA and the project/radar grid move
  **below** the stream.
- A highlighted slot for a scheduled piece is a future consideration, not v1.
- Known wrinkles: bookmarks are topic collections (one item per collection); radar entries were
  added in same-date batches and may flood the stream.
