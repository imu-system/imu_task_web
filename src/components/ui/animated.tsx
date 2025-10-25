/**
 * Composants animés réutilisables avec framer-motion
 * Pour des transitions fluides dans les dashboards
 * Avec support des dégradés et effets visuels
 */

'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Variantes d'animation courantes
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

// Variantes avec effets de couleur et dégradés
export const fadeInWithGradient = {
  hidden: { 
    opacity: 0, 
    y: 20,
    background: 'linear-gradient(135deg, #667eea 0%, #667eea 100%)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    transition: { 
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

export const colorShift = {
  initial: { 
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
  },
  animate: {
    background: [
      'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
    ],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const glowPulse = {
  initial: { 
    boxShadow: '0 0 20px rgba(102, 126, 234, 0.4)'
  },
  animate: {
    boxShadow: [
      '0 0 20px rgba(102, 126, 234, 0.4)',
      '0 0 40px rgba(102, 126, 234, 0.8)',
      '0 0 60px rgba(118, 75, 162, 0.8)',
      '0 0 40px rgba(102, 126, 234, 0.8)',
      '0 0 20px rgba(102, 126, 234, 0.4)'
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const rainbowText = {
  initial: {
    backgroundImage: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
    backgroundSize: '200% 100%',
    backgroundPosition: '0% 50%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const borderGradient = {
  initial: {
    borderImage: 'linear-gradient(90deg, #667eea, #764ba2) 1',
  },
  animate: {
    borderImage: [
      'linear-gradient(90deg, #667eea, #764ba2) 1',
      'linear-gradient(180deg, #764ba2, #667eea) 1',
      'linear-gradient(270deg, #667eea, #764ba2) 1',
      'linear-gradient(360deg, #764ba2, #667eea) 1'
    ],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const shimmer = {
  initial: {
    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    backgroundSize: '200% 100%',
    backgroundPosition: '-100% 0'
  },
  animate: {
    backgroundPosition: ['200% 0', '-100% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const hueRotate = {
  initial: { filter: 'hue-rotate(0deg)' },
  animate: {
    filter: 'hue-rotate(360deg)',
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Variantes pour les listes avec stagger
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Variantes pour les cartes
export const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' },
  hover: { 
    scale: 1.02,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

// Animation de skeleton loader
export const pulse = {
  initial: { opacity: 0.6 },
  animate: { 
    opacity: 1,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse' as const,
      duration: 1
    }
  }
};

// Composants pré-animés
interface AnimatedDivProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate'> {
  children: ReactNode;
  variant?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'scaleIn' | 'slideInLeft' | 'slideInRight' | 'fadeInWithGradient';
  delay?: number;
}

export function AnimatedDiv({ 
  children, 
  variant = 'fadeInUp', 
  delay = 0,
  className,
  ...props 
}: AnimatedDivProps) {
  const variants = {
    fadeIn,
    fadeInUp,
    fadeInDown,
    scaleIn,
    slideInLeft,
    slideInRight,
    fadeInWithGradient
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[variant]}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Liste animée avec stagger
interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Item de liste animé
interface AnimatedListItemProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export function AnimatedListItem({ children, className, ...props }: AnimatedListItemProps) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Carte animée au hover
interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'whileHover' | 'whileTap'> {
  children: ReactNode;
  clickable?: boolean;
}

export function AnimatedCard({ 
  children, 
  clickable = false,
  className,
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      whileTap={clickable ? "tap" : undefined}
      variants={cardHover}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Wrapper pour présence d'animation (pour les transitions conditionnelles)
export { AnimatePresence } from 'framer-motion';

// Animation de chargement
export function LoadingPulse({ className }: { className?: string }) {
  return (
    <motion.div
      variants={pulse}
      initial="initial"
      animate="animate"
      className={className}
    />
  );
}

// Animation de badge (pour les notifications)
export const badgePop = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 500,
      damping: 15
    }
  },
  exit: { 
    scale: 0,
    transition: { duration: 0.15 }
  }
};

// Animation de modal/drawer
export const modalSlide = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    y: 50,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

// Overlay backdrop
export const backdropFade = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Composants avec effets de couleur

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
}

export function GradientBackground({ 
  children, 
  className,
  colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
}: GradientBackgroundProps) {
  return (
    <motion.div
      variants={colorShift}
      initial="initial"
      animate="animate"
      className={cn('relative overflow-hidden', className)}
    >
      {children}
    </motion.div>
  );
}

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({ 
  children, 
  className,
  glowColor = 'rgba(102, 126, 234, 0.6)'
}: GlowCardProps) {
  return (
    <motion.div
      variants={glowPulse}
      initial="initial"
      animate="animate"
      className={cn('rounded-lg', className)}
    >
      {children}
    </motion.div>
  );
}

interface RainbowTextProps {
  children: ReactNode;
  className?: string;
}

export function RainbowText({ children, className }: RainbowTextProps) {
  return (
    <motion.span
      variants={rainbowText}
      initial="initial"
      animate="animate"
      className={cn('font-bold', className)}
    >
      {children}
    </motion.span>
  );
}

interface ShimmerCardProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerCard({ children, className }: ShimmerCardProps) {
  return (
    <motion.div
      className={cn('relative overflow-hidden', className)}
    >
      <motion.div
        variants={shimmer}
        initial="initial"
        animate="animate"
        className="absolute inset-0 pointer-events-none"
      />
      {children}
    </motion.div>
  );
}

interface HueRotateWrapperProps {
  children: ReactNode;
  className?: string;
}

export function HueRotateWrapper({ children, className }: HueRotateWrapperProps) {
  return (
    <motion.div
      variants={hueRotate}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

