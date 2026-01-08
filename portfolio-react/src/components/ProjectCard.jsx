import { useRef } from 'react'

const ProjectCard = ({ project, index, onClick }) => {
  const videoRef = useRef(null)
  const imageCount = (project.images?.length || 0) + (project.videos?.length || 0) + (project.pdfs?.length || 0)
  const hasVideos = project.videos?.length > 0
  const hasPdfs = project.pdfs?.length > 0
  const hasOnlyVideos = project.videos?.length > 0 && !project.images?.length
  const hasOnlyPdfs = hasPdfs && !project.images?.length && !project.videos?.length

  const isVideo = (url) => url?.match(/\.(mp4|mov|webm)$/i);
  const isPdfOnly = project.thumbnail === 'pdf' || hasOnlyPdfs;
  const isVideoOnly = hasOnlyVideos;

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => { })
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  const renderThumbnail = () => {
    if (isPdfOnly) {
      // Get PDF filename for display
      const pdfName = project.pdfs?.[0]?.split('/').pop()?.replace('.pdf', '') || project.name
      return (
        <div className="pdf-thumbnail">
          <div className="pdf-icon-wrapper">
            <i className="fas fa-file-pdf"></i>
          </div>
          <span className="pdf-project-name">{project.name}</span>
          <span className="pdf-label">Branding Deck</span>
        </div>
      )
    }
    if (hasVideos || isVideo(project.thumbnail)) {
      const videoSrc = (project.videos?.[0] || project.thumbnail) + "#t=0.001"
      const posterSrc = !isVideo(project.thumbnail) ? project.thumbnail : undefined

      return (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          muted
          loop
          playsInline
          preload="metadata"
        />
      )
    }
    return (
      <img
        src={project.thumbnail}
        alt={project.name}
        loading="lazy"
        decoding="async"
        onError={(e) => { e.target.style.display = 'none' }}
      />
    )
  }

  return (
    <div
      className="project-card"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="project-thumbnail">
        {renderThumbnail()}
        <div className="project-overlay">
          <span className="project-view">
            <i className="fas fa-eye"></i> View Project
          </span>
        </div>
        {imageCount > 1 && (
          <span className="project-count">
            {hasVideos && <i className="fas fa-video"></i>}
            {hasPdfs && !hasVideos && <i className="fas fa-file-pdf"></i>}
            {imageCount} items
          </span>
        )}
        {isVideoOnly && (
          <span className="video-play-hint">
            <i className="fas fa-play"></i>
          </span>
        )}
      </div>
      <div className="project-info">
        <h3 className="project-name">{project.name}</h3>
        <p className="project-type">{project.type}</p>
      </div>
    </div>
  )
}

export default ProjectCard
