const http = require('http');
const env = require('./config/env');
const app = require('./app');
const prisma = require('./config/prisma');

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`Euro GoCart API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Prisma disconnected');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown', err);
      process.exit(1);
    }
  });

  // Force exit if connections hang
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
