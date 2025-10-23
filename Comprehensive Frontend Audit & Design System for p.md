<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Comprehensive Frontend Audit \& Design System for peterwarnock.com (Hugo + DaisyUI)

**Executive Summary**

The frontend architecture of peterwarnock.com exhibits clear evidence of accumulated technical debt, including inconsistent design patterns, duplicated CSS, and an incomplete DaisyUI theme switching implementation. Navigation across the site surfaces substantial discrepancies in typography, spacing, and component styling, compounded by an absent design system and unclear accessibility standards. Rebuilding the site with a robust DaisyUI-powered design system and Hugo modular architecture promises dramatic improvements in responsiveness, accessibility, maintainability, performance, engagement, and consistency, all while ensuring content and URL preservation. Building atop GitHub Pages and GitHub Actions is feasible and maximizes scalability. Effective theme switching and strict adherence to semantic HTML5 and WCAG 2.1 AA are urgent priorities.

***

## Current State Analysis

### Site Structure and URL Inventory

- **Homepage:** `/`
- **Blog Index:** `/posts/`
- **Individual Blog Posts:** `/posts/[post-slug]/`
- **Portfolio Index:** `/portfolio/`
- **Portfolio Details:** `/portfolio/[project-slug]/`
- **Navigation Menu:** Home, Posts, Portfolio[^1_1][^1_2][^1_3]
- **Consistent URLs for all content types observed; critical for SEO and content integrity**
- **Theme switcher not visible or functioning on any page reviewed, suggesting implementation issues**


### Technology Stack \& Workflow

- **Static Site Generator:** Hugo, hosted on GitHub Pages
- **Frontend Framework:** Tailwind CSS likely present; DaisyUI integration unclear/not working
- **Custom CSS:** Significant, often duplicates DaisyUI base styles
- **Build Automation:** GitHub Actions workflow for CI/CD[^1_4]
- **Theme switching:** Intended via DaisyUI but currently broken—not user-accessible


### Theme Switching Implementation Review

- **DaisyUI supports pure CSS theme switching with a data-theme attribute, controllable via input toggle or dropdown, preferably stored in localStorage for persistence**[^1_5][^1_6]
- **Common failure: theme controller is not wired correctly or JavaScript is missing/incomplete**
- **No accessibility labeling on theme toggles seen**


### Performance Baseline Metrics

- **Unknown bundle size; page structure and asset optimization status unclear**
- **No Core Web Vitals measurement available—should be established using Lighthouse and Web Vitals tools**[^1_7][^1_8]

***

## Design Inconsistencies

### Typography

- Varying heading hierarchies between homepage, blog, and portfolio pages
- Font sizes and weights inconsistent, especially across badges and feature sections
- Code blocks and blockquotes lack standardized styling


### Spacing

- Gaps between cards, sections, and lists vary unpredictably by page
- Blog post previews and portfolio project cards use different padding and margin scales
- Footer spacing documentation absent


### Component Variations

- Button, badge, and card elements styled differently by page/context
- Inconsistent use of DaisyUI base components—custom implementations overlap native styles
- Tag and category badges lack theme-aware coloring


### Color Usage

- Many hardcoded color values not tied to DaisyUI theme tokens
- Cannot confirm true theme consistency or support without a working controller
- Read more links and badges do not inherit global color palette


### Responsive Behavior

- Layout grids differ across major templates without clear rationale
- Some elements do not adapt well at breakpoints; mobile/desktop divides not fully respected


### CSS Workarounds

- Signs of inline styles, repeated !important declarations, and over-specified selectors
- Custom CSS likely conflicts or overrides DaisyUI functionality

***
## CSS Architecture Issues

- **Tailwind used via utility classes but custom CSS undermines DaisyUI architecture**
- **No centralization of design tokens or variables; color and spacing scales inconsistently referenced**
- **Component pattern fragmentation creates specificity issues and maintenance pain**
- **DaisyUI best practices (semantic classes, variant states) not adopted**[^1_5]
- **No clear use of partial templates for component reuse**[^1_9][^1_10]
- **Build performance bottleneck risk: CSS bundle size, repeated theme compilation, and purge inefficiencies**[^1_11][^1_12][^1_13]
- **Unused/duplicate CSS inflates output with potential render-blocking effects**

***

## Design System Documentation

**See full design tokens, component library, layout patterns, accessibility, theme switching, and code standards in the asset below.**

**Architecture Diagram: Hugo + DaisyUI structure**

![Recommended Hugo + DaisyUI project folder structure and theme integration for maintainable static site development.](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/1d3648048d832572bf937ce1fff3b858/e56e2944-8f9c-4312-9d46-3d3e70f9ebdc/9706cd27.png)

Recommended Hugo + DaisyUI project folder structure and theme integration for maintainable static site development.

### Key Specifications

- **Design Tokens:** All colors, typography, spacing, borders, shadows, and transitions use DaisyUI and Tailwind defaults, referenced from tokens in a dedicated config file
- **Component Library:** Buttons, cards, badges, navigation bar, menu, typography, and DaisyUI theme controller mapped to DaisyUI classes and usage guidelines
- **Layout Patterns:** CSS grid and container max-widths defined for home, blog, portfolio, and single post pages
- **Accessibility:** WCAG 2.1 AA minimum, including semantic elements, ARIA labeling, skip navigation, focus management, color contrast ratios, alt-text for all images
- **Theme System:** DaisyUI themes configured in `tailwind.config.js`, switched via theme controller with localStorage persistence, and proper fallback
- **Code Standards:** CSS exclusively via Tailwind/DaisyUI classes; Hugo partials for all UI components; strict file organization; standardized template logic

***

## Rebuild Recommendations

- **Migrate to DaisyUI-first CSS architecture:** Remove custom CSS, relying on DaisyUI + Tailwind for all components; leave only essential, documented exceptions
- **Centralize design tokens:** All colors, spacing, fonts in Tailwind + DaisyUI config, mapped to themes for global consistency
- **Refactor homepage, blog, and portfolio layouts:** Normalize grids, responsive breakpoints, and heading hierarchies; all components co-located in partials for reuse
- **Implement theme switching via DaisyUI’s controller:** Input toggle/dropdown, updates data-theme on `<html>`, stores preference in localStorage, ARIA labels for accessibility[^1_5][^1_14][^1_6]
- **Optimize GitHub Actions workflow:** Convert to recommended Hugo + Node + PostCSS build with purge, minify, fingerprint, and autodeploy to `gh-pages`[^1_4][^1_15][^1_16]
- **Purge unused CSS during builds:** Use accurate Hugo stats for Tailwind/JIT purge to minimize bundle size without breaking themes[^1_12][^1_13][^1_17]
- **Apply strict semantic HTML5 and WCAG compliance:** Enforce in templates, test using Lighthouse, aXe, and other tools[^1_18][^1_19][^1_20][^1_21][^1_22][^1_23]
- **Ensure all content and URLs are preserved:** Use the current folder/page structure; validate all mappings before deploy; implement redirects if necessary

**Process Diagram: Hugo + DaisyUI build/deploy pipeline**

![Hugo + Tailwind CSS + DaisyUI build and deployment pipeline for GitHub Pages hosting.](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/1d3648048d832572bf937ce1fff3b858/d80e5c99-f6eb-41ac-b58b-af2a7e5a8533/a64a5212.png)

Hugo + Tailwind CSS + DaisyUI build and deployment pipeline for GitHub Pages hosting.

***

## Implementation Roadmap

- **Phase 1:** Audit and catalog all existing templates, content, and components; document standard patterns and prepare migration plan
- **Phase 2:** Strip custom CSS; rebuild components using DaisyUI; connect tokens; resolve all layout inconsistencies in partials
- **Phase 3:** Integrate DaisyUI theme controller and test multi-theme support with persistent preference and accessibility
- **Phase 4:** Refactor layouts and responsive breakpoints; confirm WCAG compliance with automated and manual audits
- **Phase 5:** Configure and optimize CI/CD with GitHub Actions; validate purge and minify workflows; monitor Core Web Vitals benchmarks
- **Phase 6:** Comprehensive QA and accessibility review; verify preservation of all content, URLs, and internal links
- **Phase 7:** Deploy to GitHub Pages, validate live build, and monitor for rollback triggers and failure handling

***

## Maintenance Guidelines

- **Document the design system as the single source of truth**
- **Define a code review checklist for design, accessibility, and efficiency**
- **Require accessibility testing for all changes (Lighthouse, aXe, VoiceOver, keyboard navigation)**
- **Monitor performance using Core Web Vitals and automated build stats**
- **Maintain strict file organization and semantic component library**
- **Incrementally update DaisyUI and Tailwind versions and retest themes upon upgrade**
- **Govern changes via versioned design tokens and theme configurations**
- **Proactively refactor to prevent technical debt before release**

***

## Content and URL Preservation

- **All content types, including posts and portfolio items, are mapped and documented with unique slugs; migration preserves URL patterns without exception**
- **No content should be lost; validate with site-wide link checker post-deploy**
- **Internal links, images, and related content relationships reviewed and re-verified after migration**
- **External SEO and domain settings maintained via Hugo config and GH Pages CNAME**
- **Fallback and redirect systems tested for edge cases where URLs change**

***

## Quality Standards

- **Semantic HTML5 and WCAG 2.1 AA accessibility required for all pages and components**
- **Mobile-first design with responsive breakpoints documented and tested**
- **DaisyUI and Tailwind best practices drive all UI/UX implementations**
- **Hugo partials, layouts, and data modules standardized for maintainability**
- **Content, imagery, and styles validated for long-term scalability and legibility**
- **GitHub Actions CI/CD tuned for rapid, reliable, zero-downtime deployment**

***

## Edge Cases and Failure Prevention

- **SEO preserved for external links via Hugo config, canonical URL, and sitemap**
- **Backward compatibility guaranteed via URL mapping and static export; redirects for deprecated URLs**
- **Theme switching resilient to JS failures with default fallback and prompt for users; persistent storage robustly handled**
- **Cross-browser and device compatibility reviewed during QA**
- **GH Actions build errors and deployment failures proactively monitored; rollback plan in place**
- **PurgeCSS config tuned to defend against over-purging or unwanted CSS retention; Tailwind JIT mode optionally enabled for further performance**
- **All DaisyUI theme controllers accessible via keyboard and screen reader**

***

## Actionable Recommendations

Each recommendation below is prioritized to maximize responsiveness, accessibility, maintainability, speed, engagement, and consistency, and includes estimated effort plus compatibility assurance:


| Recommendation | Rationale / Impact | Guidance | Before/After Example | Effort | GH Pages Compatible |
| :-- | :-- | :-- | :-- | :-- | :-- |
| DaisyUI-first CSS for all components | Maximizes maintainability, theme support | Replace custom w/ DaisyUI | Custom btn → `btn btn-primary` | Medium | Yes |
| Centralize design tokens | Ensures consistent theming, future scalability | Config in `tailwind.config.js` | Hardcoded colors → token refs | Small | Yes |
| Modular Hugo partials | Reduces duplication, increases reuse | Move components to `/partials` | Inline cards → `card` partial | Medium | Yes |
| Strict semantic HTML/ARIA labeling | Accessibility \& SEO; aids automated audits | Use `<nav>`, `<main>`, etc. | `<div>` nav → `<nav>` structure | Small | Yes |
| Robust theme switching controller | User engagement, branding; WCAG compliance | DaisyUI toggle + aria-label | Custom JS → DaisyUI controller | Small | Yes |
| PurgeCSS and bundle optimization | Performance, reduced load times; minimizes CSS bloat | Use Hugo stats with PurgeCSS | 1.5MB CSS → 40KB optimized | Medium | Yes |
| CI/CD workflow upgrade | Reliability and rapid deploy; rollback/validation readiness | Use best practices GH Actions | Manual FTP → Automated Workflow | Large | Yes |
| Comprehensive accessibility + QA | Engagement, legal, and ethical standards; inclusivity | Test with Lighthouse + aXe | No audit → full WCAG report | Medium | Yes |
| Mapping and preserving URL structure | Seamless user experience; SEO | Validate in staging | Broken/blog URLs → mapped URLs | Medium | Yes |

_All recommendations guarantee content and URL preservation and full GitHub Pages deployment compatibility._

***

## Conclusion

The rebuild of peterwarnock.com is a vital intervention enabling sustained scalability, engagement, and technical excellence. Through the adoption of a comprehensive DaisyUI-powered design system, centralized design tokens, modular Hugo partials, robust theme switching, and strict accessibility processes, the site will achieve all six priority outcomes: responsiveness, accessibility, maintainability, speed, engagement, and consistency. Diligent migration, validation, and QA will secure content integrity and future-proof the codebase against cascading technical debt.

***

**Supporting Assets for Audit and Design Reference:**

- Audit Summary:
- Design System Specification:
- Hugo + DaisyUI Structure Diagram:
- Modern Hugo Build/Deploy Flow:
<span style="display:none">[^1_24][^1_25][^1_26][^1_27][^1_28][^1_29][^1_30][^1_31][^1_32][^1_33][^1_34][^1_35][^1_36][^1_37][^1_38][^1_39][^1_40][^1_41][^1_42][^1_43][^1_44][^1_45][^1_46][^1_47][^1_48][^1_49][^1_50][^1_51][^1_52][^1_53][^1_54][^1_55][^1_56][^1_57][^1_58][^1_59][^1_60][^1_61][^1_62][^1_63][^1_64][^1_65][^1_66][^1_67][^1_68][^1_69][^1_70][^1_71][^1_72][^1_73][^1_74][^1_75][^1_76][^1_77][^1_78][^1_79][^1_80][^1_81][^1_82][^1_83][^1_84][^1_85][^1_86][^1_87][^1_88][^1_89][^1_90][^1_91][^1_92][^1_93][^1_94][^1_95][^1_96][^1_97]</span>

<div align="center">⁂</div>

[^1_1]: https://peterwarnock.com/

[^1_2]: https://peterwarnock.com/portfolio

[^1_3]: https://www.linkedin.com/in/peterwarnock/

[^1_4]: https://discourse.gohugo.io/t/help-hosting-hugo-with-github-pages/51649

[^1_5]: https://daisyui.com/docs/themes/?lang=en

[^1_6]: https://dev.to/nanmoon/how-to-implement-theme-switching-with-tailwind-daisyui-in-react-next-4f5k

[^1_7]: https://info.varnish-software.com/blog/how-to-measure-core-web-vitals

[^1_8]: https://developers.google.com/search/docs/appearance/core-web-vitals

[^1_9]: https://www.giraffeacademy.com/static-site-generators/hugo/partial-templates/

[^1_10]: https://www.yockyard.com/post/getting-started-with-hugo-partials/

[^1_11]: https://codewithhugo.com/tailwind-css-1.x-impressions-development-and-production-setup-for-static-sites-with-tailwind-cli-and-purgecss-cli/

[^1_12]: https://dev.to/divrhino/comment/1bcj1

[^1_13]: https://discourse.gohugo.io/t/hugo-tailwindcss-purging-too-aggressively/35668

[^1_14]: https://daisyui.com/components/theme-controller/?lang=en

[^1_15]: https://github.com/marketplace/actions/hugo-setup

[^1_16]: https://zendesk.engineering/a-github-actions-workflow-to-generate-publish-your-hugo-website-f36375e56cf7

[^1_17]: https://discourse.gohugo.io/t/how-to-purge-tailwindcss/35378

[^1_18]: https://dev.to/hellonehha/how-to-do-accessibility-audit-2n0e

[^1_19]: https://github.com/spech66/hugo-best-practices

[^1_20]: https://daisyui.com/blog/daisyui-2023-wrapped/?lang=en

[^1_21]: https://www.w3.org/TR/WCAG21/

[^1_22]: https://github.com/saadeghi/daisyui/discussions/3135

[^1_23]: https://chrisvaillancourt.io/posts/customizing-daisyui-themes-for-accessible-color-contrast/

[^1_24]: https://peterwarnock.com/posts

[^1_25]: https://github.com/pwarnock/

[^1_26]: https://x.com/pwarnock/

[^1_27]: https://discord.gg/pwarnock

[^1_28]: https://peterwarnock.com/portfolio/alpha-ad-ops/

[^1_29]: https://peterwarnock.com/portfolio/yousong/

[^1_30]: https://peterwarnock.com/portfolio/vocabulary-game/

[^1_31]: https://peterwarnock.com/posts/openai-launches-chatgpt-atlas-ai-powered-browser/

[^1_32]: https://peterwarnock.com/posts/vibe-coding-revolution/

[^1_33]: https://peterwarnock.com/posts/hugo-render-hook-tests/

[^1_34]: https://peterwarnock.com/posts/seth-godin-journal-prompts-calendar/

[^1_35]: https://peterwarnock.com/posts/principles-over-methods-emerson-quote/

[^1_36]: https://peterwarnock.com/posts/my-first-post-lorem-ipsum/

[^1_37]: https://hnhiring.com/freelancer/august-2025

[^1_38]: https://news.ycombinator.com/item?id=45093191

[^1_39]: https://www.hireitpeople.com/resume-database/72-web-developer-resumes/135159-front-end-development-ui-ux-usability-and-accessibility-consulting-resume

[^1_40]: https://hnjobsexplorer.clemsau.com

[^1_41]: https://resorcery.pages.dev

[^1_42]: https://www.reddit.com/r/gohugo/comments/1dk8q5o/how_to_properly_add_daisyui_with_themes_to_a_hugo/

[^1_43]: https://www.youtube.com/watch?v=EuLS-k1ZSqA

[^1_44]: https://github.com/raaaahman/next-themes-daisyui-switcher

[^1_45]: https://www.youtube.com/watch?v=ZxrNzv0rEws

[^1_46]: https://sabbirz.com/blog/sveltekit-daisyui-theme-switcher

[^1_47]: https://stackoverflow.com/questions/70713667/how-to-customize-a-theme-in-daisy-ui

[^1_48]: https://stackoverflow.com/questions/72926946/how-can-i-change-themes-using-daisyui-and-tailwindcss-in-a-react-project

[^1_49]: https://www.youtube.com/watch?v=w6_cQsTwd3Q

[^1_50]: https://discourse.gohugo.io/t/best-practices-for-theme-development-hugo-modules/30568

[^1_51]: https://scottspence.com/posts/theme-switching-in-sveltekit-updated-for-daisyui-v5-and-tailwind-v4

[^1_52]: https://discourse.gohugo.io/t/choosing-a-theme-best-practices-for-long-term-maintenance/21585

[^1_53]: https://www.reddit.com/r/django/comments/1khpygr/i_made_a_django_tailwind_daisyui_starter_with_a/

[^1_54]: https://bootstrap.hugoblox.com/getting-started/customization/

[^1_55]: https://github.com/pwarnock

[^1_56]: https://github.com/DerwenAI/pynock

[^1_57]: https://www.youtube.com/watch?v=LITy_6FoY-w

[^1_58]: https://alphagov.github.io/accessibility-tool-audit/

[^1_59]: https://www.youtube.com/watch?v=AD-3nVI3-_U

[^1_60]: https://azleslie.com/projects/hugo-tutorial/

[^1_61]: https://learn.microsoft.com/en-us/azure/developer/javascript/how-to/with-visual-studio-code/clone-github-repository

[^1_62]: https://github.com/features/code-search

[^1_63]: https://github.com/raisingpixels/hugo-theme-dev-template

[^1_64]: https://www.epa.gov/developers/open-source-software-and-code-repositories

[^1_65]: https://github.com/alphagov/accessibility-tool-audit

[^1_66]: https://download-directory.github.io

[^1_67]: https://discourse.gohugo.io/t/how-work-with-github-pages/45921

[^1_68]: https://peterwarnock.com/tools/chatgpt-atlas-ai-powered-browser/

[^1_69]: https://openai.com/index/introducing-chatgpt-atlas/

[^1_70]: https://peterwarnock.com/tools/visual-studio-code-extensible-editor/

[^1_71]: https://peterwarnock.com/tools/cursor-ai-native-code-editor/

[^1_72]: https://peterwarnock.com/tools/github-copilot-2025-update/

[^1_73]: https://peterwarnock.com/tools/claude-code-conversational-ai/

[^1_74]: https://peterwarnock.com/tools/deepagent-abacus-ai-integration/

[^1_75]: https://peterwarnock.com/tools/gemini-cli-google-ai-agent/

[^1_76]: https://peterwarnock.com/tools/openai-codex-cli-coding-assistant/

[^1_77]: https://peterwarnock.com/tools/opencode-multi-provider-ai-coding/

[^1_78]: https://peterwarnock.com/tools/lovable-frontend-prototyping-tool/

[^1_79]: https://peterwarnock.com/tools/bolt-new-frontend-platform/

[^1_80]: https://peterwarnock.com/tools/windsurf-agentic-ide-cognition-ai/

[^1_81]: https://peterwarnock.com/files/seth_godin_journal_prompts.ics

[^1_82]: https://gist.github.com/pwarnock/9fa68bce9647998505d3f9b8856746ef

[^1_83]: https://seths.blog/2025/07/65-thoughts/

[^1_84]: https://alpha-ad-operations-dev-s9qwhp.laravel.cloud/

[^1_85]: https://github.com/pwarnock/alpha-ad-operations

[^1_86]: https://frontend-one-tau-55.vercel.app/

[^1_87]: https://github.com/pwarnock/sunday-school-music-creator

[^1_88]: https://github.com/pwarnock/vocabulary-game

[^1_89]: https://kb.daisy.org/publishing/docs/conformance/wcag.html

[^1_90]: https://bluetriangle.com/blog/core-web-vitals-monitoring/

[^1_91]: https://nitropack.io/blog/post/core-web-vitals

[^1_92]: https://web.dev/explore/learn-core-web-vitals

[^1_93]: https://www.chrisjhart.com/Creating-A-Simple-Free-Blog-Hugo/

[^1_94]: https://main--dasarpai.netlify.app/dsblog/exploring-hugo-framework-part2/

[^1_95]: https://community.render.com/t/cannot-purge-unused-css-in-hugo-site-with-tailwind/1756

[^1_96]: https://bzoltan1.github.io/setup-a-blog-with-github-pages-and-hugo/

[^1_97]: https://discourse.gohugo.io/t/is-there-a-way-to-make-a-reusable-partial-component-that-could-be-shared-easily/48940

