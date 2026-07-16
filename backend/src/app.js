const express = require('express');
const cors = require('cors');
const config = require('./config');
const { authenticate } = require('./middleware/auth');
const { scoreRateLimiter } = require('./middleware/rateLimit');
const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const scoresRoutes = require('./routes/scores');
const leaderboardRoutes = require('./routes/leaderboard');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'realtime-leaderboard-api' });
  });

  app.post('/api/auth/register', authRoutes.register);
  app.post('/api/auth/login', authRoutes.login);

  app.get('/api/games', authenticate, gamesRoutes.listGames);

  app.post('/api/scores', authenticate, scoreRateLimiter, scoresRoutes.submitScore);

  app.get('/api/leaderboard', leaderboardRoutes.getLeaderboard);
  app.get('/api/leaderboard/me', authenticate, leaderboardRoutes.getMyRank);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found.' });
  });

  app.use((err, _req, res, _next) => {
    console.error('[unhandled]', err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}

module.exports = { createApp };
