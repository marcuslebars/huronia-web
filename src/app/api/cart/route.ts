import { NextResponse } from 'next/server'
import { readCart } from '@/lib/cart-actions'

export const runtime = 'nodejs'
/** Per-visitor, so never cached. */
export const dynamic = 'force-dynamic'

/**
 * The cart for the current visitor, identified by the httpOnly cookie.
 *
 * Exists so the client can hydrate cart state without the root layout reading
 * cookies during render, which would make every page dynamic.
 */
export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json({ cart: await readCart() })
  } catch {
    // A cart lookup failure must not take the page down with it.
    return NextResponse.json({ cart: null }, { status: 200 })
  }
}
