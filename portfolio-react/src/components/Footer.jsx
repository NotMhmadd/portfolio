const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">MG</span>
            <span className="footer-tagline">Crafting visual stories</span>
          </div>
          <div className="footer-info">
            <p>© {currentYear} Mohamad Ghazal. Crafted in Beirut.</p>
          </div>
          <div className="footer-links">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
