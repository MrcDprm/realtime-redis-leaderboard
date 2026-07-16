const redis = require('../config/redis');
const config = require('../config');

async function cacheUsername(userId, username) {
  await redis.hset(config.usernamesHashKey, userId, username);
}

/**
 * Atomic high-score update via Redis ZADD GT.
 * Score is only written when it is greater than the member's current score.
 * @returns {{ updated: boolean, bestScore: number }}
 */
async function updateHighScore(userId, score) {
  const previousRaw = await redis.zscore(config.leaderboardKey, userId);
  await redis.zadd(config.leaderboardKey, 'GT', score, userId);
  const bestScore = Number(await redis.zscore(config.leaderboardKey, userId));
  const previous = previousRaw === null ? null : Number(previousRaw);
  const updated = previous === null || bestScore > previous;

  return {
    updated,
    bestScore: Number.isFinite(bestScore) ? bestScore : score,
  };
}

/**
 * 100% Redis read path: ZREVRANGE for ranks, pipelined HMGET for usernames.
 */
async function getTopLeaderboard(limit = config.leaderboardTopN) {
  const raw = await redis.zrevrange(config.leaderboardKey, 0, limit - 1, 'WITHSCORES');
  if (!raw.length) {
    return [];
  }

  const entries = [];
  for (let i = 0; i < raw.length; i += 2) {
    entries.push({
      userId: raw[i],
      score: Number(raw[i + 1]),
      rank: entries.length + 1,
    });
  }

  const userIds = entries.map((e) => e.userId);
  const pipeline = redis.pipeline();
  pipeline.hmget(config.usernamesHashKey, ...userIds);
  const results = await pipeline.exec();
  const usernames = results[0][1] || [];

  return entries.map((entry, index) => ({
    ...entry,
    username: usernames[index] || 'Unknown',
  }));
}

async function getUserRankAndScore(userId) {
  const [rank, score] = await Promise.all([
    redis.zrevrank(config.leaderboardKey, userId),
    redis.zscore(config.leaderboardKey, userId),
  ]);

  if (rank === null || score === null) {
    return { rank: null, bestScore: null };
  }

  return {
    rank: rank + 1,
    bestScore: Number(score),
  };
}

module.exports = {
  cacheUsername,
  updateHighScore,
  getTopLeaderboard,
  getUserRankAndScore,
};
