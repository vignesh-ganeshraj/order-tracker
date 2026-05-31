import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { initDb, insertOrders } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('csv') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const text = await file.text()
    const { data, errors } = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (errors.length) {
      return NextResponse.json({ error: 'CSV parse error: ' + errors[0].message }, { status: 400 })
    }

    await initDb()
    await insertOrders(data)

    return NextResponse.json({ count: data.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
