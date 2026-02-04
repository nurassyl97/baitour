"use client"

import * as React from "react"
import { SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { SearchQueryState } from "./SearchFormState"
import { FiltersSidebar } from "./FiltersSidebar"

type Props = {
  state: SearchQueryState
  onPatch: (patch: Partial<SearchQueryState>) => void
  disabled?: boolean
}

export function FiltersDrawer({ state, onPatch, disabled }: Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="lg:hidden gap-2">
          <SlidersHorizontal className="size-4" />
          Фильтры
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl p-0">
        <div className="p-4">
          <DialogHeader>
            <DialogTitle>Фильтры</DialogTitle>
          </DialogHeader>
        </div>
        <div className="px-4 pb-4">
          <FiltersSidebar state={state} onPatch={onPatch} disabled={disabled} className="border-0 shadow-none p-0" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

