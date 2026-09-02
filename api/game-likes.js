import crypto from 'node:crypto';

const OWNER = 'jmita2288-debug';
const REPO = 'xtoybox-apk-download';
const DATA_BRANCH = 'data/game-likes';
const API_VERSION = '2022-11-28';
const MAX_USERS_PER_GAME = 100000;

function getWriteToken() {
  return (
    process.env.SITE_REPO_TOKEN ||
    process.env.GITHUB_STATS_TOKEN ||
    process.env.GH_TOKEN ||
    ''
  );
}

function getHashSecret() {
  return process.env.XTOYBOX_LIKES_SECRET || getWriteToken();
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'xtoybox-game-likes',
    'X-GitHub-Api-Version': API_VERSION,
  };
}

function normalizeGameId(value) {
  const id = String(value || '').trim();
  if (!id || id.length > 160 || !/^[A-Za-z0-9._:-]+$/.test(id)) return '';
  return id;
}

function normalizeUserId(value) {
  const id = String(value || '').trim();
  if (!/^\d{5,32}$/.test(id)) return '';
  return id;
}

function gameFilePath(gameId) {
  const digest = crypto.createHash('sha256').update(gameId).digest('hex');
  return `game-likes/${digest.slice(0, 40)}.json`;
}

function userHash(userId, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(`xtoybox-like:${userId}`)
    .digest('hex')
    .slice(0, 40);
}

function decodeContent(content) {
  try {
    return JSON.parse(Buffer.from(String(content || ''), 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

async function readGameData(gameId, token) {
  const path = gameFilePath(gameId);
  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${encodeURIComponent(DATA_BRANCH)}&t=${Date.now()}`,
    {cache: 'no-store', headers: githubHeaders(token)},
  );

  if (response.status === 404) {
    return {path, sha: '', data: {gameId, users: []}};
  }
  if (!response.ok) {
    throw new Error(`GitHub read failed: ${response.status}`);
  }

  const body = await response.json();
  const parsed = decodeContent(body?.content);
  const users = Array.isArray(parsed?.users)
    ? parsed.users.filter(value => typeof value === 'string').slice(0, MAX_USERS_PER_GAME)
    : [];
  return {
    path,
    sha: String(body?.sha || ''),
    data: {gameId, users: Array.from(new Set(users))},
  };
}

async function writeGameData(gameId, users, token, previousSha) {
  const path = gameFilePath(gameId);
  const payload = {
    gameId,
    count: users.length,
    users,
    updatedAt: new Date().toISOString(),
  };
  const body = {
    message: `likes: ${gameId} (${users.length})`,
    content: Buffer.from(`${JSON.stringify(payload)}\n`, 'utf8').toString('base64'),
    branch: DATA_BRANCH,
    ...(previousSha ? {sha: previousSha} : {}),
  };

  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: githubHeaders(token),
    body: JSON.stringify(body),
  });
}

async function toggleLike(gameId, userId, token, secret) {
  const hashedUser = userHash(userId, secret);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const current = await readGameData(gameId, token);
    const users = new Set(current.data.users);
    const likedBefore = users.has(hashedUser);

    if (likedBefore) users.delete(hashedUser);
    else users.add(hashedUser);

    if (users.size > MAX_USERS_PER_GAME) {
      const error = new Error('Limite de Likes atingido para este jogo.');
      error.statusCode = 503;
      throw error;
    }

    const nextUsers = Array.from(users).sort();
    const response = await writeGameData(gameId, nextUsers, token, current.sha);
    if (response.ok) {
      return {count: nextUsers.length, liked: !likedBefore};
    }

    if ((response.status === 409 || response.status === 422) && attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 80 * (attempt + 1)));
      continue;
    }

    const text = await response.text().catch(() => '');
    const error = new Error(`GitHub write failed: ${response.status} ${text}`);
    error.statusCode = response.status === 401 || response.status === 403 ? 503 : 502;
    throw error;
  }

  throw new Error('Falha ao atualizar Like por concorrencia.');
}

function setCommonHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCommonHeaders(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = getWriteToken();
  const secret = getHashSecret();
  if (!token || !secret) {
    return res.status(503).json({error: 'Likes indisponiveis'});
  }

  try {
    if (req.method === 'GET') {
      const gameId = normalizeGameId(req.query?.gameId);
      if (!gameId) return res.status(400).json({error: 'gameId invalido'});
      const current = await readGameData(gameId, token);
      return res.status(200).json({gameId, count: current.data.users.length});
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST, OPTIONS');
      return res.status(405).json({error: 'Metodo nao permitido'});
    }

    const gameId = normalizeGameId(req.body?.gameId);
    const userId = normalizeUserId(req.body?.userId);
    const action = String(req.body?.action || 'status');
    if (!gameId || !userId) {
      return res.status(400).json({error: 'Dados invalidos'});
    }

    const hashedUser = userHash(userId, secret);
    if (action === 'status') {
      const current = await readGameData(gameId, token);
      return res.status(200).json({
        gameId,
        count: current.data.users.length,
        liked: current.data.users.includes(hashedUser),
      });
    }

    if (action === 'toggle') {
      const result = await toggleLike(gameId, userId, token, secret);
      return res.status(200).json({gameId, ...result});
    }

    return res.status(400).json({error: 'Acao invalida'});
  } catch (error) {
    console.error('[game-likes]', error?.message || error);
    return res.status(Number(error?.statusCode || 500)).json({
      error: 'Falha ao processar Like',
    });
  }
}
