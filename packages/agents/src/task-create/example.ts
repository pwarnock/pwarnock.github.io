/**
 * Task Create Agent Example
 *
 * Demonstrates usage of the TaskCreateAgent for creating Beads issues
 * from natural language input.
 */

import { TaskCreateAgent } from './task-create-agent.js';

async function main() {
  console.log('Task Create Agent Example\n');

  // Initialize agent
  const agent = new TaskCreateAgent();
  await agent.initialize();
  console.log('✓ Agent initialized\n');

  // Example 1: Bug with urgent priority
  console.log('Example 1: Urgent bug');
  console.log('Input: "urgent: fix authentication error in login"');
  const result1 = await agent.createTask({
    text: 'urgent: fix authentication error in login',
  });
  console.log(`Result: ${JSON.stringify(result1, null, 2)}\n`);

  // Example 2: Feature with normal priority
  console.log('Example 2: Feature request');
  console.log('Input: "add user dashboard with analytics"');
  const result2 = await agent.createTask({
    text: 'add user dashboard with analytics',
  });
  console.log(`Result: ${JSON.stringify(result2, null, 2)}\n`);

  // Example 3: Documentation task
  console.log('Example 3: Documentation task');
  console.log('Input: "update API documentation for new endpoints"');
  const result3 = await agent.createTask({
    text: 'update API documentation for new endpoints',
  });
  console.log(`Result: ${JSON.stringify(result3, null, 2)}\n`);

  // Example 4: Refactoring with low priority
  console.log('Example 4: Low priority refactor');
  console.log('Input: "low priority: refactor database queries for performance"');
  const result4 = await agent.createTask({
    text: 'low priority: refactor database queries for performance',
  });
  console.log(`Result: ${JSON.stringify(result4, null, 2)}\n`);

  // Example 5: Test coverage
  console.log('Example 5: Test coverage');
  console.log('Input: "add unit tests for authentication module"');
  const result5 = await agent.createTask({
    text: 'add unit tests for authentication module',
  });
  console.log(`Result: ${JSON.stringify(result5, null, 2)}\n`);

  // Show supported types
  console.log('Supported Types:');
  console.log(agent.getSupportedTypes().join(', '));
  console.log();

  // Show common tags
  console.log('Common Tags (first 10):');
  console.log(agent.getCommonTags().slice(0, 10).join(', '));
  console.log();
}

// Run example if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
