import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY;
    const secretKey = process.env.SCREENSHOTONE_SECRET_KEY;

    if (!accessKey) {
      return res.status(500).json({ error: 'SCREENSHOTONE_ACCESS_KEY not configured' });
    }
    if (!secretKey) {
      return res.status(500).json({ error: 'SCREENSHOTONE_SECRET_KEY not configured' });
    }

    const { url } = req.body ?? {};

    if (!url) {
      return res.status(400).json({ error: 'url is required' });
    }

    const params = new URLSearchParams({
      access_key: accessKey,
      url: String(url),
      format: 'jpg',
      image_quality: '80',
      viewport_width: '1200',
      viewport_height: '800',
      device_scale_factor: '1',
      full_page: 'false',
      block_ads: 'true',
      block_cookie_banners: 'true',
      block_chats: 'true',
      cache: 'true',
      cache_ttl: '2592000',
    });

    const query = params.toString();
    const signature = createHmac('sha256', secretKey).update(query).digest('hex');
    const imageUrl = `https://api.screenshotone.com/take?${query}&signature=${signature}`;

    return res.status(200).json({ imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
