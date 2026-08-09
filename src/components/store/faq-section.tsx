'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, MessageCircle } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { FAQ } from '@prisma/client'

export function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const goToSection = useStore((s) => s.goToSection)

  useEffect(() => {
    fetch('/api/faq')
      .then((r) => r.json())
      .then(setFaqs)
      .catch(() => {})
  }, [])

  if (faqs.length === 0) return null

  return (
    <section id="faq" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="h-4 w-4" />
            Preguntas frecuentes
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            ¿Tienes dudas?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Aquí respondemos las preguntas más comunes. Si necesitas algo más, escríbenos.
          </p>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <AccordionItem value={faq.id} className="border-0">
                <AccordionTrigger className="px-4 py-4 hover:no-underline text-left font-medium text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-3">¿No encuentras tu respuesta?</p>
          <button
            onClick={() => goToSection('contact')}
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <MessageCircle className="h-4 w-4" />
            Contáctanos directamente
          </button>
        </div>
      </div>
    </section>
  )
}
