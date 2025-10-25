"use client";

import { useTranslations } from "next-intl";
import { User, Briefcase, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { logProfileCardClick } from "@/lib/analytics";

export function ProfileCards() {
  const t = useTranslations("LandingPage.profiles");

  const profiles = [
    {
      key: "individual" as const,
      icon: User,
      gradient: "from-blue-500 to-cyan-500",
      borderColor: "hover:border-blue-500",
      href: "/signup", // Signup for individuals
    },
    {
      key: "professional" as const,
      icon: Briefcase,
      gradient: "from-purple-500 to-pink-500",
      borderColor: "hover:border-purple-500",
      href: "/signup?type=pro", // Signup for professionals (ImuPro)
    },
    {
      key: "senior" as const,
      icon: Heart,
      gradient: "from-orange-500 to-red-500",
      borderColor: "hover:border-orange-500",
      href: "#carelink", // Scroll to CareLink section
    },
  ];

  return (
    <section id="particuliers" className="py-16 md:py-24 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Profile Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {profiles.map((profile) => {
            const Icon = profile.icon;
            return (
              <div
                key={profile.key}
                className={`
                  group relative bg-card rounded-3xl p-8 border-2 border-border
                  transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                  ${profile.borderColor}
                `}
              >
                {/* Icon with Gradient */}
                <div
                  className={`
                    w-16 h-16 rounded-2xl mb-6 flex items-center justify-center
                    bg-gradient-to-br ${profile.gradient}
                    shadow-lg
                  `}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3">
                  {t(`${profile.key}.title`)}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t(`${profile.key}.description`)}
                </p>

                {/* CTA Button */}
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => logProfileCardClick(profile.key, 'card_cta')}
                >
                  <Link href={profile.href}>
                    {t(`${profile.key}.cta`)}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
