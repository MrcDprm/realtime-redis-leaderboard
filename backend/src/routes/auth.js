const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const config = require('../config');
const { cacheUsername } = require('../services/leaderboardService');

function signToken(user) {
  return jwt.sign(
    { username: user.username },
    config.jwtSecret,
    { subject: user.id, expiresIn: config.jwtExpiresIn }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: String(username).trim() },
          { email: String(email).trim().toLowerCase() },
        ],
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'Username or email already in use.' });
    }

    const hashed = await bcrypt.hash(String(password), 12);
    const user = await prisma.user.create({
      data: {
        username: String(username).trim(),
        email: String(email).trim().toLowerCase(),
        password: hashed,
      },
    });

    await cacheUsername(user.id, user.username);

    const token = signToken(user);
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error('[auth/register]', error);
    return res.status(500).json({ error: 'Registration failed.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(String(password), user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Keep Redis username hash warm on every login (covers cache rebuilds).
    await cacheUsername(user.id, user.username);

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (error) {
    console.error('[auth/login]', error);
    return res.status(500).json({ error: 'Login failed.' });
  }
}

module.exports = { register, login };
