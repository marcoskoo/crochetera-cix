// Tipos compartidos de CROCHETERA.CIX
import type {
  SiteConfig,
  Category,
  Product,
  ProductImage,
  ProductVideo,
  Review,
  Section,
  GalleryImage,
  Testimonial,
  Order,
  OrderItem,
} from '@prisma/client'

export type {
  SiteConfig,
  Category,
  Product,
  ProductImage,
  ProductVideo,
  Review,
  Section,
  GalleryImage,
  Testimonial,
  Order,
  OrderItem,
}

// Producto con relaciones incluidas
export type ProductWithRelations = Product & {
  images: ProductImage[]
  videos: ProductVideo[]
  reviews: Review[]
  category: Category | null
}

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string | null
}

export type AdminCredentials = {
  username: string
  password: string
}

// Credenciales admin por defecto (hardcodeadas como pidió la usuaria)
export const ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'ashleykoo',
  password: 'carolinechimoy',
}
