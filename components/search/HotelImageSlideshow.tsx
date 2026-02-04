"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface HotelImageSlideshowProps {
  images: string[]
  alt: string
  tourId: string
  /** Container class: e.g. aspect-[4/3] md:aspect-auto md:h-full for card; must include overflow-hidden rounded-[12px] */
  className?: string
  /** When true, render without Link (e.g. for tour detail hero) */
  disableLink?: boolean
}

export function HotelImageSlideshow({
  images,
  alt,
  tourId,
  className = "relative h-full w-full overflow-hidden rounded-[12px]",
  disableLink = false,
}: HotelImageSlideshowProps) {
  const [index, setIndex] = useState(0)
  const count = images.length
  const isSingle = count <= 1
  const maxDots = 5
  const dotCount = Math.min(count, maxDots)
  const activeDotIndex =
    count <= 1 ? 0 : Math.round((index / (count - 1)) * (dotCount - 1))
  const goToDot = useCallback(
    (dotIndex: number) => {
      if (dotCount <= 1) return
      const newIndex =
        dotCount === 1 ? 0 : Math.round((dotIndex / (dotCount - 1)) * (count - 1))
      setIndex(Math.min(newIndex, count - 1))
    },
    [count, dotCount]
  )

  const goPrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIndex((i) => (i === 0 ? count - 1 : i - 1))
    },
    [count]
  )

  const goNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIndex((i) => (i === count - 1 ? 0 : i + 1))
    },
    [count]
  )

  if (count === 0) return null

  const singleImage = (
    <Image
      src={images[0]}
      alt={alt}
      fill
      className="object-cover transition-transform duration-300 hover:scale-[1.03]"
      sizes={disableLink ? "100vw" : "(max-width: 768px) 100vw, 280px"}
    />
  )

  if (isSingle) {
    if (disableLink) {
      return (
        <div className="relative block h-full w-full overflow-hidden">
          {singleImage}
        </div>
      )
    }
    return (
      <Link
        href={`/tour/${tourId}`}
        className="relative block h-full w-full overflow-hidden rounded-[12px]"
        target="_blank"
        rel="noopener noreferrer"
      >
        {singleImage}
      </Link>
    )
  }

  const carouselContent = (
    <>
      {/* Track */}
      <div
        className="flex h-full w-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-full w-full shrink-0"
            style={{ minWidth: "100%" }}
          >
            <Image
              src={src}
              alt={`${alt} — ${i + 1}`}
              fill
              className="object-cover"
              sizes={disableLink ? "100vw" : "(max-width: 768px) 100vw, 280px"}
            />
          </div>
        ))}
      </div>

      {/* Arrows — visible on hover */}
      <button
        type="button"
        aria-label="Предыдущее фото"
        onClick={goPrev}
        className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        style={{ left: 8 }}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Следующее фото"
        onClick={goNext}
        className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none"
        style={{ right: 8 }}
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Dots — bottom center, max 5 dots */}
      <div
        className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5"
        style={{ bottom: 8 }}
        onClick={(e) => e.stopPropagation()}
      >
        {Array.from({ length: dotCount }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={dotCount === count ? `Фото ${i + 1}` : `К слайду ${i + 1}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              goToDot(i)
            }}
            className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors"
            style={{
              width: 6,
              height: 6,
              backgroundColor: i === activeDotIndex ? "white" : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </>
  )

  const carouselClassName = disableLink
    ? `group relative block h-full w-full overflow-hidden ${className ?? ""}`
    : `group relative block h-full w-full overflow-hidden rounded-[12px] ${className ?? ""}`

  if (disableLink) {
    return <div className={carouselClassName}>{carouselContent}</div>
  }
  return (
    <Link
      href={`/tour/${tourId}`}
      className={carouselClassName}
      target="_blank"
      rel="noopener noreferrer"
    >
      {carouselContent}
    </Link>
  )
}
