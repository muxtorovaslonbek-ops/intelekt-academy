const allowedActions = new Set(['getMe', 'getUpdates', 'sendMessage']);

export default async function handler(req, res) {
  const action = String(req.query.action || '');
  const token = process.env.TELEGRAM_BOT_TOKEN || '';

  if (!allowedActions.has(action)) return res.status(400).json({ ok: false, description: 'Invalid action' });
  if (!token) return res.status(503).json({ ok: false, description: 'Telegram bot is not configured' });

  try {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== 'action' && typeof value === 'string') query.set(key, value);
    }
    const response = await fetch(`https://api.telegram.org/bot${token}/${action}${query.size ? `?${query}` : ''}`, {
      method: action === 'sendMessage' ? 'POST' : 'GET',
      headers: action === 'sendMessage' ? { 'Content-Type': 'application/json' } : undefined,
      body: action === 'sendMessage' ? JSON.stringify(req.body || {}) : undefined,
    });
    const payload = await response.json();
    return res.status(response.status).json(payload);
  } catch (error) {
    console.error('Telegram proxy error:', error);
    return res.status(502).json({ ok: false, description: 'Telegram API unavailable' });
  }
}