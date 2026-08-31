'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Drawer } from '@/components/ui/Drawer'

export function OverlayDemo() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
      <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
        Open drawer
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Example dialog"
      >
        <p>
          Focus is trapped here. Escape closes it and focus returns to the button that
          opened it.
        </p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
          <Button variant="secondary" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
        </div>
      </Dialog>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Example drawer"
      >
        <p className="text-[var(--surface-muted)]">
          The same modal behaviour, anchored to the edge. Used by the mobile navigation.
        </p>
      </Drawer>
    </div>
  )
}
