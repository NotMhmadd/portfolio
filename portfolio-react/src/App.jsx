import { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Work from './components/Work'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Modal from './components/Modal'
import Lightbox from './components/Lightbox'

function App() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [lightboxImages, setLightboxImages] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [navVisible, setNavVisible] = useState(true)
  const lastScrollRef = useRef(0)

  // Handle scroll for navbar visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset
      if (currentScroll > lastScrollRef.current && currentScroll > 300) {
        setNavVisible(false)
      } else {
        setNavVisible(true)
      }
      lastScrollRef.current = currentScroll
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null)
        } else if (selectedProject) {
          setSelectedProject(null)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lightboxImage, selectedProject])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [selectedProject])

  return (
    <>
      <Navbar visible={navVisible} />
      <Hero />
      <Work onProjectClick={setSelectedProject} />
      <About />
      <Contact />
      <Footer />
      
      <Modal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)}
        onImageClick={(src, images, index) => {
          setLightboxImage(src)
          setLightboxImages(images || [])
          setLightboxIndex(index || 0)
        }}
      />
      
      <Lightbox 
        image={lightboxImage}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onClose={() => {
          setLightboxImage(null)
          setLightboxImages([])
          setLightboxIndex(0)
        }}
        onNavigate={(index) => {
          setLightboxIndex(index)
          setLightboxImage(lightboxImages[index])
        }}
      />
    </>
  )
}

export default App
