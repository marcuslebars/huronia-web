import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { business } from '@/content/business'
import { serverEnv } from '@/lib/env'
import { buildCustomerEmail, buildShopEmail } from '@/lib/quote/email'
import { clientIp, rateLimit } from '@/lib/quote/rate-limit'
import { quoteSchema, toFieldErrors, type QuoteFieldErrors } from '@/lib/quote/schema'

export const runtime = 'nodejs'

export type QuoteResponse =
  { ok: true } | { ok: false; formError?: string; fieldErrors?: QuoteFieldErrors }

/**
 * The honeypot. A real person never sees this field, so any value in it is a
 * bot. We answer with a plain success so the bot has nothing to tune against.
 */
const honeypotSchema = z.object({ website: z.string().optional() })

/**
 * Sender identity. Resend requires a verified domain; until DNS is set up this
 * will be rejected by the API, which surfaces as a 502 rather than silent loss.
 */
const FROM = `${business.name} <quotes@huroniaautoglass.com>`

export async function POST(request: Request): Promise<NextResponse<QuoteResponse>> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, formError: 'Malformed request.' },
      { status: 400 },
    )
  }

  const honeypot = honeypotSchema.safeParse(body)
  if (honeypot.success && (honeypot.data.website ?? '') !== '') {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  const ip = clientIp(request.headers)
  const limit = rateLimit(ip)
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        formError: `Too many requests. Try again in a few minutes, or call ${business.phone}.`,
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  const parsed = quoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, fieldErrors: toFieldErrors(parsed.error) },
      { status: 400 },
    )
  }

  const payload = parsed.data
  const shopEmail = buildShopEmail(payload)
  const customerEmail = buildCustomerEmail(payload)

  try {
    const resend = new Resend(serverEnv.RESEND_API_KEY)

    const toShop = await resend.emails.send({
      from: FROM,
      to: business.email,
      replyTo: payload.email,
      subject: shopEmail.subject,
      text: shopEmail.text,
      html: shopEmail.html,
    })

    // The shop's copy is the one that must not be lost. If it fails, the
    // customer is told the submission failed rather than being sent a
    // confirmation for a request nobody received.
    if (toShop.error) {
      console.error('quote: shop email failed', toShop.error)
      return NextResponse.json(
        {
          ok: false,
          formError: `We could not send that. Please call ${business.phone}.`,
        },
        { status: 502 },
      )
    }

    const toCustomer = await resend.emails.send({
      from: FROM,
      to: payload.email,
      replyTo: business.email,
      subject: customerEmail.subject,
      text: customerEmail.text,
      html: customerEmail.html,
    })

    // The shop has the request, so this is not a failed submission. Log and
    // continue rather than telling the customer to send it again.
    if (toCustomer.error) {
      console.error('quote: customer confirmation failed', toCustomer.error)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error('quote: unexpected send failure', error)
    return NextResponse.json(
      { ok: false, formError: `We could not send that. Please call ${business.phone}.` },
      { status: 502 },
    )
  }
}
