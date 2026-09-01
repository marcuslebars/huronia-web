'use client'

import { Button } from '@/components/ui/Button'
import { useCart } from '@/components/shop/CartProvider'

export type AddToCartButtonProps = {
  variantId: string
  available: boolean
  labels: { addToCart: string; soldOut: string; adding: string }
}

export function AddToCartButton({ variantId, available, labels }: AddToCartButtonProps) {
  const { add, pending } = useCart()

  if (!available) {
    return (
      <Button size="lg" disabled>
        {labels.soldOut}
      </Button>
    )
  }

  return (
    <Button size="lg" disabled={pending} onClick={() => void add(variantId)}>
      {pending ? labels.adding : labels.addToCart}
    </Button>
  )
}
