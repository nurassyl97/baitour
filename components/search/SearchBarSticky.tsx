"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { SearchQueryState } from "./SearchFormState"
import { DeparturePicker } from "./DeparturePicker"
import { DestinationPicker } from "./DestinationPicker"
import { DateRangePicker } from "./DateRangePicker"
import { NightsPicker } from "./NightsPicker"
import { PeoplePicker } from "./PeoplePicker"

type Props = {
  state: SearchQueryState
  onPatch: (patch: Partial<SearchQueryState>) => void
  onSubmit: () => void
  sticky?: boolean
  className?: string
  /** Button label, e.g. "Найти туры" in modal */
  submitLabel?: string
  /** When true, submit button is not rendered (for modal with fixed bottom button) */
  hideSubmitButton?: boolean
}

export function SearchBarSticky({
  state,
  onPatch,
  onSubmit,
  sticky = true,
  className,
  submitLabel = "Найти",
  hideSubmitButton = false,
}: Props) {
  const [active, setActive] = React.useState<
    null | "departure" | "destination" | "dates" | "nights" | "people"
  >(null)
  const datesBothSelectedRef = React.useRef(false)

  const fieldBase = "w-full min-w-0 flex items-stretch flex-1"
  const fieldHeight = "h-[var(--input-height)] min-h-[var(--input-height)]"
  const activeClass = "bg-primary/5 ring-1 ring-primary/20 ring-inset"

  /* Mobile (как Freedom Travel): отдельные скруглённые блоки, серый фон #F5F5F5, без границ, отступы между полями */
  const mobileField =
    "rounded-xl bg-[#F5F5F5] min-h-[56px] border-0 md:rounded-none md:bg-white md:border-[var(--border)] md:border-b md:border-l-0"
  const mobileLastField = "md:border-b-0"

  return (
    <div
      className={cn(
        sticky ? "bg-[#F9FAFB]" : "",
        sticky ? "sticky top-0 z-40 pt-[env(safe-area-inset-top)] md:static md:pt-0" : "",
        className
      )}
    >
      <div className={cn(sticky ? "ds-container py-4" : "")}>
        <div className={cn(sticky ? "mx-auto max-w-[var(--container-max,1200px)]" : "")}>
          {/* Mobile: отдельные карточки; Desktop: одна горизонтальная карточка как на макете */}
          <div className="flex flex-col gap-3 md:flex-row md:flex-nowrap md:gap-0 md:overflow-hidden md:rounded-[var(--radius)] md:border md:border-[var(--border)] md:bg-[#FFFFFF] md:shadow-sm">
            <div
              className={cn(
                fieldBase,
                fieldHeight,
                mobileField,
                "md:border-l-0 md:flex-1",
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

            <div
              className={cn(
                fieldBase,
                fieldHeight,
                mobileField,
                "md:border-l md:flex-[1.25]",
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

            <div
              className={cn(
                fieldBase,
                fieldHeight,
                mobileField,
                "md:border-l md:flex-[1.25]",
                active === "dates" ? activeClass : ""
              )}
            >
              <DateRangePicker
                dateFrom={state.dateFrom}
                dateTo={state.dateTo}
                nightsFrom={state.nightsFrom}
                nightsTo={state.nightsTo}
                open={active === "dates"}
                onOpenChange={(open) => {
                  if (open) {
                    datesBothSelectedRef.current = Boolean(state.dateFrom && state.dateTo)
                    setActive("dates")
                    return
                  }
                  setActive((prev) => {
                    if (prev !== "dates") return prev
                    if (datesBothSelectedRef.current) return null
                    return "dates"
                  })
                }}
                onChange={(patch) => {
                  datesBothSelectedRef.current = Boolean(patch.dateFrom && patch.dateTo)
                  onPatch(patch)
                  if (datesBothSelectedRef.current) setActive((prev) => (prev === "dates" ? null : prev))
                }}
              />
            </div>

            <div
              className={cn(
                fieldBase,
                fieldHeight,
                mobileField,
                "md:border-l md:flex-1",
                active === "nights" ? activeClass : ""
              )}
            >
              <NightsPicker
                nightsFrom={state.nightsFrom}
                nightsTo={state.nightsTo}
                open={active === "nights"}
                onOpenChange={(open) =>
                  setActive((prev) => (open ? "nights" : prev === "nights" ? null : prev))
                }
                onChange={(patch) => onPatch(patch)}
              />
            </div>

            <div
              className={cn(
                fieldBase,
                fieldHeight,
                mobileField,
                mobileLastField,
                "md:border-l md:flex-1",
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

            {!hideSubmitButton && (
              <div
                className={cn(
                  "w-full flex items-center justify-center min-h-[56px]",
                  "rounded-xl border-0 bg-transparent md:rounded-none md:border-t md:border-l md:border-[var(--border)] md:basis-[200px] md:flex-shrink-0 md:bg-transparent"
                )}
              >
                <Button
                  type="button"
                  onClick={onSubmit}
                  className={cn(
                    "h-full w-full min-h-[56px] rounded-xl border-0 bg-primary hover:bg-primary/90 text-white text-lg font-semibold tracking-tight",
                    "md:rounded-none md:rounded-r-[var(--radius)]"
                  )}
                >
                  {submitLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

