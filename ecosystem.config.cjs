const { execSync } = require('child_process');

let hash = 'dev';
try {
  hash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  console.warn('Failed to get git hash:', e.message);
}

module.exports = {
  apps: [
    {
      name: 'hugo-dev',
      script: 'hugo',
      args: [
        'server',
        '--buildDrafts',
        '--buildFuture', 
        '--disableFastRender',
        '--port', '1313',
        '--config', 'config/development/hugo.toml,hugo.toml',
      ],
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        HUGO_ENV: 'development',
        HUGO_VERSION_HASH: hash,
      },
      error_file: './.pids/hugo-dev-error-0.log',
      out_file: './.pids/hugo-dev-out-0.log',
      log_file: './.pids/hugo-dev.log',
      time: true,
    },
  ],
};
