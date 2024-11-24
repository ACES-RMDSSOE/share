import dbConnect from '../../utils/db';
import Url from '../../models/url';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method not allowed' }); }
  const { originalUrl, alias } = req.body;
  if (!originalUrl) { return res.status(400).json({ message: 'Original URL is required' }); }

  const dotCount = (originalUrl.match(/\./g) || []).length;
  if (dotCount <= 0) { return res.status(400).json({ message: 'Invalid URL or Domain' }); }

  await dbConnect();
  try {
    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(400).json({ message: 'This URL has already been shortened' });
    }

    // Check if alias already exists (Only if alias is provided)
    if (alias) {
      const existingAlias = await Url.findOne({ alias });
      if (existingAlias) {
        return res.status(400).json({ message: 'Custom alias already in use' });
      }
    }

    const shortenUrl = alias || nanoid(6);
    const newUrl = await Url.create({ originalUrl, shortenUrl, alias: alias || undefined });

    res.status(201).json({ shortenUrl: `${process.env.BASE_URL}/${shortenUrl}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
