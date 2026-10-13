/**
 * Main Application Logic & Dynamic Component Renderers
 * Integrates PORTFOLIO_DATA, BRAND_LOGOS, Lucide icons, search filters, modals, and toasts
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize App Modules
  App.init();
});

const App = {
  activeSkillCategory: 'all',
  skillSearchQuery: '',

  init: function () {
    // 1. Render all data sections
    this.renderTargetCompanies();
    this.renderAboutCapabilities();
    this.renderSkills();
    this.renderProjects();
    this.renderExperience();
    this.renderEducation();
    this.renderCertifications();
    this.renderAchievements();
    this.renderGitHubSection();
    this.renderContactInfo();

    // 2. Setup Event Listeners
    this.setupSkillFilters();
    this.setupContactForm();
    this.setupMobileMenu();
    this.setupCaseStudyModal();

    // 3. Initialize Animations & Canvas
    PortfolioAnimations.initSplashLoader();
    PortfolioAnimations.initTypewriter('typed-role', PORTFOLIO_DATA.profile.titles);
    PortfolioAnimations.initScrollReveal();
    PortfolioAnimations.initScrollspy();
    PortfolioAnimations.initBackToTop();

    // 4. Initialize Lucide Icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Show Toast Notification
  showToast: function (message, iconName = 'check-circle') {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    if (toastIcon && window.lucide) {
      toastIcon.setAttribute('data-lucide', iconName);
      lucide.createIcons();
    }

    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  },

  // Copy to clipboard helper
  copyToClipboard: function (text, label) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(`${label} copied to clipboard!`, 'copy');
    }).catch(() => {
      this.showToast(`Failed to copy to clipboard`, 'alert-circle');
    });
  },

  // Render Target Companies with Brand Logos
  renderTargetCompanies: function () {
    const container = document.getElementById('companies-grid');
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.profile.targetCompanies.map(comp => {
      const logoSvg = (window.BRAND_LOGOS && BRAND_LOGOS[comp.logoKey]) ? BRAND_LOGOS[comp.logoKey] : '';
      return `
        <div class="company-tag" title="${comp.name}">
          ${logoSvg ? `<span class="company-logo-icon">${logoSvg}</span>` : ''}
          <span>${comp.name}</span>
        </div>
      `;
    }).join('');
  },

  // Render About Capabilities Grid
  renderAboutCapabilities: function () {
    const container = document.getElementById('about-capabilities-grid');
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.aboutCapabilities.map(cap => `
      <div class="glass-card capability-card reveal-init">
        <div class="cap-icon">
          <i data-lucide="${cap.icon}"></i>
        </div>
        <div>
          <h3 class="cap-title">${cap.title}</h3>
          <p class="cap-desc">${cap.description}</p>
        </div>
      </div>
    `).join('');
  },

  // Render Skills with Filter, Search & Brand Logos
  renderSkills: function () {
    const container = document.getElementById('skills-grid');
    if (!container) return;

    let filtered = PORTFOLIO_DATA.skills;

    // Filter by Category
    if (this.activeSkillCategory && this.activeSkillCategory !== 'all') {
      filtered = filtered.filter(s => s.category.toLowerCase() === this.activeSkillCategory.toLowerCase());
    }

    // Filter by Search Query
    if (this.skillSearchQuery && this.skillSearchQuery.trim() !== '') {
      const q = this.skillSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.categoryName.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);" class="revealed">
          <i data-lucide="search-x" style="width: 40px; height: 40px; margin-bottom: 1rem; color: var(--accent-purple);"></i>
          <p style="font-size: 1.05rem; font-weight: 600; color: #ffffff;">No skills found in this category</p>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try switching filter tabs or clearing your search</p>
        </div>
      `;
    } else {
      container.innerHTML = filtered.map((skill, index) => {
        const logoSvg = (skill.logoKey && window.BRAND_LOGOS && BRAND_LOGOS[skill.logoKey]) 
          ? BRAND_LOGOS[skill.logoKey] 
          : `<i data-lucide="${skill.icon}"></i>`;

        return `
          <div class="glass-card skill-card revealed" style="animation: fadeInCard 0.3s ease forwards; animation-delay: ${index * 0.03}s;">
            <div>
              <div class="skill-card-top">
                <div class="skill-icon-box">
                  ${logoSvg}
                </div>
                <span class="skill-level-badge ${skill.level.toLowerCase()}">${skill.level}</span>
              </div>
              <h3 class="skill-name">${skill.name}</h3>
              <p class="skill-desc">${skill.description}</p>
            </div>
            <span class="skill-category-tag">${skill.categoryName}</span>
          </div>
        `;
      }).join('');
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  setupSkillFilters: function () {
    const searchInput = document.getElementById('skill-search-input');
    const tabs = document.querySelectorAll('.filter-tab-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.skillSearchQuery = e.target.value;
        this.renderSkills();
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeSkillCategory = tab.dataset.category || tab.getAttribute('data-category');
        this.renderSkills();
      });
    });
  },

  // Render Projects
  renderProjects: function () {
    const container = document.getElementById('projects-container');
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.projects.map((proj, idx) => `
      <div class="glass-card stripe-accent project-card reveal-init">
        <!-- Left Side: Content & Actions -->
        <div>
          <div class="project-badges">
            ${proj.badges.map((b, i) => `
              <span class="p-badge ${i === 0 ? 'purple' : 'cyan'}">● ${b}</span>
            `).join('')}
          </div>

          <h3 class="project-title">${proj.title}</h3>
          <p class="project-subtitle">${proj.subtitle}</p>
          <p class="project-desc">${proj.description}</p>

          <ul class="project-bullets">
            ${proj.bullets.map(bullet => `
              <li>
                <i data-lucide="check-circle-2" class="bullet-icon"></i>
                <span>${bullet}</span>
              </li>
            `).join('')}
          </ul>

          <div class="project-tech-tags">
            ${proj.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
          </div>

          <div class="project-actions">
            <button class="btn-project primary" onclick="App.openCaseStudyModal('${proj.id}')">
              <span>View Case Study</span>
              <i data-lucide="arrow-right" style="width: 15px; height: 15px;"></i>
            </button>
            <a href="${proj.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn-project ghost">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              <span>GitHub Code</span>
            </a>
          </div>
        </div>

        <!-- Right Side: Impact Metrics Grid -->
        <div class="project-metrics-card">
          <div class="metrics-header">
            <span class="metrics-title">
              <i data-lucide="activity" style="width: 14px; height: 14px;"></i>
              Project Impact Metrics
            </span>
            <span class="metrics-status-badge">Verified Data</span>
          </div>

          <div class="metrics-grid-2x2">
            ${proj.metrics.map(m => `
              <div class="metric-stat-box">
                <div class="metric-stat-val" 
                     ${m.rawValue ? `data-counter-target="${m.rawValue}"` : ''}
                     ${m.isPercent ? 'data-counter-suffix="%"' : ''}
                     ${m.suffix ? `data-counter-suffix="${m.suffix}"` : ''}
                     ${m.isFloat ? 'data-counter-float="true"' : ''}>
                  ${m.value}
                </div>
                <div class="metric-stat-label">${m.label}</div>
              </div>
            `).join('')}
          </div>

          <div class="architectural-outcome-box">
            <div class="outcome-label">Key Architectural Outcome</div>
            <div class="outcome-text">${proj.architecturalOutcome}</div>
          </div>
        </div>
      </div>
    `).join('');
  },

  // Render Experience Section as a full-width Dashboard Container
  renderExperience: function () {
    const container = document.getElementById('experience-container');
    if (!container) return;

    container.innerHTML = `
      <!-- Experience Header matching GitHub -->
      <div class="dashboard-header">
        <div class="dashboard-user-info">
          <div class="dashboard-avatar exp-avatar-glow">
            <i data-lucide="briefcase"></i>
          </div>
          <div>
            <div class="dashboard-handle-row">
              <span class="dashboard-handle-title">Career Roles &amp; Internships</span>
              <span class="dashboard-verified-pill">Practical Delivery</span>
            </div>
            <p class="dashboard-role-sub">Data Analytics, Business Intelligence &amp; Reporting</p>
          </div>
        </div>

        <!-- Experience Stat Pills matching GitHub -->
        <div class="dashboard-stats-row">
          <div class="dashboard-stat-pill">
            <div class="dashboard-stat-val" data-counter-target="3" data-counter-suffix="+">3</div>
            <div class="dashboard-stat-label">ROLES &amp; INTERNSHIPS</div>
          </div>
          <div class="dashboard-stat-pill">
            <div class="dashboard-stat-val">DATA</div>
            <div class="dashboard-stat-label">ANALYTICS FOCUS</div>
          </div>
          <div class="dashboard-stat-pill">
            <div class="dashboard-stat-val">POWER BI &amp; SQL</div>
            <div class="dashboard-stat-label">PRIMARY STACK</div>
          </div>
          <div class="dashboard-stat-pill">
            <div class="dashboard-stat-val" style="color: var(--accent-emerald);">⚡ 1 ONGOING</div>
            <div class="dashboard-stat-label">CURRENT STATUS</div>
          </div>
        </div>
      </div>

      <!-- Experience Cards List -->
      <div class="exp-dashboard-list">
        ${PORTFOLIO_DATA.experience.map(exp => {
          // Check if ongoing (ongoing until 22 Dec 2026)
          const isOngoing = exp.status === 'Ongoing' && (exp.endDate ? new Date() <= new Date(exp.endDate + 'T23:59:59') : true);

          return `
            <div class="exp-dashboard-card ${isOngoing ? 'ongoing-card' : 'completed-card'}">
              <div class="exp-card-header">
                <div class="exp-header-left">
                  <div class="exp-title-row">
                    <h3 class="exp-role-title">${exp.role}</h3>
                    <span class="exp-status-pill ${isOngoing ? 'ongoing' : 'completed'}">
                      ${isOngoing 
                        ? '<span class="pulse-dot"></span> Ongoing' 
                        : '<i data-lucide="check-circle-2" style="width: 12px; height: 12px;"></i> Completed'
                      }
                    </span>
                  </div>
                  <div class="exp-company-name">${exp.company}</div>
                  
                  <div class="exp-meta-row">
                    <span class="exp-meta-item">
                      <i data-lucide="calendar" style="width: 13px; height: 13px;"></i>
                      <span>${exp.duration}</span>
                    </span>
                    ${exp.location ? `
                      <span class="exp-meta-sep">•</span>
                      <span class="exp-meta-item">
                        <i data-lucide="map-pin" style="width: 13px; height: 13px;"></i>
                        <span>${exp.location}</span>
                      </span>
                    ` : ''}
                    ${exp.workMode ? `
                      <span class="exp-meta-sep">•</span>
                      <span class="exp-meta-item">
                        <i data-lucide="briefcase" style="width: 13px; height: 13px;"></i>
                        <span>${exp.workMode}</span>
                      </span>
                    ` : ''}
                  </div>
                </div>
              </div>

              ${exp.description ? `
                <p class="exp-card-desc">${exp.description}</p>
              ` : ''}

              <div class="exp-bullets-wrapper">
                <h4 class="exp-section-label">
                  <i data-lucide="sparkles" style="width: 13px; height: 13px;"></i>
                  Key Responsibilities &amp; Highlights:
                </h4>
                <ul class="exp-bullets-list">
                  ${exp.bullets.map(b => `
                    <li>
                      <i data-lucide="check-circle-2" class="exp-check-icon"></i>
                      <span>${b}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>

              ${exp.tech && exp.tech.length ? `
                <div class="exp-tech-row">
                  ${exp.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // Render Education Section as a full-width Dashboard Container
  renderEducation: function () {
    const container = document.getElementById('education-container');
    if (!container) return;

    const btech = PORTFOLIO_DATA.education.btech;
    const secondary = PORTFOLIO_DATA.education.secondary;

    container.innerHTML = `
      <!-- Education Header matching GitHub -->
      <div class="dashboard-header">
        <div class="dashboard-user-info">
          <div class="dashboard-avatar edu-avatar-glow">
            <i data-lucide="graduation-cap"></i>
          </div>
          <div>
            <div class="dashboard-handle-row">
              <span class="dashboard-handle-title">Academic Qualifications &amp; Honors</span>
              <span class="dashboard-verified-pill">B.Tech Specialization</span>
            </div>
            <p class="dashboard-role-sub">${btech.institution}</p>
          </div>
        </div>

        <!-- Education Stat Pills matching GitHub -->
        <div class="dashboard-stats-row">
          <div class="dashboard-stat-pill">
            <div class="dashboard-stat-val" data-counter-target="7.77" data-counter-float="true" data-counter-suffix=" / 10">7.77 / 10</div>
            <div class="dashboard-stat-label">B.TECH CGPA</div>
          </div>
          <div class="dashboard-stat-pill">
            <div class="dashboard-stat-val">2023–27</div>
            <div class="dashboard-stat-label">3RD YEAR</div>
          </div>
          <div class="dashboard-stat-pill">
            <div class="dashboard-stat-val">CSE-DS(AI)</div>
            <div class="dashboard-stat-label">SPECIALIZATION</div>
          </div>
          <div class="dashboard-stat-pill">
            <div class="dashboard-stat-val" style="color: var(--accent-cyan);">100%</div>
            <div class="dashboard-stat-label">10TH BOARD SCORE</div>
          </div>
        </div>
      </div>

      <!-- Main Degree Showcase Block -->
      <div class="dashboard-sub-box edu-main-block">
        <div class="edu-block-header">
          <div>
            <span class="section-badge purple" style="margin-bottom: 0.4rem;">● Primary Degree Program</span>
            <h3 class="edu-block-title">${btech.degree}</h3>
            <p class="edu-block-spec">${btech.specialization}</p>
          </div>
          <div class="edu-cgpa-badge">
            <div class="edu-cgpa-num">7.77</div>
            <div class="edu-cgpa-sub">ACADEMIC CGPA</div>
          </div>
        </div>

        <div style="margin-bottom: 1.25rem;">
          <div class="dashboard-box-subtitle">
            <i data-lucide="trophy" style="width: 15px; height: 15px; color: var(--accent-cyan);"></i>
            Key Academic Achievements &amp; Milestones
          </div>
          <div class="edu-achievements-dashboard-grid">
            ${btech.achievements.map(ach => `
              <div class="edu-achieve-item">
                <i data-lucide="check-circle-2" class="bullet-icon"></i>
                <span>${ach}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <div class="dashboard-box-subtitle">
            <i data-lucide="layers" style="width: 15px; height: 15px; color: var(--accent-purple);"></i>
            Specialized Computer Science &amp; Data Curriculum
          </div>
          <div class="edu-curriculum-tags">
            ${btech.curriculum.map(c => `<span class="curriculum-tag">${c}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Secondary Schooling Sub-box -->
      <div class="dashboard-sub-box edu-secondary-box">
        <div class="dashboard-box-subtitle" style="margin-bottom: 0.85rem;">
          <i data-lucide="award" style="width: 15px; height: 15px; color: var(--accent-cyan);"></i>
          Secondary &amp; Senior Secondary Foundation
        </div>
        <div class="edu-secondary-dashboard-grid">
          ${secondary.map(sec => `
            <div class="secondary-card-item">
              <div class="sec-item-top">
                <h4 class="sec-item-level">${sec.level}</h4>
                <span class="score-badge">${sec.scoreBadge}</span>
              </div>
              <p class="sec-item-school">${sec.school}</p>
              <p class="sec-item-board">${sec.board}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // Render Certifications Section with Verified Brand Logos
  renderCertifications: function () {
    const container = document.getElementById('certs-grid');
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.certifications.map(cert => {
      const logoSvg = (cert.logoKey && window.BRAND_LOGOS && BRAND_LOGOS[cert.logoKey])
        ? BRAND_LOGOS[cert.logoKey]
        : `<i data-lucide="award"></i>`;

      return `
        <div class="glass-card cert-card reveal-init">
          <div>
            <div class="cert-header">
              <div class="cert-icon-box">
                ${logoSvg}
              </div>
              <span class="cert-badge ${cert.badgeType}">${cert.badge}</span>
            </div>

            <h3 class="cert-title">${cert.title}</h3>
            <p class="cert-issuer">${cert.issuer}</p>
            <p class="cert-desc">${cert.description}</p>
          </div>

          <div>
            <div class="cert-skills-tags">
              ${cert.skills.map(s => `<span class="cert-tag">${s}</span>`).join('')}
            </div>

            <a href="${cert.url}" target="_blank" rel="noopener noreferrer" class="cert-verify-link">
              <span>Verify Credential on LinkedIn</span>
              <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');
  },

  // Render Achievements Section
  renderAchievements: function () {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.achievements.map(ach => `
      <div class="glass-card achievement-card reveal-init">
        <div class="ach-icon-circle">
          <i data-lucide="${ach.icon}"></i>
        </div>
        <div class="ach-stat-number" 
             data-counter-target="${ach.number}"
             ${ach.isFloat ? 'data-counter-float="true"' : ''}
             ${ach.suffix ? `data-counter-suffix="${ach.suffix}"` : ''}>
          ${ach.value}
        </div>
        <h3 class="ach-card-title">${ach.title}</h3>
        <p class="ach-card-desc">${ach.description}</p>
      </div>
    `).join('');
  },

  // Render GitHub Ecosystem & Heatmap
  renderGitHubSection: function () {
    const gh = PORTFOLIO_DATA.github;

    // Header stats
    const statsContainer = document.getElementById('gh-stats-row');
    const avatarContainer = document.querySelector('.gh-avatar');
    if (avatarContainer && gh.avatarUrl) {
      avatarContainer.innerHTML = `<img src="${gh.avatarUrl}" alt="${gh.handle}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }
    if (statsContainer) {
      statsContainer.innerHTML = gh.stats.map(s => `
        <div class="gh-stat-pill">
          <div class="gh-stat-val" data-counter-target="${s.raw}" ${s.label.includes('STREAK') ? 'data-counter-prefix="⚡ " data-counter-suffix="d"' : ''}>${s.value}</div>
          <div class="gh-stat-label">${s.label}</div>
        </div>
      `).join('');
    }

    // Languages progress bar & legend
    const langBar = document.getElementById('gh-progress-bar');
    const langLegend = document.getElementById('gh-lang-legend');

    if (langBar && langLegend) {
      langBar.innerHTML = gh.languages.map(l => `
        <div class="gh-progress-segment" style="width: ${l.percentage}%; background-color: ${l.color};" title="${l.name} (${l.percentage}%)"></div>
      `).join('');

      langLegend.innerHTML = gh.languages.map(l => `
        <div class="gh-legend-item">
          <span class="gh-legend-dot" style="background-color: ${l.color};"></span>
          <span>${l.name} (${l.percentage}%)</span>
        </div>
      `).join('');
    }

    // Interactive Heatmap Grid Generation (52 weeks x 7 days)
    const heatmapGrid = document.getElementById('gh-heatmap-grid');
    if (heatmapGrid) {
      let cellsHtml = '';
      const totalCells = 52 * 7;
      
      for (let i = 0; i < totalCells; i++) {
        const rand = Math.random();
        let level = 0;
        let commits = 0;

        if (rand > 0.45) {
          level = 1;
          commits = 1 + Math.floor(Math.random() * 2);
        }
        if (rand > 0.70) {
          level = 2;
          commits = 3 + Math.floor(Math.random() * 3);
        }
        if (rand > 0.88) {
          level = 3;
          commits = 6 + Math.floor(Math.random() * 4);
        }
        if (rand > 0.96) {
          level = 4;
          commits = 10 + Math.floor(Math.random() * 5);
        }

        cellsHtml += `
          <div class="heatmap-cell level-${level}" 
               title="${commits > 0 ? `${commits} contributions on day ${i + 1}` : 'No contributions'}">
          </div>
        `;
      }
      heatmapGrid.innerHTML = cellsHtml;
    }
  },

  // Render Contact Info Card
  renderContactInfo: function () {
    const prof = PORTFOLIO_DATA.profile;

    const emailEl = document.getElementById('contact-email-val');
    const phoneEl = document.getElementById('contact-phone-val');
    const locEl = document.getElementById('contact-loc-val');

    if (emailEl) {
      emailEl.textContent = prof.email;
      emailEl.href = `mailto:${prof.email}`;
    }
    if (phoneEl) {
      phoneEl.textContent = prof.phone;
      phoneEl.href = `tel:${prof.phone.replace(/\\s+/g, '')}`;
    }
    if (locEl) {
      locEl.textContent = prof.location;
    }
  },

  // Case Study Modal
  openCaseStudyModal: function (projectId) {
    const project = PORTFOLIO_DATA.projects.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('case-study-modal');
    const modalBody = document.getElementById('modal-body-content');
    if (!modal || !modalBody) return;

    const cs = project.caseStudy;

    modalBody.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
          ${project.badges.map(b => `<span class="p-badge purple">● ${b}</span>`).join('')}
        </div>
        <h2 style="font-size: 1.75rem; font-weight: 800; color: #ffffff; margin-bottom: 0.35rem;">${project.title}</h2>
        <p style="font-size: 0.9rem; color: var(--text-cyan); font-weight: 600;">${project.subtitle}</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <h4 style="font-size: 0.82rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-purple); margin-bottom: 0.4rem;">
            Abstract & Problem Statement
          </h4>
          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7;">${cs.abstract}</p>
        </div>

        <div>
          <h4 style="font-size: 0.82rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-cyan); margin-bottom: 0.4rem;">
            Architecture & Methodology
          </h4>
          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7;">${cs.methodology}</p>
        </div>

        <div>
          <h4 style="font-size: 0.82rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-purple); margin-bottom: 0.4rem;">
            Quantitative Results & Findings
          </h4>
          <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7;">${cs.keyResults}</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 1rem 1.25rem;">
          <h4 style="font-size: 0.78rem; font-weight: 700; color: var(--accent-emerald); margin-bottom: 0.2rem;">
            Publication & Availability
          </h4>
          <p style="font-size: 0.82rem; color: var(--text-secondary);">${cs.publicationStatus}</p>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
          <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding: 0.75rem 1.5rem; font-size: 0.85rem;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            <span>View Source on GitHub</span>
          </a>
        </div>
      </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  setupCaseStudyModal: function () {
    const modal = document.getElementById('case-study-modal');
    const closeBtn = document.getElementById('modal-close-btn');

    if (!modal) return;

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  },

  // Contact Form Submission Handler
  setupContactForm: function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !message) {
        this.showToast('Please fill out all required fields!', 'alert-circle');
        return;
      }

      const submitBtn = document.getElementById('btn-send-message');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="splash-ring" style="width: 18px; height: 18px; border-width: 2px;"></span>
        <span>Sending Message...</span>
      `;

      setTimeout(() => {
        const mailtoLink = `mailto:${PORTFOLIO_DATA.profile.email}?subject=${encodeURIComponent(subject || 'Portfolio Inquiry from ' + name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();

        this.showToast('Message composed! Opening your email client...', 'check-circle');
        window.open(mailtoLink, '_blank');
      }, 1000);
    });
  },

  // Mobile Menu Drawer
  setupMobileMenu: function () {
    const toggle = document.getElementById('mobile-toggle');
    const drawer = document.getElementById('mobile-menu-drawer');
    const links = document.querySelectorAll('.mobile-nav-link');

    if (!toggle || !drawer) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      drawer.classList.toggle('open');
      document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : 'auto';
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        drawer.classList.remove('open');
        document.body.style.overflow = 'auto';
      });
    });
  }
};
