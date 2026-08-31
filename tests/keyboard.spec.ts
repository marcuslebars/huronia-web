import { expect, test, type Page } from '@playwright/test'

/** Where focus currently is, as a short description. */
async function activeElement(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement
    if (!el) return null
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.textContent ?? '').trim().slice(0, 40),
      insideDialog: Boolean(el.closest('dialog')),
    }
  })
}

/**
 * True when focus has reached a real element outside the open dialog.
 *
 * Chromium parks focus on <body> for one step when wrapping from the last
 * focusable element back to the first inside a modal dialog. That is the wrap
 * point, not an escape, so body is not counted. Anything else outside the
 * dialog means the trap is broken.
 */
async function focusEscapedDialog(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return false
    return !el.closest('dialog')
  })
}

/** True when the focused element paints a visible focus indicator. */
async function focusIsVisible(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement
    if (!(el instanceof HTMLElement)) return false
    const style = getComputedStyle(el)
    const width = parseFloat(style.outlineWidth || '0')
    return style.outlineStyle !== 'none' && width > 0
  })
}

test.describe('Header — keyboard only', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('skip link is the first stop and is visible when focused', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')

    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    expect(await focusIsVisible(page)).toBe(true)
  })

  test('mega menu opens with the keyboard, Escape closes and returns focus', async ({
    page,
  }) => {
    await page.goto('/')
    const trigger = page.getByRole('button', { name: 'Services' })

    await trigger.focus()
    expect(await focusIsVisible(page)).toBe(true)
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'Windshield Replacement' })).toBeVisible()

    // Focus must be able to reach the panel's links.
    await page.keyboard.press('Tab')
    expect((await activeElement(page))?.tag).toBe('a')

    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
  })
})

test.describe('Mobile drawer — keyboard only', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens, traps focus, Escape closes, focus returns to the trigger', async ({
    page,
  }) => {
    await page.goto('/')

    const trigger = page.getByRole('button', { name: 'Open menu' })
    await trigger.focus()
    expect(await focusIsVisible(page)).toBe(true)

    await page.keyboard.press('Enter')
    const drawer = page.getByRole('dialog')
    await expect(drawer).toBeVisible()

    // Trap: twenty tabs must never reach page content behind the drawer.
    let landedInside = false
    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press('Tab')
      expect(await focusEscapedDialog(page), `tab ${i + 1} escaped the drawer`).toBe(
        false,
      )
      if ((await activeElement(page))?.insideDialog) landedInside = true
    }
    expect(landedInside, 'focus never entered the drawer').toBe(true)

    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('the close button also returns focus to the trigger', async ({ page }) => {
    await page.goto('/')
    const trigger = page.getByRole('button', { name: 'Open menu' })

    await trigger.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: 'Close menu' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(trigger).toBeFocused()
  })
})

test.describe('Dialog — keyboard only', () => {
  test('Escape closes and focus returns to the opening button', async ({ page }) => {
    await page.goto('/kitchen-sink')
    const trigger = page.getByRole('button', { name: 'Open dialog' })

    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()

    let landedInside = false
    for (let i = 0; i < 10; i += 1) {
      await page.keyboard.press('Tab')
      expect(await focusEscapedDialog(page), `tab ${i + 1} escaped the dialog`).toBe(
        false,
      )
      if ((await activeElement(page))?.insideDialog) landedInside = true
    }
    expect(landedInside, 'focus never entered the dialog').toBe(true)

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(trigger).toBeFocused()
  })
})
