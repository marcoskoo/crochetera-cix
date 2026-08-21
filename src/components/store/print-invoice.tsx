'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatPrice } from '@/lib/site'

interface PrintInvoiceButtonProps {
  order: {
    id: string
    customerName: string
    customerPhone: string
    customerEmail?: string | null
    customerAddress?: string | null
    total: number
    status: string
    createdAt: string | Date
    items: Array<{
      name: string
      price: number
      quantity: number
      imageUrl?: string | null
    }>
  }
}

export function PrintInvoiceButton({ order }: PrintInvoiceButtonProps) {
  const siteConfig = useStore((s) => s.siteConfig)
  const currency = siteConfig?.currency || 'S/'

  const handlePrint = () => {
    const date = new Date(order.createdAt).toLocaleString('es-PE')
    const itemsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.quantity}x</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.price, currency)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.price * item.quantity, currency)}</td>
        </tr>`,
      )
      .join('')

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura ${order.id.slice(-6).toUpperCase()}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #E91E63; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #E91E63; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
        .customer-info { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #E91E63; color: white; padding: 10px; text-align: left; font-size: 14px; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 10px; border-top: 2px solid #E91E63; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">CROCHETERA.CIX</div>
        <p style="margin: 5px 0; color: #666;">${siteConfig?.tagline || 'Peluches tejidos a mano con amor'}</p>
        <p style="margin: 5px 0; font-size: 12px; color: #666;">
          ${siteConfig?.phone || ''} · ${siteConfig?.email || ''}
        </p>
      </div>

      <div class="invoice-info">
        <div>
          <strong>Factura #${order.id.slice(-6).toUpperCase()}</strong><br>
          Fecha: ${date}<br>
          Estado: ${order.status}
        </div>
        <div style="text-align: right;">
          <strong>Pedido ID:</strong><br>
          ${order.id}
        </div>
      </div>

      <div class="customer-info">
        <strong>Datos del cliente:</strong><br>
        Nombre: ${order.customerName}<br>
        Teléfono: ${order.customerPhone}<br>
        ${order.customerEmail ? `Email: ${order.customerEmail}<br>` : ''}
        ${order.customerAddress ? `Dirección: ${order.customerAddress}<br>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Cant.</th>
            <th>Producto</th>
            <th style="text-align: right;">P. Unit.</th>
            <th style="text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total">
        Total: ${formatPrice(order.total, currency)}
      </div>

      <div class="footer">
        <p>Gracias por tu compra en CROCHETERA.CIX 🧶</p>
        <p>${siteConfig?.shippingInfo || 'Producto hecho a pedido'}</p>
        <p>Esta factura es un comprobante de pedido. No tiene validez fiscal.</p>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>`

    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Printer className="h-4 w-4 mr-1" />
      Imprimir factura
    </Button>
  )
}
