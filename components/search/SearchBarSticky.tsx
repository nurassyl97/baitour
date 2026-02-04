"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { SearchQueryState } from "./SearchFormState"
import { DeparturePicker } from "./DeparturePicker"
import { DestinationPicker } from "./DestinationPicker"
import { DateRangePicker } from "./DateRangePicker"
import { PeoplePicker } from "./PeoplePicker"

type Props = {
  state: SearchQueryState
  onPatch: (patch: Partial<SearchQueryState>) => void
  onSubmit: () => void
  sticky?: boolean
  className?: string
  /** Button label, e.g. "Найти туры" in modal */
  submitLabel?: string
}

export function SearchBarSticky({
  state,
  onPatch,
  onSubmit,
  sticky = true,
  className,
  submitLabel = "Найти",
}: Props) {
  const [active, setActive] = React.useState<
    null | "departure" | "destination" | "dates" | "people"
  >(null)

  const fieldBase =
    "w-full min-w-0 flex items-stretch flex-1 border-[var(--border)]"
  const fieldHeight = "h-[var(--input-height)] min-h-[var(--input-height)]"
  const activeClass =
    "bg-primary/5 ring-1 ring-primary/20 ring-inset"

  return (
    <div
      className={cn(
        sticky ? "bg-[#F9FAFB]" : "",
        // Mobile: sticky — bar stays in place on page, then sticks to top when scrolled past; desktop: static
        sticky ? "sticky top-0 z-40 pt-[env(safe-area-inset-top)] md:static md:pt-0" : "",
        className
      )}
    >
      <div className={cn(sticky ? "ds-container py-4" : "")}>
        <div className={cn(sticky ? "mx-auto max-w-[var(--container-max,1200px)]" : "")}>
          {/* Single horizontal container: design system radius + border */}
          <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[#FFFFFF] shadow-sm">
            <div className="flex flex-col md:flex-row md:flex-nowrap gap-0">
              {/* From */}
              <div
                className={cn(
                  fieldBase,
                  fieldHeight,
                  "border-b md:border-b-0 md:border-l-0 md:flex-1",
                  active === "departure" ? activeClass : ""
                )}
              >
                <DeparturePicker
                  value={state.departureId}
                  open={active === "departure"}
                  onOpenChange={(open) =>
                    setActive((prev) =>
                      open ? "departure" : prev === "departure" ? null : prev
                    )
                  }
                  onChange={(departureId) => onPatch({ departureId })}
                />
              </div>

              {/* Destination */}
              <div
                className={cn(
                  fieldBase,
                  fieldHeight,
                  "border-b border-l-0 md:border-l md:flex-[1.25]",
                  active === "destination" ? activeClass : ""
                )}
              >
                <DestinationPicker
                  country={state.country}
                  resorts={state.resorts}
                  open={active === "destination"}
                  onOpenChange={(open) =>
                    setActive((prev) =>
                      open ? "destination" : prev === "destination" ? null : prev
                    )
                  }
                  onChange={(patch) => onPatch(patch)}
                />
              </div>

              {/* Dates */}
              <div
                className={cn(
                  fieldBase,
                  fieldHeight,
                  "border-b border-l-0 md:border-l md:flex-[1.25]",
                  active === "dates" ? activeClass : ""
                )}
              >
                <DateRangePicker
                  dateFrom={state.dateFrom}
                  dateTo={state.dateTo}
                  nightsFrom={state.nightsFrom}
                  nightsTo={state.nightsTo}
                  open={active === "dates"}
                  onOpenChange={(open) =>
                    setActive((prev) => (open ? "dates" : prev === "dates" ? null : prev))
                  }
                  onChange={(patch) => onPatch(patch)}
                />
              </div>

              {/* Guests */}
              <div
                className={cn(
                  fieldBase,
                  fieldHeight,
                  "border-b border-l-0 md:border-l md:border-b-0 md:flex-1",
                  active === "people" ? activeClass : ""
                )}
              >
                <PeoplePicker
                  adults={state.adults}
                  childrenCount={state.children}
                  childrenAges={state.childrenAges}
                  open={active === "people"}
                  onOpenChange={(open) =>
                    setActive((prev) =>
                      open ? "people" : prev === "people" ? null : prev
                    )
                  }
                  onChange={(patch) => onPatch(patch)}
                />
              </div>

              {/* Search button: design system height + primary color */}
              <div className={cn("w-full border-t border-[var(--border)] md:border-t-0 md:border-l md:basis-[200px] md:flex-shrink-0 flex items-center justify-center", fieldHeight)}>
                <Button
                  type="button"
                  onClick={onSubmit}
                  className="h-full w-full rounded-none border-0 bg-primary hover:bg-primary/90 text-primary-foreground ds-button"
                >
                  {submitLabel}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

