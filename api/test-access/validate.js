const crypto = require('crypto');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
};

const normalizeKey = value => String(value || '').trim().replace(/\s+/g, '').toUpperCase();
const now = () => Date.now();
const sha256 = value => crypto.createHash('sha256').update(String(value || '')).digest('hex');

const json = (res, status, payload) => {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.status(status).json(payload);
};

const parseKeyConfig = () => {
  const raw = process.env.TEST_ACCESS_KEYS;
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_error) {
    return null;
  }
};

const kvUrl = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const runKvCommand = async (command, ...args) => {
  const baseUrl = kvUrl();
  const token = kvToken();

  if (!baseUrl || !token) {
    throw new Error('KV_NOT_CONFIGURED');
  }

  const encoded = [command, ...args].map(part => encodeURIComponent(String(part))).join('/');
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/${encoded}`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`},
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(`KV_COMMAND_FAILED_${command}`);
  }

  return data ? data.result : null;
};

const kvGetJson = async key => {
  const raw = await runKvCommand('get', key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
};

const isVersionAllowed = (rule, versionName) => {
  if (!Array.isArray(rule.allowedVersions) || !rule.allowedVersions.length) {
    return true;
  }

  return rule.allowedVersions.includes(versionName);
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return json(res, 405, {
      valid: false,
      reason: 'method_not_allowed',
      message: 'Metodo nao permitido.',
    });
  }

  const config = parseKeyConfig();
  if (!config) {
    return json(res, 500, {
      valid: false,
      reason: 'server_config_missing',
      message: 'Servidor de teste nao configurado.',
    });
  }

  const key = normalizeKey(req.body?.key);
  const installId = String(req.body?.installId || '').trim();
  const versionName = String(req.body?.versionName || '').replace(/^v/i, '').trim();

  if (!key) {
    return json(res, 400, {
      valid: false,
      reason: 'empty_key',
      message: 'Digite a chave de teste.',
    });
  }

  if (!installId) {
    return json(res, 400, {
      valid: false,
      reason: 'missing_install_id',
      message: 'Nao foi possivel identificar esta instalacao.',
    });
  }

  const rule = config[key];
  if (!rule || rule.active === false) {
    return json(res, 403, {
      valid: false,
      reason: 'invalid_key',
      message: 'Chave de teste invalida.',
    });
  }

  if (!isVersionAllowed(rule, versionName)) {
    return json(res, 403, {
      valid: false,
      reason: 'version_not_allowed',
      message: 'Esta chave nao esta liberada para esta versao de teste.',
    });
  }

  const keyId = String(rule.keyId || sha256(key).slice(0, 16));
  const durationMinutes = Number(rule.durationMinutes || 60);
  const maxActivations = Number(rule.maxActivations || 0);
  const durationMs = Math.max(1, durationMinutes) * 60 * 1000;
  const currentTime = now();
  const installHash = sha256(`${keyId}:${installId}`);
  const activationKey = `test-access:activation:${keyId}:${installHash}`;
  const activationSetKey = `test-access:activations:${keyId}`;

  try {
    const existing = await kvGetJson(activationKey);
    if (existing?.expiresAt) {
      if (currentTime >= existing.expiresAt) {
        return json(res, 403, {
          valid: false,
          keyId,
          reason: 'expired',
          expiresAt: existing.expiresAt,
          serverTime: currentTime,
          message: 'Essa chave de teste expirou para esta instalacao.',
        });
      }

      return json(res, 200, {
        valid: true,
        keyId,
        expiresAt: existing.expiresAt,
        activatedAt: existing.activatedAt,
        serverTime: currentTime,
        message: 'Acesso de teste ja liberado.',
      });
    }

    if (maxActivations > 0) {
      const currentActivations = Number(await runKvCommand('scard', activationSetKey)) || 0;
      if (currentActivations >= maxActivations) {
        return json(res, 403, {
          valid: false,
          keyId,
          reason: 'activation_limit_reached',
          serverTime: currentTime,
          message: 'O limite de testes dessa chave foi atingido.',
        });
      }
    }

    const activatedAt = currentTime;
    const expiresAt = activatedAt + durationMs;
    const record = {
      keyId,
      installHash,
      versionName,
      activatedAt,
      expiresAt,
      channel: rule.channel || 'discord',
    };

    await runKvCommand('set', activationKey, JSON.stringify(record));
    await runKvCommand('expire', activationKey, Math.ceil(durationMs / 1000) + 86400);
    await runKvCommand('sadd', activationSetKey, installHash);

    return json(res, 200, {
      valid: true,
      keyId,
      expiresAt,
      activatedAt,
      serverTime: currentTime,
      message: 'Acesso de teste liberado por tempo limitado.',
    });
  } catch (_error) {
    return json(res, 500, {
      valid: false,
      reason: 'server_error',
      message: 'Nao foi possivel validar a chave de teste agora.',
    });
  }
};
