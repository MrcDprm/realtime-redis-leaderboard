const prisma = require('../config/prisma');

async function listGames(_req, res) {
  try {
    const games = await prisma.game.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json({ games });
  } catch (error) {
    console.error('[games]', error);
    return res.status(500).json({ error: 'Failed to fetch games.' });
  }
}

module.exports = { listGames };
