'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, SiteConfig, ProductWithRelations } from '@/lib/types'

type View = 'store' | 'admin'

type StoreSection =
  | 'home'
  | 'catalog'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'about'
  | 'contact'
  | 'gallery'

interface AppState {
  // Navegación
  view: View
  storeSection: StoreSection
  selectedProductId: string | null
  selectedCategory: string | null
  searchQuery: string

  // Admin
  adminAuthed: boolean
  adminSection:
    | 'dashboard'
    | 'products'
    | 'categories'
    | 'orders'
    | 'site'
    | 'sections'
    | 'gallery'
    | 'testimonials'

  // Carrito
  cart: CartItem[]

  // Datos cacheados del storefront
  siteConfig: SiteConfig | null
  products: ProductWithRelations[]
  cartOpen: boolean
  loginOpen: boolean

  // Acciones de navegación
  setView: (v: View) => void
  goToSection: (s: StoreSection) => void
  openProduct: (id: string) => void
  setCategory: (slug: string | null) => void
  setSearch: (q: string) => void

  // Acciones admin
  setAdminAuthed: (v: boolean) => void
  setAdminSection: (s: AppState['adminSection']) => void

  // Cache data
  setSiteConfig: (c: SiteConfig) => void
  setProducts: (p: ProductWithRelations[]) => void

  // Carrito
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  setCartOpen: (v: boolean) => void
  setLoginOpen: (v: boolean) => void

  // Helpers
  cartTotal: () => number
  cartCount: () => number
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: 'store',
      storeSection: 'home',
      selectedProductId: null,
      selectedCategory: null,
      searchQuery: '',

      adminAuthed: false,
      adminSection: 'dashboard',

      cart: [],

      siteConfig: null,
      products: [],
      cartOpen: false,
      loginOpen: false,

      setView: (v) => set({ view: v }),
      goToSection: (s) =>
        set({ view: 'store', storeSection: s, selectedProductId: null }),
      openProduct: (id) =>
        set({ view: 'store', storeSection: 'product', selectedProductId: id }),
      setCategory: (slug) => set({ selectedCategory: slug, storeSection: 'catalog' }),
      setSearch: (q) => set({ searchQuery: q }),

      setAdminAuthed: (v) => set({ adminAuthed: v }),
      setAdminSection: (s) => set({ adminSection: s }),

      setSiteConfig: (c) => set({ siteConfig: c }),
      setProducts: (p) => set({ products: p }),

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((c) => c.productId === item.productId)
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.productId === item.productId
                  ? { ...c, quantity: c.quantity + item.quantity }
                  : c,
              ),
            }
          }
          return { cart: [...state.cart, item] }
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((c) => c.productId !== productId),
        })),
      updateQuantity: (productId, qty) =>
        set((state) => ({
          cart: state.cart.map((c) =>
            c.productId === productId ? { ...c, quantity: Math.max(1, qty) } : c,
          ),
        })),
      clearCart: () => set({ cart: [] }),
      setCartOpen: (v) => set({ cartOpen: v }),
      setLoginOpen: (v) => set({ loginOpen: v }),

      cartTotal: () => get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'crochetera-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        adminAuthed: state.adminAuthed,
        view: state.view,
        adminSection: state.adminSection,
        storeSection: state.storeSection,
        selectedCategory: state.selectedCategory,
      }),
    },
  ),
)
