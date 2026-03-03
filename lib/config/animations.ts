// Animation configuration for consistent timing across the app

export const animationConfig = {
  // Durations
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 0.8,
    verySlow: 1.2,
  },

  // Delays
  delay: {
    none: 0,
    short: 0.1,
    medium: 0.2,
    long: 0.4,
  },

  // Easing functions
  easing: {
    easeOut: [0.4, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: { type: 'spring', stiffness: 100, damping: 15 },
  },

  // Stagger
  stagger: {
    children: 0.1,
    fast: 0.05,
    slow: 0.15,
  },

  // Fade variants
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 },
  },

  fadeInLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },

  fadeInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },

  // Scale variants
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },

  // Stagger container
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  // Hover effects
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 },
  },

  tap: {
    scale: 0.95,
  },
}

export default animationConfig
