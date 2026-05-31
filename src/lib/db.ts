import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_id TEXT,
      customer TEXT,
      product TEXT,
      quantity INTEGER,
      price NUMERIC(10,2),
      status TEXT,
      order_date TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

export async function insertOrders(rows: Record<string, string>[]) {
  for (const row of rows) {
    await pool.query(
      `INSERT INTO orders (order_id, customer, product, quantity, price, status, order_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        row.order_id,
        row.customer,
        row.product,
        parseInt(row.quantity) || 0,
        parseFloat(row.price) || 0,
        row.status,
        row.order_date,
      ]
    )
  }
}

export async function getOrders() {
  const result = await pool.query(
    'SELECT * FROM orders ORDER BY created_at DESC'
  )
  return result.rows
}
