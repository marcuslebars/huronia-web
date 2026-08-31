import { expect, test, type Page } from '@playwright/test'

/**
 * Phase 5 gate — PROJECT_BRIEF.md §10.
 *
 * Walks all four steps including the insurance branch, and asserts that
 * conditional fields the customer never saw are absent from the payload.
 *
 * Delivery of a real email is not asserted here: that needs a live Resend key
 * and a verified sending domain. What is asserted is that the request the
 * server accepts is exactly the request the customer answered.
 */

/** Captures the body the form POSTs, and answers without hitting the API. */
async function interceptSubmit(page: Page) {
  const captured: { body: unknown } = { body: undefined }
  await page.route('**/api/quote', async (route) => {
    captured.body = route.request().postDataJSON()
    await route.fulfill({ status: 200, json: { ok: true } })
  })
  return captured
}

async function fillVehicle(page: Page) {
  await page.getByLabel('Year').fill('2018')
  await page.getByLabel('Make').fill('Toyota')
  await page.getByLabel('Model').fill('RAV4')
}

async function fillDetails(page: Page) {
  await page.getByLabel('Name').fill('Rob Karnis')
  await page.getByLabel('Phone').fill('705-555-0134')
  await page.getByLabel('Email').fill('rob@example.com')
}

test.describe('Quote form', () => {
  test('walks all four steps with the insurance branch and submits', async ({ page }) => {
    const captured = await interceptSubmit(page)
    await page.goto('/quote')

    // Step 1 — glass job, so step 2 asks the extra questions.
    await page.getByRole('radio', { name: 'Windshield replacement' }).check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL(/step=2/)

    // Step 2
    await fillVehicle(page)
    await page.getByLabel('Trim').fill('XLE')
    await page.getByRole('radio', { name: 'Crack over 6 inches' }).check()
    await page.getByRole('radio', { name: 'Yes', exact: true }).check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL(/step=3/)

    // Step 3, including the insurance block
    await page.getByRole('radio', { name: 'At the shop in Midland' }).check()
    await page.getByRole('radio', { name: 'As soon as possible' }).check()
    await page.getByLabel('Town').selectOption('Midland')
    await page.getByRole('checkbox', { name: /insurance/i }).check()
    await page.getByLabel('Insurer').fill('Example Mutual')
    await page.getByLabel('Claim number').fill('CLM-4471')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL(/step=4/)

    // Step 4 — details, then the review read-back
    await fillDetails(page)
    await expect(page.getByRole('heading', { name: 'Check your answers' })).toBeVisible()
    await expect(page.getByText('Example Mutual')).toBeVisible()

    await page.getByRole('button', { name: 'Send request' }).click()
    await expect(page.getByRole('heading', { name: 'Request sent' })).toBeVisible()

    const body = captured.body as Record<string, unknown>
    expect(body.jobType).toBe('windshield-replacement')
    expect(body.damage).toBe('crack-over-6')
    expect(body.adas).toBe('yes')
    expect(body.vehicleTrim).toBe('XLE')
    expect(body.insurance).toEqual({ insurer: 'Example Mutual', claimNumber: 'CLM-4471' })
  })

  test('a non-glass job never sends damage or ADAS', async ({ page }) => {
    const captured = await interceptSubmit(page)
    await page.goto('/quote')

    await page.getByRole('radio', { name: 'Remote starter' }).check()
    await page.getByRole('button', { name: 'Continue' }).click()

    // The glass-only questions must not even be rendered.
    await fillVehicle(page)
    await expect(
      page.getByRole('radiogroup', { name: /how bad is the damage/i }),
    ).toHaveCount(0)
    await expect(page.getByRole('radiogroup', { name: /lane-keep assist/i })).toHaveCount(
      0,
    )
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('radio', { name: 'Either is fine' }).check()
    await page.getByRole('radio', { name: 'No particular rush' }).check()
    await page.getByLabel('Town').selectOption('Coldwater')
    await page.getByRole('button', { name: 'Continue' }).click()

    await fillDetails(page)
    await page.getByRole('button', { name: 'Send request' }).click()
    await expect(page.getByRole('heading', { name: 'Request sent' })).toBeVisible()

    const body = captured.body as Record<string, unknown>
    expect(Object.keys(body)).not.toContain('damage')
    expect(Object.keys(body)).not.toContain('adas')
    expect(Object.keys(body)).not.toContain('insurance')
  })

  test('an unticked insurance block sends nothing, even after being filled in', async ({
    page,
  }) => {
    const captured = await interceptSubmit(page)
    await page.goto('/quote?step=1')

    await page.getByRole('radio', { name: 'Windshield chip or crack repair' }).check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await fillVehicle(page)
    await page.getByRole('radio', { name: 'Small stone chip' }).check()
    await page.getByRole('radio', { name: 'Not sure' }).check()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('radio', { name: 'You come to me' }).check()
    await page.getByRole('radio', { name: 'Within a week' }).check()
    await page.getByLabel('Town').selectOption('Tiny')

    // Open it, type into it, then change your mind and close it.
    const insurance = page.getByRole('checkbox', { name: /insurance/i })
    await insurance.check()
    await page.getByLabel('Insurer').fill('Should Not Be Sent')
    await insurance.uncheck()
    await expect(page.getByLabel('Insurer')).toHaveCount(0)

    await page.getByRole('button', { name: 'Continue' }).click()
    await fillDetails(page)
    await page.getByRole('button', { name: 'Send request' }).click()
    await expect(page.getByRole('heading', { name: 'Request sent' })).toBeVisible()

    const body = captured.body as Record<string, unknown>
    expect(Object.keys(body)).not.toContain('insurance')
    expect(JSON.stringify(body)).not.toContain('Should Not Be Sent')
  })

  test('the step lives in the URL, so Back works and a step is linkable', async ({
    page,
  }) => {
    await page.goto('/quote')
    await page.getByRole('radio', { name: 'Window or headlight tint' }).check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL(/step=2/)

    await page.goBack()
    await expect(page).toHaveURL(/\/quote$|step=1/)
    await expect(
      page.getByRole('radio', { name: 'Window or headlight tint' }),
    ).toBeChecked()

    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page.getByRole('heading', { name: 'What do you need' })).toBeVisible()
  })

  test('an invalid step shows an error summary and moves focus to it', async ({
    page,
  }) => {
    await page.goto('/quote')
    await page.getByRole('button', { name: 'Continue' }).click()

    const summary = page.getByRole('alert').filter({ hasText: 'There is a problem' })
    await expect(summary).toBeVisible()
    await expect(summary).toBeFocused()
    await expect(page).toHaveURL(/\/quote$|step=1/)
  })

  test('?product=handle prefills step 1', async ({ page }) => {
    await page.goto('/quote?product=black-rhino-wheels')
    await expect(
      page.getByRole('radio', { name: 'Wheels, tires or accessories' }),
    ).toBeChecked()
  })
})

test.describe('POST /api/quote', () => {
  const validPayload = {
    jobType: 'windshield-replacement',
    vehicleYear: '2018',
    vehicleMake: 'Toyota',
    vehicleModel: 'RAV4',
    damage: 'crack-over-6',
    adas: 'yes',
    serviceLocation: 'in-shop',
    urgency: 'asap',
    town: 'Midland',
    name: 'Rob Karnis',
    phone: '705-555-0134',
    email: 'rob@example.com',
  }

  test('rejects a conditional field that the customer was never shown', async ({
    request,
  }) => {
    // A non-glass job must not carry damage or ADAS. The server enforces their
    // absence rather than quietly dropping them (§8).
    const response = await request.post('/api/quote', {
      headers: { 'x-forwarded-for': '198.51.100.1' },
      data: { ...validPayload, jobType: 'remote-starter' },
    })

    expect(response.status()).toBe(400)
    const body = (await response.json()) as { fieldErrors?: Record<string, string> }
    expect(body.fieldErrors?.damage).toBeTruthy()
    expect(body.fieldErrors?.adas).toBeTruthy()
  })

  test('rejects a glass job missing its required conditional fields', async ({
    request,
  }) => {
    const { damage: _damage, adas: _adas, ...withoutGlassDetail } = validPayload
    const response = await request.post('/api/quote', {
      headers: { 'x-forwarded-for': '198.51.100.2' },
      data: withoutGlassDetail,
    })

    expect(response.status()).toBe(400)
    const body = (await response.json()) as { fieldErrors?: Record<string, string> }
    expect(body.fieldErrors?.damage).toBeTruthy()
    expect(body.fieldErrors?.adas).toBeTruthy()
  })

  test('returns typed field errors the form can render inline', async ({ request }) => {
    const response = await request.post('/api/quote', {
      headers: { 'x-forwarded-for': '198.51.100.3' },
      data: { ...validPayload, email: 'not-an-email', vehicleYear: '18' },
    })

    expect(response.status()).toBe(400)
    const body = (await response.json()) as { fieldErrors?: Record<string, string> }
    expect(body.fieldErrors?.email).toBeTruthy()
    expect(body.fieldErrors?.vehicleYear).toBeTruthy()
  })

  test('the honeypot is accepted silently and sends nothing', async ({ request }) => {
    const response = await request.post('/api/quote', {
      headers: { 'x-forwarded-for': '198.51.100.4' },
      data: { ...validPayload, website: 'http://spam.example' },
    })

    // Answers like a success so a bot has nothing to tune against. If this were
    // reaching Resend it would 502 instead — the placeholder key is invalid.
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
  })

  test('rate limits repeated requests from one IP', async ({ request }, testInfo) => {
    // Both Playwright projects hit one server, and the limiter keeps state per
    // IP across the whole run. Each project therefore needs its own IP, or the
    // second one starts with the bucket already spent.
    const octet =
      2 +
      ([...testInfo.project.name].reduce((total, char) => total + char.charCodeAt(0), 0) %
        200)
    const ip = `203.0.113.${octet}`
    const statuses: number[] = []

    for (let i = 0; i < 7; i += 1) {
      const response = await request.post('/api/quote', {
        headers: { 'x-forwarded-for': ip },
        // Invalid on purpose: the limiter runs before validation, and this
        // keeps the test from attempting to send seven emails.
        data: { jobType: 'nonsense' },
      })
      statuses.push(response.status())
    }

    expect(statuses.slice(0, 5)).toEqual([400, 400, 400, 400, 400])
    expect(statuses.slice(5)).toEqual([429, 429])
  })
})
