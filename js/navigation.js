/**
 * navigation.js
 * Handles smooth scrolling and navigation functionality
 */

/**
 * Initialize navigation functionality
 * - Adds click handlers to navigation links for smooth scrolling
 * - Sets up scroll listener for active section tracking
 * - Initializes mobile menu toggle functionality
 */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Add click handlers to navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
  });

  // Set up scroll listener for active section tracking
  window.addEventListener('scroll', () => updateActiveNavItem(sections, navLinks));

  // Set initial active state
  updateActiveNavItem(sections, navLinks);

  // Initialize mobile menu toggle
  initMobileMenu();
}

/**
 * Initialize mobile menu toggle functionality
 * Handles opening/closing the mobile menu and closing on link click
 */
function initMobileMenu() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!mobileMenuToggle || !navMenu) {
    return;
  }

  // Toggle menu on button click
  mobileMenuToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
    mobileMenuToggle.setAttribute('aria-expanded', isOpen.toString());

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a navigation link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      mobileMenuToggle.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    const isClickInsideNav = navMenu.contains(event.target);
    const isClickOnToggle = mobileMenuToggle.contains(event.target);

    if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      mobileMenuToggle.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/**
 * Handle navigation link click
 * Prevents default behavior and smoothly scrolls to target section
 * @param {Event} event - Click event
 */
function handleNavClick(event) {
  event.preventDefault();

  const targetId = event.currentTarget.getAttribute('href');
  const targetSection = document.querySelector(targetId);

  if (targetSection) {
    scrollToSection(targetSection);
  }
}

/**
 * Smoothly scroll to a target section
 * @param {HTMLElement} targetSection - The section element to scroll to
 */
function scrollToSection(targetSection) {
  const navHeight = document.querySelector('.navigation')?.offsetHeight || 0;
  const targetPosition = targetSection.offsetTop - navHeight;

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

/**
 * Update active navigation item based on scroll position
 * Determines which section is currently in view and highlights corresponding nav link
 * @param {NodeList} sections - All section elements
 * @param {NodeList} navLinks - All navigation link elements
 */
function updateActiveNavItem(sections, navLinks) {
  const scrollPosition = window.scrollY;
  const navHeight = document.querySelector('.navigation')?.offsetHeight || 0;

  // Find the current section in view
  let currentSectionId = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - navHeight - 100; // 100px offset for better UX
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      currentSectionId = section.getAttribute('id');
    }
  });

  // If we're at the very top, highlight the first section (hero)
  if (scrollPosition < 100) {
    currentSectionId = sections[0]?.getAttribute('id') || '';
  }

  // Update active class on navigation links
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    const linkSectionId = linkHref?.substring(1); // Remove the '#'

    if (linkSectionId === currentSectionId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
