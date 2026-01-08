import { useState, useEffect } from 'react'

const Navbar = ({ visible }) => {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['work', 'about', 'contact']
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            return
          }
        }
      }
      
      // If at the top, no section is active
      if (window.scrollY < 300) {
        setActiveSection('')
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (e, id) => {
    e.preventDefault()
    const element = document.querySelector(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav 
      className="creative-nav" 
      style={{ 
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      <a href="#" className="nav-logo" onClick={scrollToTop}>
        <span className="logo-bracket">[</span>
        <span className="logo-text">MG</span>
        <span className="logo-bracket">]</span>
      </a>
      
      <div className="nav-links">
        <span className="nav-index">01</span>
        <a 
          href="#work" 
          className={activeSection === 'work' ? 'active' : ''}
          onClick={(e) => scrollTo(e, '#work')}
        >
          Work
        </a>
        <span className="nav-dot">•</span>
        <span className="nav-index">02</span>
        <a 
          href="#about" 
          className={activeSection === 'about' ? 'active' : ''}
          onClick={(e) => scrollTo(e, '#about')}
        >
          About
        </a>
        <span className="nav-dot">•</span>
        <span className="nav-index">03</span>
        <a 
          href="#contact" 
          className={activeSection === 'contact' ? 'active' : ''}
          onClick={(e) => scrollTo(e, '#contact')}
        >
          Contact
        </a>
      </div>
    </nav>
  )
}

export default Navbar
