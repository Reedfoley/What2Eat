/**
 * Animation utilities and variants for Framer Motion
 * All animations use transform and opacity for optimal performance
 */

import { Variants, Transition } from 'framer-motion';

/**
 * Standard easing functions
 */
export const easings = {
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
} as const;

/**
 * Standard durations
 */
export const durations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
} as const;

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
};

/**
 * Slide up animation
 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
};

/**
 * Slide down animation
 */
export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
};

/**
 * Stagger children animation
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/**
 * Expand/collapse animation for accordions
 */
export const expandCollapse: Variants = {
  collapsed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeInOut,
    },
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: durations.normal,
      ease: easings.easeInOut,
    },
  },
};

/**
 * Hover lift effect
 */
export const hoverLift = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
};

/**
 * Button press effect
 */
export const buttonPress = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: easings.easeInOut,
    },
  },
};

/**
 * Pulse animation for loading states
 */
export const pulse: Variants = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
};

/**
 * Bounce animation
 */
export const bounce: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: easings.easeInOut,
    },
  },
};

/**
 * Rotate animation for loading spinners
 */
export const rotate: Transition = {
  duration: 1,
  repeat: Infinity,
  ease: 'linear',
};

/**
 * Slide in from right (for sidebars)
 */
export const slideInRight: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeInOut,
    },
  },
  exit: {
    x: '100%',
    transition: {
      duration: durations.normal,
      ease: easings.easeInOut,
    },
  },
};

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
  hidden: { x: '-100%' },
  visible: {
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeInOut,
    },
  },
  exit: {
    x: '-100%',
    transition: {
      duration: durations.normal,
      ease: easings.easeInOut,
    },
  },
};

/**
 * Toast notification animation
 */
export const toastAnimation: Variants = {
  hidden: { opacity: 0, y: -50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
};

/**
 * Message item animation with stagger
 */
export const messageAnimation = (index: number): Variants => ({
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.normal,
      delay: index * 0.05,
      ease: easings.easeOut,
    },
  },
});

/**
 * Card hover animation
 */
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.01,
    y: -2,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
  tap: {
    scale: 0.99,
    transition: {
      duration: 0.1,
      ease: easings.easeInOut,
    },
  },
};

/**
 * Backdrop animation
 */
export const backdropAnimation: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.fast,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
    },
  },
};

/**
 * Icon rotation animation
 */
export const iconRotate = (isOpen: boolean) => ({
  rotate: isOpen ? 180 : 0,
  transition: {
    duration: durations.normal,
    ease: easings.easeInOut,
  },
});

/**
 * Badge animation
 */
export const badgeAnimation: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
};

/**
 * Typing indicator dot animation
 */
export const typingDot = (delay: number): Variants => ({
  initial: { y: 0, opacity: 0.5 },
  animate: {
    y: -8,
    opacity: 1,
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: easings.easeInOut,
      delay,
    },
  },
});

/**
 * Streaming text cursor blink
 */
export const cursorBlink: Variants = {
  animate: {
    opacity: [1, 0],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};
