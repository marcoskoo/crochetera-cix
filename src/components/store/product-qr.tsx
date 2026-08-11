'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QrCode, Download } from 'lucide-react'
import { toast } from 'sonner'

interface ProductQRProps {
  productId: string
  productName: string
}

export function ProductQRCode({ productId, productName }: ProductQRProps) {
  const qrUrl = `/api/qr/${productId}`

  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `qr-${productName.replace(/\s+/g, '-').toLowerCase()}.png`
    link.target = '_blank'
    link.click()
    toast.success('Descargando código QR...')
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-primary">
          <QrCode className="h-4 w-4 mr-1" />
          Código QR
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">Código QR del producto</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md">
            { }
            <img
              src={qrUrl}
              alt={`QR ${productName}`}
              className="w-56 h-56"
            />
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">{productName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Escanea para ver el producto en tu celular
            </p>
          </div>
          <Button onClick={downloadQR} className="w-full btn-crochet">
            <Download className="h-4 w-4 mr-1" />
            Descargar QR
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            💡 Imprime este QR y ponlo en tu catálogo físico o empaque
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
