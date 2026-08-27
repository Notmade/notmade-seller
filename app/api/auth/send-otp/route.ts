import { NextResponse } from 'next/server'
import { createHash, randomInt } from 'crypto'
import { createServiceClient } from '../../../lib/supabase-server'
import sgMail from '@sendgrid/mail'

const GENERIC = { message: 'If this email is registered you will receive a code' }

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email?: string }
    const email = body.email?.trim().toLowerCase()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const supabase = createServiceClient()
    const { data: seller } = await supabase
      .from('sellers')
      .select('id, email, brand_name, status')
      .eq('email', email)
      .single()

    if (!seller || seller.status !== 'approved') {
      return NextResponse.json(GENERIC)
    }

    const otp = String(randomInt(100000, 999999))
    const hash = createHash('sha256').update(otp).digest('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await supabase
      .from('sellers')
      .update({ otp_hash: hash, otp_expires_at: expiresAt })
      .eq('id', seller.id)

    sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
    await sgMail.send({
      to: seller.email,
      from: 'admin@notmade.in',
      subject: 'Your NOTMADE seller login code',
      text: `Your NOTMADE seller login code is: ${otp}\n\nValid for 10 minutes. Do not share this code with anyone.`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <p style="font-size:22px;font-weight:900;margin:0 0 24px">
            <span style="color:#111">NOT</span><span style="color:#CC0000">MADE</span>
          </p>
          <p style="font-size:16px;color:#333;margin:0 0 16px">Your seller login code is:</p>
          <p style="font-size:40px;font-weight:900;letter-spacing:0.1em;color:#111;margin:0 0 16px">${otp}</p>
          <p style="font-size:14px;color:#888;margin:0">Valid for 10 minutes. Do not share this code.</p>
        </div>
      `,
    })

    return NextResponse.json(GENERIC)
  } catch (err) {
    console.error('send-otp error:', err)
    return NextResponse.json(GENERIC)
  }
}
