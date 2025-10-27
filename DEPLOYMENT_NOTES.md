# Deployment Notes & Critical Fixes

## 🚨 CRITICAL: CSS Processing Issue

### Problem
When moving CSS files from `assets/` to `static/` to bypass PostCSS issues, the CSS file still contained unprocessed Tailwind directives:
```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: all;
}
```

### Solution
**ALWAYS** process CSS with Tailwind CLI before moving to static:
```bash
npx tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --postcss
```

### Why This Happens
- Hugo's `assets/` directory processes files with PostCSS
- Moving to `static/` bypasses PostCSS processing
- Unprocessed `@import` directives break styling
- CSS loads but contains no actual styles

### Prevention Checklist
Before any deployment:
1. ✅ Check if CSS contains `@import` or `@plugin` directives
2. ✅ If yes, process with Tailwind CLI first
3. ✅ Verify generated CSS contains actual utility classes
4. ✅ Test locally before pushing

## 🔄 Deployment Process

### Standard Deployment
```bash
# 1. Build and test locally
npm run build

# 2. If CSS issues, process manually
npx tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --postcss

# 3. Test again
npm run build

# 4. Commit and push
git add .
git commit -m "deployment: ..."
git push upstream main
```

### CI/CD Pipeline Issues
- PostCSS binary not found in CI environment
- Solution: Pre-process CSS or use static files
- Never rely on Hugo's PostCSS in CI

## 📋 Pre-Deployment Checklist

### CSS Validation
- [ ] CSS file contains actual styles (not just @import directives)
- [ ] All Tailwind classes are present in compiled CSS
- [ ] DaisyUI components are styled correctly
- [ ] No PostCSS processing errors

### Build Validation
- [ ] `npm run build` completes successfully
- [ ] 209+ pages generated
- [ ] No CSS processing errors
- [ ] Site loads correctly in dev server

### Git Validation
- [ ] All changes committed
- [ ] Pushed to upstream/main
- [ ] CI/CD pipeline completes successfully

## 🚨 Recovery Steps

If Site Styling Breaks:
1. **Immediate**: Check CSS file content
2. **Process**: `npx tailwindcss -i ./assets/css/main.css -o ./static/css/main.css --postcss`
3. **Test**: `npm run build`
4. **Deploy**: Commit and push

## 📝 Lessons Learned

1. **Never bypass PostCSS without processing CSS first**
2. **Always verify CSS contains actual styles, not directives**
3. **Test locally after any CSS changes**
4. **Document CSS processing requirements**

---

**Last Updated**: October 27, 2025  
**Critical Issue**: CSS processing with Tailwind directives  
**Status**: RESOLVED - Pre-process CSS with Tailwind CLI