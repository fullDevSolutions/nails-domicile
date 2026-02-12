// PM2 Configuration for Nails Domicile
// Usage: pm2 start ecosystem.config.js --env production

module.exports = {
  apps: [{
    name: 'nails-demo',
    script: 'server/server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '300M',

    // Environnements
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },

    // Logs
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,

    // Restart policy
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '10s',

    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true
  }],

  // Deploy configuration (pm2 deploy)
  deploy: {
    production: {
      user: 'deploy',
      host: 'YOUR_VPS_IP',
      ref: 'origin/main',
      repo: 'git@github-fullDev:fullDevSolutions/nails-domicile.git',
      path: '/var/www/nails-domicile',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --omit=dev && npx knex migrate:latest && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
