"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Sparkles, Users, Phone, ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { logCarelinkServiceClick } from "@/lib/analytics";

export function CarelinkPreview() {
  const t = useTranslations("LandingPage.carelink");

  const services = [
    {
      key: "meals" as const,
      icon: UtensilsCrossed,
      gradient: "from-orange-500 to-red-500",
    },
    {
      key: "housekeeping" as const,
      icon: Sparkles,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      key: "companionship" as const,
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      key: "teleassistance" as const,
      icon: Phone,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section id="carelink" className="py-16 md:py-24 bg-gradient-to-b from-accent/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with Badge */}
          <div className="text-center mb-12 relative">
            <Badge
              variant="secondary"
              className="mb-4 px-4 py-2 text-sm font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
            >
              {t("badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {t("title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.key}
                  className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => logCarelinkServiceClick(service.key, 'service_card')}
                >
                  {/* Icon with Gradient */}
                  <div
                    className={`
                      w-12 h-12 rounded-xl mb-4 flex items-center justify-center
                      bg-gradient-to-br ${service.gradient}
                      shadow-md
                    `}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold mb-2">
                    {t(`services.${service.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`services.${service.key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
            >
              <Link href="/carelink">
                {t("cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
