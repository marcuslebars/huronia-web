import { ImageResponse } from 'next/og'
import { business } from '@/content/business'

/**
 * Sitewide social card. Type-led, because there is not one photograph of the
 * shop, the team or finished work (§13.3). Generated at build time so it stays
 * in step with the tokens rather than being a stale exported PNG.
 *
 * The colours are hex literals rather than tokens, which is the one place that
 * is unavoidable: Satori renders outside a browser and cannot resolve CSS
 * custom properties. They mirror --color-ink, --color-accent and --color-paper.
 */
export const alt = `${business.name} — auto glass in ${business.address.city}, ${business.address.region}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#14181A',
        color: '#FFFFFF',
        padding: '72px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontSize: 30,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#0F7B8A',
          }}
        >
          {`Est. ${business.founded.year}`}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 86,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {business.name}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: 30,
          color: '#C8D3D5',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>{business.address.street}</span>
          <span>{`${business.address.city}, ${business.address.regionCode}`}</span>
        </div>
        <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{business.phone}</span>
      </div>
    </div>,
    size,
  )
}
