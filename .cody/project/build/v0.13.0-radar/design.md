# Version Design Document : v0.13.0-radar

Technical implementation and design guide for the upcoming version.

## 1. Features Summary
_Overview of features included in this version._

This version adds radar metadata to the existing tools section to prepare for future ThoughtWorks BYOR (Build Your Own Radar) integration. It also refactors the about page to eliminate duplicate content and strengthen messaging for SEO and recruiting. The tools section remains as-is, but enhanced with radar-specific metadata and visual badges.

**Features:**
- Add quadrant and ring properties to all tools content frontmatter ✓
- Create build template to generate `/tools/radar.json` from tools content ✓
- Display radar badges (quadrant + ring) on all tool cards
- Add link to interactive radar view from tools section
- Refactor about page to eliminate duplicate content ✓
- Enhance about page SEO with clearer messaging ✓
- Improve about page layout and styling ✓

**Quadrants:** Techniques, Platforms, Tools, Languages & Frameworks
**Rings:** Adopt, Trial, Assess, Hold

## 2. Technical Architecture Overview
_High-level technical structure that supports all features in this version._

This is a data structure enhancement that builds on the existing Hugo tools section:

- **Hugo Frontmatter Enhancement**: Extend existing tool content with radar metadata
- **JSON Generation Template**: Create Hugo data template that exports tools with radar properties as JSON
- **Static Display Enhancement**: Update tools list/single page templates to show radar metadata
- **Content Validation**: Ensure all tools have complete radar assignments

## 3. Implementation Notes
_Shared technical considerations across all features in this version._

- **Backward Compatibility**: All changes must preserve existing tools functionality
- **Styling Consistency**: Use existing design system and CSS classes for radar display
- **JSON Structure**: Follow ThoughtWorks BYOR format for future integration
- **Content Management**: Frontmatter should be easy to maintain and update

**Frontmatter Structure:**
```yaml
radar:
  quadrant: "Techniques" | "Platforms" | "Tools" | "Languages & Frameworks"
  ring: "Adopt" | "Trial" | "Assess" | "Hold"
```

## 4. Other Technical Considerations
_Shared any other technical information that might be relevant to building this version._

- **Build Process**: JSON generation should be part of Hugo build, not manual process
- **URL Structure**: Tools section URLs remain unchanged (`/tools/tool-slug`)
- **SEO Impact**: New metadata should not affect existing SEO optimization
- **Performance**: Minimal impact on page load times with static display

## 5. Open Questions
_Unresolved technical or product questions affecting this version._

- Should the radar.json be publicly accessible or restricted?
- Do we need a dedicated radar page or is enhanced tools section sufficient?
- How should tools be sorted or filtered by quadrant/ring in the future?