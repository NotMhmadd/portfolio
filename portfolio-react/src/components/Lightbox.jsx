import { useEffect, useCallback } from 'react'

const Lightbox = ({ image, images, currentIndex, onClose, onNavigate }) => {
  const handleKeyDown = useCallback((e) => {
    if (!image) return
    
    if (e.key === 'ArrowLeft' && images && currentIndex > 0) {
      onNavigate(currentIndex - 1)
    } else if (e.key === 'ArrowRight' && images && currentIndex < images.length - 1) {
      onNavigate(currentIndex + 1)
    }
  }, [image, images, currentIndex, onNavigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!image) return null

  const canGoPrev = images && currentIndex > 0
  const canGoNext = images && currentIndex < images.length - 1

  return (
    <div 
      className={`image-lightbox ${image ? 'active' : ''}`}
      onClick={onClose}
    >
      <button className="lightbox-close" onClick={onClose}>
        <i className="fas fa-times"></i>
      </button>
      
      {canGoPrev && (
        <button 
          className="lightbox-nav lightbox-prev"
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1) }}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      )}
      
      <img src={image} alt="Full view" onClick={(e) => e.stopPropagation()} />
      
      {canGoNext && (
        <button 
          className="lightbox-nav lightbox-next"
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1) }}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      )}
      
      {images && images.length > 1 && (
        <div className="lightbox-counter">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}

export default Lightbox
