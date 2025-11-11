'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { SearchBarCompact } from '@/components/landing/search-bar-compact';
import placeholderImages from '@/app/lib/placeholder-images.json';

/**
 * Hero Minimaliste - Style Airbnb
 * 
 * Version ultra-compacte:
 * - Hauteur réduite: 180-220px (style Airbnb pur)
 * - PAS de titre (la recherche est le focus principal)
 * - Barre de recherche inline (tous les champs sur une ligne)
 * - Recherches populaires en pills compactes
 * - Design épuré et moderne
 */
export function HeroMinimal() {
  const t = useTranslations('LandingPage.hero');

  const popularSearches = ['Ménage', 'Déménagement', 'Jardinage', 'Livraison', 'Bricolage', 'Cuisine'];

  return (
    <section className="relative w-full pt-16 h-[calc(180px+4rem)] md:h-[calc(220px+4rem)] flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Background Image with Strong Overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={placeholderImages.hero.src}
          alt="Helping hands"
          data-ai-hint={placeholderImages.hero.hint}
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />
      </div>

      <div className="container mx-auto px-4 md:px-6 w-full max-w-5xl">
        <div className="text-center space-y-4">
          {/* Barre de recherche inline - Style Airbnb (PRIORITÉ) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SearchBarCompact />
          </motion.div>

          {/* Recherches populaires - Pills compactes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-2 flex-wrap"
          >
            <span className="text-xs text-muted-foreground font-medium">Populaire :</span>
            {popularSearches.map((search, idx) => (
              <button
                key={idx}
                type="button"
                className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-colors duration-200 shadow-sm hover:shadow"
              >
                {search}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
