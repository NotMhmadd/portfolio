import { useEffect, useRef, useMemo } from 'react'

const sortByFilename = (files) => {
  if (!files) return []
  return [...files].sort((a, b) => {
    const nameA = a.split('/').pop().toLowerCase()
    const nameB = b.split('/').pop().toLowerCase()
    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' })
  })
}

const Modal = ({ project, onClose, onImageClick }) => {
  const galleryRef = useRef(null)

  // Sort images and videos - must be before any conditional returns (Rules of Hooks)
  const sortedImages = useMemo(() => sortByFilename(project?.images), [project?.images])
  const sortedVideos = useMemo(() => sortByFilename(project?.videos), [project?.videos])

  useEffect(() => {
    if (!project && galleryRef.current) {
      // Pause all videos when closing
      galleryRef.current.querySelectorAll('video').forEach(v => v.pause())
    }
  }, [project])

  if (!project) return null

  return (
    <div className={`modal ${project ? '' : 'hidden'}`}>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        <div className="modal-header-new">
          <div className="modal-header-top">
            <h2 className="modal-title-large">{project.name}</h2>
            <span className="modal-category">{project.type}</span>
          </div>
          {project.description && (
            <p className="modal-description-inline">{project.description}</p>
          )}
        </div>
        <div className="modal-gallery" ref={galleryRef}>
          {sortedImages.map((src, index) => (
            <div
              key={`img-${index}`}
              className="gallery-item"
              onClick={() => onImageClick(src, sortedImages, index)}
            >
              <img
                src={src}
                alt={`${project.name} - ${index + 1}`}
                loading="eager"
                onError={(e) => { e.target.parentElement.style.display = 'none' }}
              />
            </div>
          ))}
          {sortedVideos.map((src, index) => (
            <div
              key={`vid-${index}`}
              className="gallery-item video-item"
            >
              <video
                src={src + "#t=0.001"}
                controls
                preload="metadata"
                className="modal-video"
              />
              <div className="video-badge">
                <i className="fas fa-play"></i>
              </div>
            </div>
          ))}
          {project.pdfs?.map((src, index) => (
            <div
              key={`pdf-${index}`}
              className="gallery-item pdf-item"
            >
              <a href={src} target="_blank" rel="noopener noreferrer" className="pdf-link">
                <div className="pdf-preview">
                  <i className="fas fa-file-pdf"></i>
                </div>
                <div className="pdf-info">
                  <span className="pdf-name">{src.split('/').pop().replace('.pdf', '')}</span>
                  <span className="pdf-label">Click to view PDF</span>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Modal
