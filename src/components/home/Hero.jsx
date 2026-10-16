import React, { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { getGeneralSettings } from '../../services/generalSettingService'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response =
          await getGeneralSettings()

        setSettings(response.data)
      } catch (error) {
        console.error(
          'Failed to fetch general settings:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])
  const navigate = useNavigate()
  const handleToMenu=()=>{
    navigate('/menu')
  }

  const heroImage =
    settings?.hero_image ||
    'https://i.pinimg.com/1200x/74/d5/31/74d53157cbe498cf30f1ea90649abe52.jpg'

  const heroTitle =
    settings?.hero_title ||
    'Coffee, roasted with intention.'

  const heroDescription =
    settings?.hero_description ||
    "We buy direct from growers, roast in batches under ten kilos, and ship within 48 hours — so what's in the bag still remembers the farm it came from."

  const featuredTitle =
    settings?.featured_section_title ||
    'Popular Products'

  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden bg-[var(--color-primary-dark)]">

      {/* HERO IMAGE */}

      <img
        src={heroImage}
        alt="Coffee"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* SCRIM */}

      <div className="absolute inset-0 bg-[var(--color-primary-dark)] opacity-55" />

      {/* CONTENT */}

      <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-8 lg:px-10 lg:py-24">

        <div>

          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary-light)]">
            Single-origin · Small batch
          </p>

          <h1 className="max-w-[10ch] text-[var(--color-secondary-light)]">
            {heroTitle}
          </h1>

          <p className="mt-5 max-w-[46ch] text-lg text-[var(--color-secondary-light)]">
            {heroDescription}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">

            <button onClick={handleToMenu}
             className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-secondary)] px-7 py-3.5 font-semibold text-[var(--color-primary-dark)] shadow-[var(--shadow-md)] hover:bg-[var(--color-secondary-light)]">
              Shop the roast
              <ArrowRight size={18} />
            </button>

            <button className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-text-light)] px-7 py-3.5 text-[var(--color-text-light)] transition-colors hover:bg-[var(--color-text-light)] hover:text-[var(--color-primary-dark)]">
              Find your blend
            </button>

          </div>

          <div className="mt-10 flex items-center gap-8 text-sm text-[var(--color-secondary-light)]">

            <div>
              <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-text-light)]">
                12
              </p>

              <p>Origin farms</p>
            </div>

            <div className="h-8 w-px bg-[var(--color-text-light)] opacity-30" />

            <div>
              <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-text-light)]">
                48h
              </p>

              <p>Roast to doorstep</p>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

export default Hero