'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  delivered: '#22c55e',
  shipped:   '#3b82f6',
  pending:   '#f59e0b',
  cancelled: '#ef4444',
}

type Stats = {
  byStatus: { status: string; count: string }[]
  byDate:   { order_date: string; count: string; revenue: string }[]
  byProduct: { product: string; count: string; revenue: string }[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
  }, [])

  if (!stats) {
    return (
      <main className="max-w-5xl mx-auto py-16 px-4 text-gray-400 text-center">
        Loading…
      </main>
    )
  }

  const totalOrders  = stats.byStatus.reduce((s, r) => s + Number(r.count), 0)
  const totalRevenue = stats.byDate.reduce((s, r) => s + Number(r.revenue), 0)

  return (
    <main className="max-w-5xl mx-auto py-12 px-4 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">Upload</Link>
          <Link href="/orders" className="text-blue-600 hover:underline">Orders</Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card label="Total Orders" value={totalOrders} />
        <Card label="Revenue" value={`$${totalRevenue.toFixed(2)}`} />
        <Card label="Delivered" value={stats.byStatus.find(s => s.status === 'delivered')?.count ?? 0} />
        <Card label="Pending"   value={stats.byStatus.find(s => s.status === 'pending')?.count ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Status breakdown */}
        <ChartBox title="Orders by Status">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={stats.byStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ status, count }) => `${status} (${count})`}
              >
                {stats.byStatus.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartBox>

        {/* Revenue by product */}
        <ChartBox title="Revenue by Product">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.byProduct} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="product" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>

      {/* Orders over time */}
      <ChartBox title="Orders & Revenue Over Time">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={stats.byDate} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="order_date" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left"  type="monotone" dataKey="count"   stroke="#3b82f6" name="Orders"  strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22c55e" name="Revenue ($)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>
    </main>
  )
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function ChartBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
      {children}
    </div>
  )
}
