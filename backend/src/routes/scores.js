const prisma = require('../config/prisma');
const {
  updateHighScore,
  getTopLeaderboard,
} = require('../services/leaderboardService');

async function submitScore(req, res) {
  try {
    const { gameId, score } = req.body;
    const userId = req.user.id;

    if (!gameId || score === undefined || score === null) {
      return res.status(400).json({ error: 'gameId and score are required.' });
    }

    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore < 0 || !Number.isInteger(numericScore)) {
      return res.status(400).json({ error: 'score must be a non-negative integer.' });
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return res.status(404).json({ error: 'Game not found.' });
    }

    const history = await prisma.scoreHistory.create({
      data: {
        userId,
        gameId,
        score: numericScore,
      },
    });

    const { updated, bestScore } = await updateHighScore(userId, numericScore);
    const leaderboard = await getTopLeaderboard();

    const io = req.app.get('io');
    if (io) {
      io.emit('leaderboard_update', { leaderboard });
    }

    return res.status(201).json({
      history,
      bestScore,
      highScoreUpdated: updated,
      leaderboard,
    });
  } catch (error) {
    console.error('[scores]', error);
    return res.status(500).json({ error: 'Failed to submit score.' });
  }
}

module.exports = { submitScore };
