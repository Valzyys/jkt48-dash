import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ambil parameter phone_number dari query
    const { phone_number } = req.query;

    if (!phone_number) {
      return res.status(400).json({ error: 'Missing required field: phone_number' });
    }

    // Koneksi ke database
    const db = await connectToDatabase();

    // Query untuk mengambil data berdasarkan phone_number
    const query = `
      SELECT id, username, api_key, balance, seller, created_at
      FROM users
      WHERE phone_number = $1;
    `;
    const values = [phone_number];
    const result = await db.query(query, values);

    // Jika data tidak ditemukan
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Jika saldo kurang dari 5, tidak boleh digunakan
    if (user.balance < 5) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Kembalikan data user tanpa mengurangi balance
    res.status(200).json({ user });

  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
