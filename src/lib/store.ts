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
  | 'wishlist'
  | 'track'
  | 'custom'

type AdminSection =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'site'
  | 'sections'
  | 'gallery'
  | 'testimonials'
  | 'reviews'
  | 'faq'
  | 'newsletter'
  | 'customRequests'
  | 'stockNotifications'
  | 'coupons'
  | 'blog'
  | 'questions'
  | 'bundles'
  | 'stories'
  | 'loyalty'
  | 'analytics'

interface AppState {
  // Navegación
  view: View
  storeSection: StoreSection
  selectedProductId: string | null
  selectedCategory: string | null
  searchQuery: string

  // Admin
  adminAuthed: boolean
  adminSection: AdminSection

  // Carrito
  cart: CartItem[]

  // Wishlist (lista de deseos)
  wishlist: string[] // array de productIds

  // Productos vistos recientemente (hasta 8)
  recentlyViewed: string[]

  // Datos cacheados del storefront
  siteConfig: SiteConfig | null
  products: ProductWithRelations[]
  cartOpen: boolean
  wishlistOpen: boolean
  loginOpen: boolean

  // Acciones de navegación
  setView: (v: View) => void
  goToSection: (s: StoreSection) => void
  openProduct: (id: string) => void
  setCategory: (slug: string | null) => void
  setSearch: (q: string) => void

  // Acciones admin
  setAdminAuthed: (v: boolean) => void
  setAdminSection: (s: AdminSection) => void

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

  // Wishlist
  toggleWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  setWishlistOpen: (v: boolean) => void

  // Recently viewed
  trackView: (productId: string) => void

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
      wishlist: [],
      recentlyViewed: [],

      siteConfig: null,
      products: [],
      cartOpen: false,
      wishlistOpen: false,
      loginOpen: false,

      setView: (v) => set({ view: v }),
      goToSection: (s) =>
        set({ view: 'store', storeSection: s, selectedProductId: null }),
      openProduct: (id) => {
        const state = get()
        set({
          view: 'store',
          storeSection: 'product',
          selectedProductId: id,
          recentlyViewed: [id, ...state.recentlyViewed.filter((x) => x !== id)].slice(0, 8),
        })
      },
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

      // Wishlist
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),
      isInWishlist: (productId) => get().wishlist.includes(productId),
      setWishlistOpen: (v) => set({ wishlistOpen: v }),

      // Recently viewed
      trackView: (productId) =>
        set((state) => ({
          recentlyViewed: [
            productId,
            ...state.recentlyViewed.filter((x) => x !== productId),
          ].slice(0, 8),
        })),

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
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed,
      }),
    },
  ),
)
