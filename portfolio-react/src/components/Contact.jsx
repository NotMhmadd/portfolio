import { useEffect, useRef } from 'react'

const Contact = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (sectionRef.current) {
      sectionRef.current.style.opacity = '0'
      sectionRef.current.style.transform = 'translateY(30px)'
      sectionRef.current.style.transition = 'all 0.6s ease'
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="contact" className="contact-section" ref={sectionRef}>
      <div className="container">
        <div className="contact-content">
          <span className="contact-badge">
            <span className="status-dot"></span> Available for work
          </span>
          <h2>Let's Create<br /><span className="highlight-text">Something Amazing</span></h2>
          <p>Have a project in mind? I'd love to hear about it and discuss how we can work together.</p>

          <div className="contact-cards">
            <a href="mailto:mhmadghazal51@gmail.com" className="contact-card">
              <div className="contact-card-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="contact-card-info">
                <span className="contact-card-label">Email me at</span>
                <span className="contact-card-value">mhmadghazal51@gmail.com</span>
              </div>
              <i className="fas fa-arrow-right contact-card-arrow"></i>
            </a>

            <a href="tel:+96171371310" className="contact-card">
              <div className="contact-card-icon">
                <i className="fas fa-phone"></i>
              </div>
              <div className="contact-card-info">
                <span className="contact-card-label">Call me at</span>
                <span className="contact-card-value">(+961) 71 371310</span>
              </div>
              <i className="fas fa-arrow-right contact-card-arrow"></i>
            </a>

            <div className="contact-card location">
              <div className="contact-card-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="contact-card-info">
                <span className="contact-card-label">Based in</span>
                <span className="contact-card-value">Beirut, Lebanon</span>
              </div>
            </div>
          </div>

          <div className="social-section">
            <a
              href="https://www.linkedin.com/in/mohamad-ghazal/"
              target="_blank"
              rel="noopener noreferrer"
              className="linkedin-cta"
            >
              <i className="fab fa-linkedin-in"></i>
              Connect on LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
