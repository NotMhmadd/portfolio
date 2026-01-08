import { useEffect, useRef } from 'react'
import { skills, experience } from '../data/projects'

const About = () => {
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
    <section id="about" className="about-section" ref={sectionRef}>
      <div className="container">
        <div className="about-grid">
          <div className="about-content">
            <h2>About Me</h2>
            <p className="about-lead">
              I'm a Beirut-based graphic designer and Head of Design at BYND Network, with a marketing background and a passion for creating visuals that tell stories and drive results.
            </p>
            <p>
              With experience at agencies like BYND Network, MAC Platforms, and Ethos (KSA), I've had the privilege of working with brands like McCafé, Popeyes, OPPO, and various regional clients. I blend strategic thinking with creative execution, and I'm passionate about leveraging AI tools to push creative boundaries.
            </p>

            <div className="skills-section">
              <h3 className="skills-title">Tools & Skills</h3>
              <div className="skills-bars">
                {skills.map((skill) => (
                  <div className="skill-bar-item" key={skill.name}>
                    <div className="skill-bar-header">
                      <span className="skill-bar-name">
                        <i className={skill.icon}></i> {skill.name}
                      </span>
                    </div>
                    <div className="skill-bar-track">
                      <div
                        className="skill-bar-fill"
                        style={{ width: `${skill.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="about-experience">
            <h3>Experience</h3>
            <div className="timeline">
              {experience.map((item, index) => (
                <div className={`timeline-item ${item.subtitle ? 'timeline-aside' : ''}`} key={index}>
                  <span className="timeline-date">{item.date}</span>
                  <h4>{item.title}</h4>
                  <p>{item.company}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
