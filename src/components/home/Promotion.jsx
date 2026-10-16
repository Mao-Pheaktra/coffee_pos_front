import React, { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getActiveEvents } from '../../services/eventService'

const beanDots = [
  { top: '12%', left: '8%', size: 18, rotate: 20 },
  { top: '70%', left: '4%', size: 14, rotate: -15 },
  { top: '20%', left: '92%', size: 16, rotate: 40 },
  { top: '78%', left: '90%', size: 20, rotate: -25 },
  { top: '45%', left: '96%', size: 12, rotate: 10 },
]

const Promotion = () => {
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActiveEvent = async () => {
      try {
        const response = await getActiveEvents()

        console.log('Active events:', response)

        // If backend returns an array
        if (Array.isArray(response) && response.length > 0) {
          setEvent(response[0])
        }

        // If backend returns { data: [...] }
        else if (
          response?.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          setEvent(response.data[0])
        }
      } catch (error) {
        console.error('Failed to load active event:', error)
      } finally {
        setLoading(false)
      }
    }

    loadActiveEvent()
  }, [])

  const handleToMenu = () => {
    navigate('/menu')
  }

  // Loading
  if (loading) {
    return null
  }

  // No active event
  if (!event) {
    return null
  }

  return (
    <section className="max-w-300 mx-auto px-6 lg:px-10 py-4 lg:py-8">
      <div className="relative overflow-hidden bg-(--color-primary-dark) rounded-xl px-8 py-14 lg:px-16 lg:py-20 text-center">

        {/* Decorative bean dots */}
        {beanDots.map((b, i) => (
          <span
            key={i}
            className="absolute rounded-[50%] border border-(--color-secondary)"
            style={{
              top: b.top,
              left: b.left,
              width: b.size,
              height: b.size * 1.4,
              transform: `rotate(${b.rotate}deg)`,
              opacity: 0.18,
            }}
          />
        ))}

        <div className="relative max-w-140 mx-auto">

          {/* Banner Tag */}
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-(--color-secondary) mb-4">
            {event.bannerTag || 'SPECIAL EVENT'}
          </p>

          {/* Event Name */}
          <p className="font-semibold text-(--color-secondary) uppercase mb-4 text-3xl">
            {event.name}
          </p>

          {/* Event Image */}
          {event.thumbnail && (
            <div className="mb-8">
              <img
                src={event.thumbnail}
                alt={event.name}
                className="w-full max-h-80 object-cover rounded-xl"
              />
            </div>
          )}

          {/* Description */}
          <p className="text-(--color-secondary-light) mb-8">
            {event.description}
          </p>

          {/* Reward */}
          {event.rewardCondition && (
            <p className="text-xl font-semibold text-(--color-secondary) mb-4">
              {event.rewardCondition}
            </p>
          )}

          {/* Button */}
          <button
            type="button"
            onClick={handleToMenu}
            className="inline-flex items-center gap-2 bg-(--color-secondary) text-(--color-primary-dark) rounded-(--radius-pill) mt-3 px-8 py-3.5 font-semibold hover:bg-(--color-secondary-light) transition"
          >
            Shop Coffee
            <ArrowRight size={18} />
          </button>

          {/* Limited time */}
          <p className="text-xl text-(--color-secondary-light) opacity-70 mt-4">
            Limited time offer
          </p>
        </div>
      </div>
    </section>
  )
}

export default Promotion