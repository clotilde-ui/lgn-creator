import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;

function getClient(): Client {
  if (client) {
    return client;
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL not configured');
  }

  client = createClient({ url, authToken });
  return client;
}

async function ensureSchema(db: Client) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS newsletters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      newsletter_number TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      yaml TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getClient();
    await ensureSchema(db);

    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        const result = await db.execute({
          sql: 'SELECT id, newsletter_number, subject, yaml, created_at FROM newsletters WHERE id = ?',
          args: [Number(id)],
        });

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Newsletter not found' });
        }

        return res.status(200).json({ newsletter: result.rows[0] });
      }

      const result = await db.execute(
        'SELECT id, newsletter_number, subject, created_at FROM newsletters ORDER BY created_at DESC, id DESC'
      );

      return res.status(200).json({ newsletters: result.rows });
    }

    if (req.method === 'POST') {
      const { newsletterNumber, subject, yaml } = req.body ?? {};

      if (!newsletterNumber || !yaml) {
        return res.status(400).json({ error: 'newsletterNumber and yaml are required' });
      }

      const result = await db.execute({
        sql: 'INSERT INTO newsletters (newsletter_number, subject, yaml) VALUES (?, ?, ?) RETURNING id, created_at',
        args: [String(newsletterNumber), String(subject ?? ''), String(yaml)],
      });

      return res.status(201).json({ newsletter: result.rows[0] });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      await db.execute({
        sql: 'DELETE FROM newsletters WHERE id = ?',
        args: [Number(id)],
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
