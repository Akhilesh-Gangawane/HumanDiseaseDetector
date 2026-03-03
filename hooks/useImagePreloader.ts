'use client'

import { useState, useEffect } from 'react'

export function useImagePreloader(imageCount: number, basePath: string) {
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = []
    let loadedCount = 0

    const loadImage = (index: number) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        const frameNumber = String(index).padStart(3, '0')
        img.src = `${basePath}/ezgif-frame-${frameNumber}.jpg`
        
        img.onload = () => {
          loadedCount++
          setProgress(Math.round((loadedCount / imageCount) * 100))
          resolve(img)
        }
        
        img.onerror = reject
      })
    }

    Promise.all(
      Array.from({ length: imageCount }, (_, i) => loadImage(i + 1))
    )
      .then((imgs) => {
        setImages(imgs)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error loading images:', error)
        setIsLoading(false)
      })
  }, [imageCount, basePath])

  return { images, isLoading, progress }
}
