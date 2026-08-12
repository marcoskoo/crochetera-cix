import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/emails/send - enviar email (log only, sin SMTP real)
// En producción conectar con SendGrid/Resend/etc
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { to, subject, body: emailBody, type } = body

  if (!to || !subject) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  // Por ahora solo logueamos el email (no hay SMTP configurado)
  // En producción, aquí se enviaría con el proveedor de email
  try {
    await db.emailLog.create({
      data: {
        to,
        subject,
        body: emailBody || '',
        type: type || 'manual',
        status: 'sent',
      },
    })
    return NextResponse.json({ ok: true, message: 'Email registrado (SMTP no configurado - conectar Resend/SendGrid para envío real)' })
  } catch (e) {
    return NextResponse.json({ error: 'Error al enviar' }, { status: 500 })
  }
}
