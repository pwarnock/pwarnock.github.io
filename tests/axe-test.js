const { test: base, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');

module.exports = base.extend({
  async page({ page }, use) {
    await injectAxe(page);
    await use(page);
  },
  async axe({ page }, use) {
    await use(options => checkA11y(page, options));
  },
});

module.exports.expect = expect;
