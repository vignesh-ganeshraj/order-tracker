import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import { initDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function GET() {
  await initDb()
  const [statusRes, timelineRes, productRes] = await Promise.all([
    pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders GROUP BY status ORDER BY count DESC
    `),
    pool.query(`
      SELECT order_date, COUNT(*) as count, SUM(price * quantity) as revenue
      FROM orders GROUP BY order_date ORDER BY order_date
    `),
    pool.query(`
      SELECT product, COUNT(*) as count, SUM(price * quantity) as revenue
      FROM orders GROUP BY product ORDER BY revenue DESC
    `),
  ])

  return NextResponse.json({
    byStatus: statusRes.rows,
    byDate: timelineRes.rows,
    byProduct: productRes.rows,
  })
}
