import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react'
import Card from "../../components/menu/Card";
import {
  getFavorites,
  removeFavorite,
} from '../../services/favoriteService'

export default function FavoritesPage() {
  const navigate = useNavigate()

  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)
  const [error, setError] = useState('')

  // ==========================================
  // LOAD FAVORITES
  // ==========================================

  useEffect(() => {
    const loadFavorites = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await getFavorites()

        setFavorites(response?.data || [])
      } catch (error) {
        console.error('Failed to load favorites:', error)

        if (error.response?.status === 401) {
          navigate('/login')
          return
        }

        setError(
          error.response?.data?.message ||
          'Failed to load your favorites.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [navigate])

  // ==========================================
  // REMOVE FAVORITE
  // ==========================================

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId)

      await removeFavorite(productId)

      setFavorites((current) =>
        current.filter(
          (favorite) =>
            favorite.product_id !== productId
        )
      )
    } catch (error) {
      console.error('Failed to remove favorite:', error)

      setError(
        error.response?.data?.message ||
        'Failed to remove favorite.'
      )
    } finally {
      setRemovingId(null)
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-(--color-neutral) flex items-center justify-center">
        <div className="text-sm text-(--color-text-muted)">
          Loading favorites...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-(--color-neutral)">

      {/* HEADER */}

      <div className="border-b border-(--color-border)">
        <div className="mx-auto max-w-6xl px-6 py-6">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 text-sm text-(--color-text-secondary) hover:text-(--color-primary)"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center justify-between">

            <div>
              <div className="flex items-center gap-2">
                <Heart
                  size={22}
                  className="text-(--color-primary)"
                />

                <h1
                  className="text-3xl font-bold text-(--color-primary)"
                  style={{
                    fontFamily:
                      'var(--font-heading)',
                  }}
                >
                  My Favorites
                </h1>
              </div>

              <p className="mt-2 text-sm text-(--color-text-secondary)">
                Your saved coffee and favorite items.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/shoppingbags')}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-(--color-text-light) hover:opacity-90"
            >
              <ShoppingBag size={16} />

              Shopping Bag
            </button>

          </div>

        </div>
      </div>

      {/* CONTENT */}

      <main className="mx-auto max-w-6xl px-6 py-8">

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {favorites.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-(--color-secondary-light)">
              <Heart
                size={32}
                className="text-(--color-text-muted)"
              />
            </div>

            <h2
              className="text-xl font-bold text-(--color-primary)"
              style={{
                fontFamily:
                  'var(--font-heading)',
              }}
            >
              No favorites yet
            </h2>

            <p className="mt-2 max-w-sm text-sm text-(--color-text-secondary)">
              Save your favorite drinks and products here
              so you can easily find them later.
            </p>

            <Link
              to="/menu"
              className="mt-6 inline-flex items-center rounded-full bg-(--color-primary) px-6 py-3 text-sm font-semibold text-(--color-text-light) hover:opacity-90"
            >
              Browse Menu
            </Link>

          </div>
        ) : (

          /* FAVORITE PRODUCTS */

<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
  {favorites.map((favorite) => {
    const product = favorite.product

    if (!product) {
      return null
    }

    return (
      <Card
        key={favorite.id}
        product={product}
      />
    )
  })}
</div>
        )}

      </main>
    </div>
  )
}