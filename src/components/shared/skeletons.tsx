'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  count?: number
}

// Skeleton para cards de productos
export function ProductCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border ${className}`}>
      <div className="aspect-square shimmer rounded-none" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 shimmer rounded" />
        <div className="h-4 w-3/4 shimmer rounded" />
        <div className="h-3 w-1/2 shimmer rounded" />
        <div className="h-6 w-1/3 shimmer rounded mt-2" />
      </div>
    </div>
  )
}

// Skeleton para grid de productos
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <ProductCardSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

// Skeleton para detalle de producto
export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square shimmer rounded-2xl" />
        <div className="space-y-4">
          <div className="h-4 w-24 shimmer rounded" />
          <div className="h-10 w-3/4 shimmer rounded" />
          <div className="h-4 w-full shimmer rounded" />
          <div className="h-4 w-5/6 shimmer rounded" />
          <div className="h-4 w-2/3 shimmer rounded" />
          <div className="h-12 w-full shimmer rounded-lg mt-4" />
          <div className="h-8 w-1/3 shimmer rounded" />
        </div>
      </div>
    </div>
  )
}

// Skeleton para hero
export function HeroSkeleton() {
  return (
    <section className="py-32 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="h-8 w-48 shimmer rounded-full" />
            <div className="h-16 w-full shimmer rounded" />
            <div className="h-16 w-3/4 shimmer rounded" />
            <div className="h-6 w-full shimmer rounded" />
            <div className="h-6 w-5/6 shimmer rounded" />
            <div className="flex gap-3 mt-4">
              <div className="h-12 w-40 shimmer rounded-lg" />
              <div className="h-12 w-32 shimmer rounded-lg" />
            </div>
          </div>
          <div className="aspect-square max-w-md mx-auto shimmer rounded-full" />
        </div>
      </div>
    </section>
  )
}

// Skeleton genérico
export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return <div className={`shimmer rounded ${className}`} />
}
