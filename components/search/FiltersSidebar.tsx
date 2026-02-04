"use client"

import * as React from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { SearchQueryState } from "./SearchFormState"

type Props = {
  state: SearchQueryState
  onPatch: (patch: Partial<SearchQueryState>) => void
  disabled?: boolean
  className?: string
}

export function FiltersSidebar({ state, onPatch, disabled, className }: Props) {
  return (
    <div className={cn("bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] shadow-sm p-[var(--card-padding)]", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-semibold">Фильтры</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() =>
            onPatch({
              budgetMin: 0,
              budgetMax: 3000000,
              stars: null,
              family: { animation: false, kidsPool: false, kidsClub: false, playground: false },
            })
          }
        >
          Сбросить
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["budget", "stars", "family"]}>
        <AccordionItem value="budget">
          <AccordionTrigger>Бюджет</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Мин. цена</Label>
                  <Input
                    type="number"
                    value={state.budgetMin}
                    onChange={(e) =>
                      onPatch({ budgetMin: Number(e.target.value || 0) })
                    }
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Макс. цена</Label>
                  <Input
                    type="number"
                    value={state.budgetMax}
                    onChange={(e) =>
                      onPatch({ budgetMax: Number(e.target.value || 0) })
                    }
                    disabled={disabled}
                  />
                </div>
              </div>
              <Slider
                value={[state.budgetMin, state.budgetMax]}
                onValueChange={(v) =>
                  onPatch({ budgetMin: v[0] ?? 0, budgetMax: v[1] ?? 0 })
                }
                min={0}
                max={3000000}
                step={10000}
                disabled={disabled}
              />
              <div className="text-xs text-muted-foreground">
                {state.budgetMin.toLocaleString("ru-RU")} – {state.budgetMax.toLocaleString("ru-RU")} ₸
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stars">
          <AccordionTrigger>Класс отеля</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => {
                const active = state.stars !== null && s <= state.stars
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={disabled}
                    onClick={() => onPatch({ stars: state.stars === s ? null : s })}
                    className="p-1"
                    aria-label={`${s} stars`}
                  >
                    <Star
                      className={cn(
                        "size-5",
                        active ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      )}
                    />
                  </button>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="family">
          <AccordionTrigger>Для семейного отдыха</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={state.family.animation}
                  onCheckedChange={(v) =>
                    onPatch({ family: { ...state.family, animation: Boolean(v) } })
                  }
                  disabled={disabled}
                />
                <span className="text-sm">Анимация</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={state.family.kidsPool}
                  onCheckedChange={(v) =>
                    onPatch({ family: { ...state.family, kidsPool: Boolean(v) } })
                  }
                  disabled={disabled}
                />
                <span className="text-sm">Детский бассейн</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={state.family.kidsClub}
                  onCheckedChange={(v) =>
                    onPatch({ family: { ...state.family, kidsClub: Boolean(v) } })
                  }
                  disabled={disabled}
                />
                <span className="text-sm">Детский клуб</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={state.family.playground}
                  onCheckedChange={(v) =>
                    onPatch({ family: { ...state.family, playground: Boolean(v) } })
                  }
                  disabled={disabled}
                />
                <span className="text-sm">Детская площадка</span>
              </label>
              <div className="text-xs text-muted-foreground">
                Сейчас фильтры применяются по описанию/хайлайтам (best‑effort). Подготовлено для дальнейшей интеграции с API.
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

