'use client'

import { useState } from 'react'
import Link from 'next/link'
import Papa from 'papaparse'

export default function Home() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState<Record<string, string>[]>([])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setPreview(result.data.slice(0, 5))
      },
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const file = (form.elements.namedItem('csv') as HTMLInputElement).files?.[0]
    if (!file) return

    setStatus('uploading')
    const formData = new FormData()
    formData.append('csv', file)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (res.ok) {
      setStatus('done')
      setMessage(`Uploaded ${data.count} orders successfully.`)
    } else {
      setStatus('error')
      setMessage(data.error ?? 'Upload failed.')
    }
  }

  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Order Tracker</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/orders" className="text-blue-600 hover:underline">Orders</Link>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Orders CSV</h2>
        <p className="text-sm text-gray-500 mb-4">
          Expected columns: <code className="bg-gray-100 px-1 rounded">order_id, customer, product, quantity, price, status, order_date</code>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="csv"
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          {preview.length > 0 && (
            <div className="overflow-x-auto rounded border border-gray-100">
              <p className="text-xs text-gray-400 px-3 pt-2">Preview (first 5 rows)</p>
              <table className="min-w-full text-xs mt-1">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(preview[0]).map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-gray-700">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'uploading'}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {status === 'uploading' ? 'Uploading…' : 'Upload'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm ${status === 'done' ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>

      <div className="mt-6 bg-gray-100 rounded p-4 text-xs text-gray-500">
        <strong>Sample CSV row:</strong><br />
        ORD-001,Jane Doe,Widget A,2,29.99,pending,2024-01-15
      </div>
    </main>
  )
}
