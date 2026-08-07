'use client'

import { useState, useRef } from 'react'
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type MediaItem = {
  url: string
  alt?: string
  isMain?: boolean
  type?: 'image' | 'video'
  title?: string
}

interface MediaUploaderProps {
  label?: string
  value: MediaItem[]
  onChange: (items: MediaItem[]) => void
  accept?: 'image' | 'video' | 'both'
  multiple?: boolean
}

export function MediaUploader({
  label = 'Imágenes',
  value,
  onChange,
  accept = 'image',
  multiple = true,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const newItems: MediaItem[] = []
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Error al subir archivo')
        }
        const data = await res.json()
        newItems.push({
          url: data.url,
          alt: file.name,
          type: data.type === 'video' ? 'video' : 'image',
        })
      }
      onChange([...value, ...newItems])
      toast.success(`${newItems.length} archivo(s) subido(s) correctamente`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const addUrl = () => {
    if (!urlInput.trim()) return
    const isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(urlInput) ||
      /youtube|youtu\.be|vimeo/.test(urlInput)
    onChange([...value, { url: urlInput.trim(), type: isVideo ? 'video' : 'image' }])
    setUrlInput('')
    setShowUrlInput(false)
    toast.success('Enlace agregado')
  }

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx))
  }

  const setMain = (idx: number) => {
    onChange(value.map((item, i) => ({ ...item, isMain: i === idx })))
  }

  const acceptAttr =
    accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/*'

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploading ? 'Subiendo...' : 'Subir archivo'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
        >
          <LinkIcon className="h-4 w-4 mr-1" />
          Pegar URL
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptAttr}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
        />
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addUrl()
              }
            }}
          />
          <Button type="button" size="sm" onClick={addUrl}>
            Agregar
          </Button>
        </div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((item, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg border border-border overflow-hidden bg-muted aspect-square"
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  controls
                />
              ) : (
                 
                <img
                  src={item.url}
                  alt={item.alt || ''}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                {accept === 'image' && (
                  <Button
                    type="button"
                    size="sm"
                    variant={item.isMain ? 'default' : 'secondary'}
                    onClick={() => setMain(idx)}
                    className="h-7 px-2 text-xs"
                  >
                    {item.isMain ? '★ Principal' : 'Hacer principal'}
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-7 w-7"
                  onClick={() => remove(idx)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {item.isMain && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                  ★
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay archivos. Sube desde tu dispositivo o pega una URL.</p>
        </div>
      )}
    </div>
  )
}
