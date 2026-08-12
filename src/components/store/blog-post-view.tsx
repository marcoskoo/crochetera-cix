'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Calendar,
  User,
  Share2,
  Link2,
  BookOpen,
  ArrowRight,
  Clock,
} from 'lucide-react'
import type { BlogPost } from '@prisma/client'

function formatDate(date: Date | string | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return []
  return tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

// Convierte el contenido en bloques: h2 (#), h3 (##), listas (-), párrafos
type Block =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'p'; text: string }

function parseContent(content: string): Block[] {
  const lines = content.split('\n')
  const blocks: Block[] = []
  let listBuffer: string[] = []

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({ type: 'ul', items: [...listBuffer] })
      listBuffer = []
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (line.startsWith('## ')) {
      flushList()
      blocks.push({ type: 'h3', text: line.slice(3).trim() })
    } else if (line.startsWith('# ')) {
      flushList()
      blocks.push({ type: 'h2', text: line.slice(2).trim() })
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      listBuffer.push(line.slice(2).trim())
    } else if (line === '') {
      flushList()
    } else {
      flushList()
      blocks.push({ type: 'p', text: line })
    }
  }
  flushList()
  return blocks
}

export function BlogPostView() {
  const selectedBlogPostId = useStore((s) => s.selectedBlogPostId)
  const openBlogPost = useStore((s) => s.openBlogPost)
  const goToSection = useStore((s) => s.goToSection)

  const [allPosts, setAllPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then((data: BlogPost[]) => setAllPosts(Array.isArray(data) ? data : []))
      .catch(() => setAllPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const post = useMemo(
    () => allPosts.find((p) => p.id === selectedBlogPostId) || null,
    [allPosts, selectedBlogPostId],
  )

  // Related: otros artículos, priorizando los que compartan tags
  const related = useMemo(() => {
    if (!post) return []
    const others = allPosts.filter((p) => p.id !== post.id)
    const postTags = parseTags(post.tags)
    const scored = others.map((p) => {
      const shared = parseTags(p.tags).filter((t) => postTags.includes(t)).length
      return { p, shared }
    })
    return scored
      .sort((a, b) => b.shared - a.shared || -1)
      .slice(0, 3)
      .map((s) => s.p)
  }, [post, allPosts])

  const blocks = useMemo(() => (post ? parseContent(post.content) : []), [post])

  const handleShare = async () => {
    if (!post) return
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url,
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData)
        return
      }
    } catch {
      // usuario canceló o error: caer al fallback
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Enlace copiado al portapapeles')
    } catch {
      toast.error('No se pudo copiar el enlace')
    }
  }

  // Estado de carga
  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-6" />
          <div className="aspect-video bg-muted animate-pulse rounded-xl mb-6" />
          <div className="h-10 bg-muted rounded animate-pulse w-3/4 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // No encontrado
  if (!post) {
    return (
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 max-w-md mx-auto"
        >
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-12 w-12 text-primary/60" />
          </div>
          <p className="text-lg font-medium mb-2">Artículo no encontrado</p>
          <p className="text-muted-foreground text-sm mb-6">
            Es posible que el artículo haya sido eliminado o no esté publicado.
          </p>
          <Button onClick={() => goToSection('blog')} className="btn-crochet">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al blog
          </Button>
        </motion.div>
      </section>
    )
  }

  const tags = parseTags(post.tags)

  return (
    <article className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        {/* Volver */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToSection('blog')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al blog
        </Button>

        {/* Encabezado */}
        <div className="space-y-4 mb-8">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            {post.views > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.views} {post.views === 1 ? 'lectura' : 'lecturas'}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="ml-auto"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Compartir
            </Button>
          </div>
        </div>

        {/* Imagen de portada */}
        {post.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="aspect-video rounded-xl overflow-hidden bg-muted mb-8 shadow-lg"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Contenido */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="prose prose-lg max-w-none space-y-5"
        >
          {blocks.length === 0 ? (
            <p className="text-muted-foreground italic">
              Este artículo aún no tiene contenido.
            </p>
          ) : (
            blocks.map((block, i) => {
              if (block.type === 'h2') {
                return (
                  <h2
                    key={i}
                    className="font-display text-2xl md:text-3xl font-bold tracking-tight pt-4"
                  >
                    {block.text}
                  </h2>
                )
              }
              if (block.type === 'h3') {
                return (
                  <h3
                    key={i}
                    className="font-display text-xl md:text-2xl font-semibold tracking-tight pt-2"
                  >
                    {block.text}
                  </h3>
                )
              }
              if (block.type === 'ul') {
                return (
                  <ul key={i} className="list-disc pl-6 space-y-2 text-foreground/90">
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                )
              }
              return (
                <p key={i} className="text-foreground/90 leading-relaxed">
                  {block.text}
                </p>
              )
            })
          )}
        </motion.div>

        {/* Pie del artículo: compartir + volver */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center gap-4 justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToSection('blog')}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Todos los artículos
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Link2 className="h-4 w-4 mr-1" />
              Copiar enlace
            </Button>
            <Button size="sm" onClick={handleShare} className="btn-crochet">
              <Share2 className="h-4 w-4 mr-1" />
              Compartir
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Artículos relacionados */}
      {related.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto mt-16 pt-10 border-t border-border"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-6 text-center">
            Artículos relacionados
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((rp, i) => {
              const rpTags = parseTags(rp.tags).slice(0, 2)
              return (
                <motion.div
                  key={rp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card
                    className="group h-full overflow-hidden p-0 cursor-pointer hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                    onClick={() => {
                      openBlogPost(rp.id)
                      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    <div className="aspect-video overflow-hidden bg-muted">
                      {rp.coverImage ? (
                        <img
                          src={rp.coverImage}
                          alt={rp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-accent/40 to-secondary">
                          📝
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      {rpTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {rpTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <h3 className="font-display font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {rp.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{rp.excerpt}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary pt-1 group-hover:gap-2 transition-all">
                        Leer artículo
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </article>
  )
}
