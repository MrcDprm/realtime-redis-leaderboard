const {
  getTopLeaderboard,
  getUserRankAndScore,
} = require('../services/leaderboardService');

async function getLeaderboard(_req, res) {
  try {
    const leaderboard = await getTopLeaderboard();
    return res.json({ leaderboard });
  } catch (error) {
    console.error('[leaderboard]', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
}

async function getMyRank(req, res) {
  try {
    const { rank, bestScore } = await getUserRankAndScore(req.user.id);
    return res.json({
      userId: req.user.id,
      username: req.user.username,
      rank,
      bestScore,
    });
  } catch (error) {
    console.error('[leaderboard/me]', error);
    return res.status(500).json({ error: 'Failed to fetch your rank.' });
  }
}

module.exports = { getLeaderboard, getMyRank };
