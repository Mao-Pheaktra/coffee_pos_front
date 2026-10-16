import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, Leaf, Croissant } from 'lucide-react'

const categories = [
  {
    id: 'coffee',
    title: 'Artisan Coffee',
    description:
      'From classic espresso to smooth cold brew, crafted with precision.',
    cta: 'View Selection',
    image:
      'https://static.vecteezy.com/system/resources/thumbnails/072/449/171/small_2x/artisan-barista-creating-delicious-latte-art-with-a-swirl-of-creamy-milk-for-coffee-lovers-everywhere-photo.jpg',
    gradient:
      'linear-gradient(160deg, var(--color-primary-light) 0%, var(--color-primary-dark) 100%)',
    size: 'large',
    icon: Coffee,
  },
  {
    id: 'tea',
    title: 'Fine Teas',
    description: null,
    cta: 'Discover',
    image:
      'https://t3.ftcdn.net/jpg/01/88/45/44/360_F_188454437_DG5stFLz3hqsf4dF9syMJGIgTWfkjkkn.jpg',
    gradient:
      'linear-gradient(160deg, var(--color-tertiary-light) 0%, var(--color-tertiary) 100%)',
    size: 'small',
    icon: Leaf,
  },
  {
    id: 'bakery',
    title: 'Fresh Bakery',
    description: null,
    cta: 'Treat Yourself',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS84tk9wUIT2THCJ1vq3MDie1nzH1hHAQzWJZtULumv2K0o9IlBjEZMMy0&s=10',
    gradient:
      'linear-gradient(160deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
    size: 'small',
    icon: Croissant,
  },
]

const CategoryCard = ({
  id,
  title,
  description,
  cta,
  image,
  gradient,
  size,
  icon: Icon,
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/menu?category=${id}`)
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl flex items-end ${
        size === 'large'
          ? 'h-80 lg:h-full'
          : 'h-80 lg:h-full flex-1'
      }`}
      style={{ background: gradient }}
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {Icon && (
        <Icon
          size={size === 'large' ? 220 : 140}
          className="absolute -right-6 -bottom-6 text-[var(--color-text-light)] opacity-15 rotate-[-8deg] pointer-events-none"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-dark)] via-transparent to-transparent opacity-70" />

      <div className="relative p-6 lg:p-7 z-10">
        <h3
          className={`text-light ${
            size === 'large' ? 'mb-2' : 'mb-3 text-lg'
          }`}
        >
          {title}
        </h3>

        {description && (
          <p className="text-[var(--color-secondary-light)] max-w-[38ch] mb-4">
            {description}
          </p>
        )}

        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center bg-(--color-text-light)/15 backdrop-blur-sm border border-(--color-text-light)/30 text-(--color-text-light) rounded-(--radius-pill) px-5 py-2 text-sm font-semibold hover:bg-[var(--color-text-light)]/25 transition-colors cursor-pointer"
        >
          {cta}
        </button>
      </div>
    </div>
  )
}

const CategorySection = () => {
  const large = categories.find(
    (c) => c.size === 'large'
  )

  const small = categories.filter(
    (c) => c.size === 'small'
  )

  return (
    <section className="bg-(--color-background)">
      <div className="max-w-300 mx-auto px-6 lg:px-10 py-16 lg:py-20">

        <h2 className="text-(--color-text) mb-2">
          Explore Categories
        </h2>

        <p className="text-(--color-text-secondary) mb-8 text-xl">
          Find exactly what you're craving.
        </p>

        <div className="flex flex-col lg:flex-row gap-5 mt-3">

          {large && (
            <div className="lg:w-[62%]">
              <CategoryCard {...large} />
            </div>
          )}

          <div className="lg:w-[38%] flex flex-col gap-5 lg:h-[520px]">
            {small.map((cat) => (
              <CategoryCard
                key={cat.id}
                {...cat}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default CategorySection