module.exports = {
  apps: [
    {
      name: 'hugo-dev',
      script: 'bash',
      args: [
        '-c',
        'node scripts/generate-version.js && hugo server --buildDrafts --buildFuture --disableFastRender --port 1313',
      ],
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      error_file: './.pids/hugo-dev-error-0.log',
      out_file: './.pids/hugo-dev-out-0.log',
      log_file: './.pids/hugo-dev.log',
      time: true,
    },
  ],
};
