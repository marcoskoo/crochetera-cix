'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BookOpen, ArrowLeft, Calendar, Search, Sparkles } from 'lucide-react'
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

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const openBlogPost = useStore((s) => s.openBlogPost)
  const goToSection = useStore((s) => s.goToSection)

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then((data: BlogPost[]) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    posts.forEach((p) => parseTags(p.tags).forEach((t) => set.add(t)))
    return Array.from(set).slice(0, 12)
  }, [posts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        (p.tags || '').toLowerCase().includes(q),
    )
  }, [posts, query])

  return (
    <section className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goToSection('home')}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al inicio
        </Button>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            Blog de CROCHETERA.CIX
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Historias del taller
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl mx-auto">
            Cuidados, tips de crochet y las historias detrás de cada peluche tejido a mano.
          </p>
        </div>
      </motion.div>

      {/* Buscador */}
      {posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artículos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>
      )}

      {/* Tags */}
      {allTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer hover:bg-accent hover:border-primary/50 transition-colors"
              onClick={() => setQuery(tag)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </motion.div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-0 overflow-hidden">
              <div className="aspect-video bg-muted animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                <div className="h-3 bg-muted rounded animate-pulse w-full" />
                <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 max-w-md mx-auto"
        >
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-12 w-12 text-primary/60" />
          </div>
          <p className="text-lg font-medium mb-2">
            {posts.length === 0 ? 'Aún no hay artículos' : 'Sin resultados'}
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            {posts.length === 0
              ? 'Pronto compartiremos tips de crochet, cuidados e historias del taller.'
              : 'Intenta con otra búsqueda o etiqueta.'}
          </p>
          {posts.length === 0 ? (
            <Button onClick={() => goToSection('home')} className="btn-crochet">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setQuery('')}>
              Limpiar búsqueda
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => {
            const tags = parseTags(post.tags).slice(0, 3)
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.4) }}
              >
                <Card
                  className="group h-full overflow-hidden p-0 cursor-pointer hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                  onClick={() => openBlogPost(post.id)}
                >
                  <div className="aspect-video overflow-hidden bg-muted relative">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-accent/40 to-secondary">
                        📝
                      </div>
                    )}
                    {post.featured && (
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Destacado
                      </Badge>
                    )}
                  </div>
                  <div className="p-5 space-y-3 flex flex-col">
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <h3 className="font-display font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                      <span className="text-xs text-muted-foreground">por {post.author}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}
