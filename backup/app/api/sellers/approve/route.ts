import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { sellerId, email, password } = await req.json()
  if (!sellerId || !email || !password) {
    return NextResponse.json({ error: 'sellerId, email, and password are required' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Create the real auth account for this seller
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'seller', seller_id: sellerId },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Link the auth account + mark approved (no plaintext password stored)
  const { data: seller, error: updateError } = await admin
    .from('sellers')
    .update({
      status: 'approved',
      is_active: true,
      auth_user_id: authData.user.id,
      seller_email: email,
    })
    .eq('id', sellerId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ seller })
}
