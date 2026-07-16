const http = require('http');
const { Server } = require('socket.io');
const { createApp } = require('./app');
const config = require('./config');
const redis = require('./config/redis');
const prisma = require('./config/prisma');
const { getTopLeaderboard } = require('./services/leaderboardService');

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  app.set('io', io);

  io.on('connection', async (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    try {
      const leaderboard = await getTopLeaderboard();
      socket.emit('leaderboard_update', { leaderboard });
    } catch (error) {
      console.error('[socket] failed to send initial leaderboard:', error.message);
    }

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });

  server.listen(config.port, () => {
    console.log(`[server] listening on port ${config.port} (${config.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(async () => {
      io.close();
      await prisma.$disconnect();
      redis.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('[bootstrap] fatal:', error);
  process.exit(1);
});
