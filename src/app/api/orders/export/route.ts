import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAuthenticated } from '@/lib/auth'

function escapeCsv(value: string): string {
  if (!value) return ''
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

// GET /api/orders/export - descarga CSV de todos los pedidos
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const orders = await db.order.findMany({
    where: status && status !== 'all' ? { status } : {},
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'ID',
    'Fecha',
    'Cliente',
    'Email',
    'Telefono',
    'Direccion',
    'Items',
    'Total',
    'Estado',
    'Notas',
  ]

  const rows = orders.map((o) => [
    o.id,
    new Date(o.createdAt).toLocaleString('es-PE'),
    o.customerName,
    o.customerEmail || '',
    o.customerPhone,
    o.customerAddress || '',
    o.items.map((i) => `${i.quantity}x ${i.name}`).join(' | '),
    String(o.total),
    o.status,
    o.notes || '',
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\r\n')

  return new NextResponse('\ufeff' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pedidos-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
