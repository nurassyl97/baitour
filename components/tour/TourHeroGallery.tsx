"use client"

import { useState } from "react"
import Image from "next/image"

interface TourHeroGalleryProps {
  images: string[]
  alt: string
  /** Max thumbnails to show; не задано — показывать все изображения из Tourvisor */
  maxThumbnails?: number
}

export function TourHeroGallery({
  images,
  alt,
  maxThumbnails,
}: TourHeroGalleryProps) {
  const [index, setIndex] = useState(0)
  const list = images.length ? images : []
  const thumbnails = maxThumbnails != null ? list.slice(0, maxThumbnails) : list

  if (list.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={list[index]}
          alt={`${alt} — ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
      </div>
      {thumbnails.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {thumbnails.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#22a7f0]"
              style={{
                borderColor: i === index ? "#22a7f0" : "transparent",
              }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
