/**
 * animations.js
 * Handles scroll-triggered animations using Intersection Observer API
 * Validates Requirements: 3.5, 4.6, 5.5, 8.1
 */

/**
 * Initialize scroll-triggered animations
 * Disabled per user request - immediately shows all elements
 */
function initAnimations() {
  // Immediately activate all scroll-reveal elements
  document.querySelectorAll('.scroll-reveal').forEach(el => {
    el.classList.add('active');
  });

  // Also immediately trigger any other animation classes if needed globally
  // (Most entrance animations like .animate-fade-up trigger on load anyway)
}

/**
 * Apply appropriate animation classes to a section
 * @param {HTMLElement} section - The section element to animate
 */
function applyAnimationToSection(section) {
  const sectionId = section.id;

  switch (sectionId) {
    case 'about':
      animateAboutSection(section);
      break;
    case 'projects':
      animateProjectsSection(section);
      break;
    case 'contact':
      animateContactSection(section);
      break;
    default:
      // Default animation
      section.classList.add('animate-fade-in');
  }
}

/**
 * Animate About section content
 * @param {HTMLElement} section - The about section element
 */
function animateAboutSection(section) {
  section.classList.add('animate-fade-in');

  // Animate title
  const title = section.querySelector('.section-title');
  if (title) {
    title.classList.add('animate-slide-up');
  }

  // Animate bio
  const bio = section.querySelector('.about-bio');
  if (bio) {
    bio.classList.add('animate-slide-up', 'animate-delay-1');
  }

  // Animate skills groups
  const skillsGroups = section.querySelectorAll('.skills-group');
  skillsGroups.forEach((group, index) => {
    group.classList.add('animate-slide-up', `animate-delay-${Math.min(index + 2, 3)}`);
  });
}

/**
 * Animate Projects section content
 * @param {HTMLElement} section - The projects section element
 */
function animateProjectsSection(section) {
  section.classList.add('animate-fade-in');

  // Animate title
  const title = section.querySelector('.section-title');
  if (title) {
    title.classList.add('animate-slide-up');
  }

  // Animate project cards with staggered delays
  const projectCards = section.querySelectorAll('.project-card');
  projectCards.forEach((card, index) => {
    card.classList.add('animate-slide-up', `animate-delay-${Math.min(index + 1, 3)}`);
  });
}

/**
 * Animate Contact section content
 * @param {HTMLElement} section - The contact section element
 */
function animateContactSection(section) {
  section.classList.add('animate-fade-in');

  // Animate title
  const title = section.querySelector('.section-title');
  if (title) {
    title.classList.add('animate-slide-up');
  }

  // Animate contact text
  const contactText = section.querySelector('.contact-text');
  if (contactText) {
    contactText.classList.add('animate-slide-up', 'animate-delay-1');
  }

  // Animate contact info
  const contactInfo = section.querySelector('.contact-info');
  if (contactInfo) {
    contactInfo.classList.add('animate-slide-up', 'animate-delay-2');
  }

  // Animate social links
  const socialLinks = section.querySelector('.social-links');
  if (socialLinks) {
    socialLinks.classList.add('animate-slide-up', 'animate-delay-3');
  }
}

/**
 * Helper function to observe a specific element
 * Can be used for custom animation needs
 * @param {HTMLElement} element - Element to observe
 * @param {Function} callback - Callback function when element intersects
 * @param {Object} options - Intersection Observer options
 */
function observeElement(element, callback, options = {}) {
  if (!('IntersectionObserver' in window)) {
    console.warn('Intersection Observer not supported');
    return null;
  }

  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15,
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, defaultOptions);

  observer.observe(element);
  return observer;
}
