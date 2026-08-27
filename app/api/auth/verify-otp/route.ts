import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createServiceClient } from '../../../lib/supabase-server'

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email?: string; code?: string }
    const email = body.email?.trim().toLowerCase()
    const code = body.code?.trim()
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data: seller } = await supabase
      .from('sellers')
      .select('id, email, brand_name, name, otp_hash, otp_expires_at, status')
      .eq('email', email)
      .single()

    if (!seller || seller.status !== 'approved') {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
    }

    const hash = createHash('sha256').update(code).digest('hex')

    if (hash !== seller.otp_hash) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
    }

    if (!seller.otp_expires_at || new Date(seller.otp_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 })
    }

    await supabase
      .from('sellers')
      .update({ otp_hash: null, otp_expires_at: null })
      .eq('id', seller.id)

    const res = NextResponse.json({
      id: seller.id,
      name: seller.name ?? '',
      brand_name: seller.brand_name ?? '',
      email: seller.email,
    })

    res.cookies.set('seller_token', seller.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
    })

    return res
  } catch (err) {
    console.error('verify-otp error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
