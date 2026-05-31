import Link from 'next/link'
import { initDb, getOrders } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  await initDb()
  const orders = await getOrders()

  return (
    <main className="max-w-5xl mx-auto py-16 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">← Upload</Link>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No orders yet. <Link href="/" className="text-blue-500 underline">Upload a CSV</Link> to get started.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
            {orders.length} orders
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID', 'Customer', 'Product', 'Qty', 'Price', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{o.order_id}</td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="px-4 py-3">{o.product}</td>
                    <td className="px-4 py-3">{o.quantity}</td>
                    <td className="px-4 py-3">${Number(o.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        o.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                        o.status === 'shipped'   ? 'bg-blue-100 text-blue-700' :
                                                   'bg-gray-100 text-gray-600'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{o.order_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
