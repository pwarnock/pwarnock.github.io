import { setupLogfire } from './logfire.setup';

async function globalSetup() {
  // Initialize telemetry before tests start
  setupLogfire();
  return async () => {
    // Global cleanup if needed
    console.log('🧹 Global test cleanup completed');
  };
}

export default globalSetup;
