import logfire from 'logfire';

export function setupLogfire() {
  const token = process.env.LOGFIRE_TOKEN;

  // Configure Logfire
  // Using any cast for config object as I don't have the type definition handy
  // and the package seems to be the JS API client.
  logfire.configureLogfireApi({
    token: token || '',
    serviceName: 'playwright-e2e',
    environment: process.env.LOGFIRE_ENVIRONMENT || 'test',
    // Add CI correlation tag
    tags: process.env.GITHUB_RUN_ID ? [`run:${process.env.GITHUB_RUN_ID}`] : ['run:local'],
  } as any);

  if (!token) {
    console.log('Logfire: No token provided, observability will be disabled/local-only.');
  }

  return logfire;
}

export const logger = logfire;
