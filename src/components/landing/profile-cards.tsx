"use client";

import { useTranslations } from "next-intl";
import { User, Briefcase, Heart, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { logProfileCardClick } from "@/lib/analytics";
import { motion } from "framer-motion";

export function ProfileCards() {
  const t = useTranslations("LandingPage.profiles");

  const profiles = [
    {
      key: "individual" as const,
      icon: User,
      gradient: "from-blue-500 to-cyan-500",
      borderColor: "hover:border-blue-500",
      href: "/particuliers",
      features: [
        "findLocalProviders",
        "securePayments",
        "verifiedReviews",
        "customerSupport"
      ]
    },
    {
      key: "professional" as const,
      icon: Briefcase,
      gradient: "from-green-500 to-emerald-500",
      borderColor: "hover:border-green-500",
      href: "/professionnels",
      features: [
        "qualifiedClients",
        "integratedCalendar",
        "automaticPayments",
        "liabilityInsurance"
      ]
    },
    {
      key: "senior" as const,
      icon: Heart,
      gradient: "from-rose-500 to-pink-500",
      borderColor: "hover:border-rose-500",
      href: "/seniors",
      features: [
        "accessibleServices",
        "emergencyContacts",
        "quickSOS",
        "voiceInterface"
      ]
    },
  ];

  return (
    <section id="pour-qui" className="py-16 md:py-24 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-headline bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Profile Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {profiles.map((profile, index) => {
            const Icon = profile.icon;
            return (
              <motion.div
                key={profile.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -8 }}
                className={`
                  group relative bg-card rounded-3xl p-8 border-2 border-border
                  transition-all duration-300 hover:shadow-2xl
                  ${profile.borderColor}
                `}
              >
                {/* Icon with Gradient */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`
                    w-16 h-16 rounded-2xl mb-6 flex items-center justify-center
                    bg-gradient-to-br ${profile.gradient}
                    shadow-lg
                  `}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-bold mb-3 font-headline">
                  {t(`${profile.key}.title`)}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed text-base">
                  {t(`${profile.key}.description`)}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {profile.features.map((feature, idx) => (
                    <li 
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.15 + idx * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3 w-full"
                      >
                        <div className={`
                          rounded-full p-1 bg-gradient-to-br ${profile.gradient} 
                          flex-shrink-0 mt-0.5
                        `}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-muted-foreground leading-tight">
                          {t(`${profile.key}.features.${feature}`)}
                        </span>
                      </motion.div>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  className={`
                    w-full rounded-2xl font-semibold
                    bg-gradient-to-r ${profile.gradient}
                    hover:shadow-xl hover:scale-105
                    transition-all duration-300
                  `}
                  onClick={() => logProfileCardClick(profile.key, 'card_cta')}
                >
                  <Link href={profile.href} className="flex items-center justify-center">
                    {t(`${profile.key}.cta`)}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                {/* Decorative Gradient Overlay */}
                <div className={`
                  absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 
                  transition-opacity duration-300 pointer-events-none
                  bg-gradient-to-br ${profile.gradient}
                `} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
