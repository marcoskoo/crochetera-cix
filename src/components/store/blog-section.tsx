'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ArrowRight, Calendar } from 'lucide-react'
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
    .slice(0, 3)
}

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const openBlogPost = useStore((s) => s.openBlogPost)
  const goToSection = useStore((s) => s.goToSection)

  useEffect(() => {
    fetch('/api/blog?limit=3')
      .then((r) => r.json())
      .then((data: BlogPost[]) => setPosts(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && posts.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-accent/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            Blog artesanal
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Tips, historias y cuidados
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Aprende a cuidar tus peluches de crochet y descubre las historias detrás de cada creación.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-0 overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-full" />
                  <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((post, i) => {
              const tags = parseTags(post.tags)
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    className="group h-full overflow-hidden p-0 cursor-pointer hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                    onClick={() => openBlogPost(post.id)}
                  >
                    <div className="aspect-video overflow-hidden bg-muted">
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
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                          Leer
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {!loading && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => goToSection('blog')}
              className="hover:btn-crochet"
            >
              Ver todos los artículos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}
