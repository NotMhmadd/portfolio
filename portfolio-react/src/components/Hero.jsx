import { useEffect, useState } from 'react'

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const scrollTo = (e, id) => {
    e.preventDefault()
    const element = document.querySelector(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="hero">
      {/* Subtle noise texture overlay */}
      <div className="hero-noise"></div>

      <div className="container hero-container">
        <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
          <span className="hero-tagline">[ EST. 2026 // BASED IN LEBANON ]</span>

          <h1 className="hero-name">
            MOHAMAD GHAZAL
          </h1>
          <div className="hero-title-line"></div>
          <h2 className="hero-subtitle">
            GRAPHIC DESIGNER<br />
            & AI SPECIALIST.
          </h2>

          <p className="hero-bio">
            Graphic designer with a marketing background, merging human creativity with AI-driven design tools.
          </p>

          <div className="hero-actions">
            <a href="#work" className="btn-explore" onClick={(e) => scrollTo(e, '#work')}>
              <span>[ EXPLORE WORK ]</span>
              <svg className="arrow-icon" width="40" height="12" viewBox="0 0 40 12" fill="none">
                <path d="M0 6H38M38 6L33 1M38 6L33 11" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
          </div>
        </div>

        <div className={`hero-image-wrapper ${isVisible ? 'visible' : ''}`}>
          {/* Scrappy decorative elements */}
          <div className="scrappy-elements">
            <svg className="scrap scrap-circle" width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="55" fill="none" stroke="#1a237e" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
            </svg>
            <svg className="scrap scrap-dots" width="60" height="60" viewBox="0 0 60 60">
              <circle cx="10" cy="10" r="3" fill="#1a237e" opacity="0.3" />
              <circle cx="30" cy="10" r="3" fill="#1a237e" opacity="0.3" />
              <circle cx="50" cy="10" r="3" fill="#1a237e" opacity="0.3" />
              <circle cx="10" cy="30" r="3" fill="#1a237e" opacity="0.3" />
              <circle cx="30" cy="30" r="3" fill="#1a237e" opacity="0.3" />
              <circle cx="50" cy="30" r="3" fill="#1a237e" opacity="0.3" />
              <circle cx="10" cy="50" r="3" fill="#1a237e" opacity="0.3" />
              <circle cx="30" cy="50" r="3" fill="#1a237e" opacity="0.3" />
              <circle cx="50" cy="50" r="3" fill="#1a237e" opacity="0.3" />
            </svg>
            <svg className="scrap scrap-cross" width="40" height="40" viewBox="0 0 40 40">
              <path d="M20 5V35M5 20H35" stroke="#1a237e" strokeWidth="1.5" opacity="0.5" />
            </svg>
            <svg className="scrap scrap-asterisk" width="30" height="30" viewBox="0 0 30 30">
              <path d="M15 3V27M3 15H27M6 6L24 24M24 6L6 24" stroke="#1a237e" strokeWidth="1" opacity="0.4" />
            </svg>
            <svg className="scrap scrap-brackets" width="80" height="100" viewBox="0 0 80 100">
              <path d="M20 10L10 10L10 90L20 90" fill="none" stroke="#1a237e" strokeWidth="1.5" opacity="0.3" />
              <path d="M60 10L70 10L70 90L60 90" fill="none" stroke="#1a237e" strokeWidth="1.5" opacity="0.3" />
            </svg>
            <div className="scrap scrap-text">✦</div>
            <div className="scrap scrap-arrow">↗</div>
          </div>
          <div className="hero-image">
            <img
              src="/images/profile.png"
              alt="Mohamad Ghazal"
              loading="eager"
              fetchpriority="high"
              decoding="sync"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
