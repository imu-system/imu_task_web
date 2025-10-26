'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Shield, Clock, Users } from 'lucide-react';

interface AuthIllustrationProps {
  variant?: 'signup' | 'signin' | 'forgot-password';
}

export function AuthIllustration({ variant = 'signup' }: AuthIllustrationProps) {
  const t = useTranslations('Auth.illustration');

  // Features basées sur le variant
  const features = variant === 'signup' 
    ? [
        { icon: CheckCircle2, key: 'verifiedProfiles' },
        { icon: Shield, key: 'securePayments' },
        { icon: Clock, key: 'fastBooking' },
        { icon: Users, key: 'localCommunity' },
      ]
    : variant === 'signin'
    ? [
        { icon: CheckCircle2, key: 'welcomeBack' },
        { icon: Shield, key: 'secureAccount' },
        { icon: Clock, key: 'quickAccess' },
        { icon: Users, key: 'yourNetwork' },
      ]
    : [
        { icon: Shield, key: 'secureReset' },
        { icon: Clock, key: 'quickProcess' },
      ];

  return (
    <div className="relative hidden lg:flex lg:flex-col lg:justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 rounded-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />

      {/* Content */}
      <div className="relative z-10">
        {/* Illustration principale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="relative w-full max-w-md mx-auto aspect-square">
            {/* Cercles décoratifs animés */}
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl"
            />
            
            {/* Icon centrale */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl">
                  <svg
                    className="w-24 h-24 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {variant === 'signup' && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    )}
                    {variant === 'signin' && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    )}
                    {variant === 'forgot-password' && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    )}
                  </svg>
                </div>

                {/* Floating dots */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute w-3 h-3 rounded-full bg-primary/50"
                    style={{
                      top: `${20 + i * 25}%`,
                      right: `-${10 + i * 5}%`,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Titre et description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {t(`${variant}.title`)}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t(`${variant}.subtitle`)}
          </p>
        </motion.div>

        {/* Features list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="space-y-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">
                  {t(`${variant}.features.${feature.key}.title`)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t(`${variant}.features.${feature.key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats ou témoignage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10"
        >
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background flex items-center justify-center text-white font-bold text-xs"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {t(`${variant}.testimonial.text`)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t(`${variant}.testimonial.author`)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
