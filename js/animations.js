/**
 * animations.js
 * Handles scroll-triggered animations using Intersection Observer API
 * Validates Requirements: 3.5, 4.6, 5.5, 8.1
 */

/**
 * Initialize scroll-triggered animations
 * Sets up Intersection Observer to animate sections when they enter viewport
 */
function initAnimations() {
  // Check if Intersection Observer is supported
  if (!('IntersectionObserver' in window)) {
    console.warn('Intersection Observer not supported, animations disabled');
    return;
  }

  // Select all sections that should be animated on scroll
  const sectionsToAnimate = document.querySelectorAll('.animate-on-scroll-custom');

  // Configure Intersection Observer options
  const observerOptions = {
    root: null, // Use viewport as root
    rootMargin: '0px',
    threshold: 0.15 // Trigger when 15% of element is visible
  };

  // Create callback function for when elements intersect
  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      // When element enters viewport
      if (entry.isIntersecting) {
        const section = entry.target;

        // Apply animation class based on section
        applyAnimationToSection(section);

        // Stop observing this element (animate only once)
        observer.unobserve(section);
      }
    });
  };

  // Create the Intersection Observer
  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Observe all sections
  sectionsToAnimate.forEach(section => {
    // Add initial class for elements that will be animated
    section.classList.add('animate-on-scroll');
    observer.observe(section);
  });
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
