import { useState, useMemo } from 'react'
import { projects } from '../data/projects'
import ProjectCard from './ProjectCard'

const Work = ({ onProjectClick }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  // Get unique categories
  const categories = useMemo(() => {
    const types = [...new Set(projects.map(p => p.type))]
    return ['All', ...types]
  }, [])

  const filteredProjects = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(term) ||
        project.type.toLowerCase().includes(term)
      const matchesFilter = activeFilter === 'All' || project.type === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [searchTerm, activeFilter])

  return (
    <section id="work" className="work-section">
      <div className="container">
        <div className="section-header">
          <div className="section-title-group">
            <h2>Selected Work</h2>
            <p className="section-subtitle">
              A collection of selected works specializing in social media, branding, and art direction.
            </p>
          </div>
          <div className="search-wrapper">
            <i className="fas fa-search"></i>
            <input
              type="text"
              id="searchBar"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div className="filter-bar">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat === 'All' ? 'All Projects' : cat}
            </button>
          ))}
        </div>

        <div className="projects-grid" id="gallery">
          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-search"></i>
              <h4>No projects found</h4>
              <p>Try adjusting your search or filter criteria</p>
              <button
                className="btn btn-outline"
                onClick={() => { setSearchTerm(''); setActiveFilter('All') }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                priority={index < 4} // Eager load first 4 items
                onClick={() => onProjectClick(project)}
              />
            ))
          )}
        </div>

        {filteredProjects.length > 0 && filteredProjects.length !== projects.length && (
          <div className="filter-results">
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        )}
      </div>
    </section>
  )
}

export default Work
