#!/usr/bin/env k6

/**
 * Load Testing Scenarios for k6
 *
 * Usage: k6 run scripts/load-testing.js
 * Feature Flag: Set flags.load_testing.enabled = true to enable
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Test configuration
const BASE_URL = 'http://localhost:1313'; // Development URL
const THRESHOLDS = {
  http_req_duration: ['p(95)<2000'], // 95th percentile < 2s
  http_req_failed: ['rate<0.1'], // < 10% failure rate
};

// Test scenarios
export const options = {
  scenarios: {
    // 100 concurrent users
    low_load: {
      executor: 'constant-vus',
      vus: 100,
      duration: '2m',
      gracefulStop: '30s',
    },

    // 500 concurrent users
    medium_load: {
      executor: 'constant-vus',
      vus: 500,
      duration: '2m',
      gracefulStop: '30s',
    },

    // 1000 concurrent users
    high_load: {
      executor: 'constant-vus',
      vus: 1000,
      duration: '2m',
      gracefulStop: '30s',
    },
  },

  thresholds: THRESHOLDS,
};

// Key pages to test
const PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/portfolio/', name: 'Portfolio' },
  { path: '/tools/', name: 'Tools' },
  { path: '/blog/', name: 'Blog' },
  { path: '/about/', name: 'About' },
];

// Custom metrics
const pageResponseTime = new Rate('page_response_time');
const pageErrors = new Rate('page_errors');

// Helper function to test a page
function testPage(path, name) {
  const response = http.get(`${BASE_URL}${path}`, {
    tags: {
      page: name,
      path: path,
    },
  });

  const success = check(
    response,
    {
      'page loads successfully': r => r.status === 200,
      'page loads quickly': r => r.timings.duration < 2000,
      'page has content': r => r.body.length > 0,
      'page is HTML': r => r.headers['Content-Type'].includes('text/html'),
    },
    {
      page: name,
      path: path,
    }
  );

  // Record custom metrics
  if (success) {
    pageResponseTime.add(true, { page: name });
  } else {
    pageErrors.add(true, { page: name });
  }

  // Brief pause between requests
  sleep(Math.random() * 3 + 1); // 1-4s random pause

  return {
    success,
    response_time: response.timings.duration,
    status: response.status,
  };
}

// Main test function
export default function () {
  // Pick a random page to test
  const page = PAGES[Math.floor(Math.random() * PAGES.length)];

  testPage(page.path, page.name);
}

// Setup function
export function setup() {
  console.log(`🚀 Starting load testing against ${BASE_URL}`);
  console.log(`📊 Testing ${PAGES.length} pages with various load levels`);
  console.log(`⏱️  Response time threshold: <2s (95th percentile)`);
  console.log(`❌ Error rate threshold: <10%`);
}

// Teardown function
export function teardown(data) {
  console.log(`📈 Load testing completed`);
  console.log(`📊 Pages tested: ${PAGES.length}`);
  console.log(`⏱️  Response times recorded for all scenarios`);
  console.log(`📋 Check k6 HTML report for detailed metrics`);
}
