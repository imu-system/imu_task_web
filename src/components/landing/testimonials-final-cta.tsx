import { Button } from '@/components/ui/button';
import TestimonialCard from '@/components/testimonial-card';
import placeholderImages from '@/app/lib/placeholder-images.json';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function TestimonialsFinalCTA() {
  const t = useTranslations('HomePage');

  const testimonials = [
    {
      name: t('testimonials.testimonial1.name'),
      role: t('testimonials.testimonial1.role'),
      avatarUrl: placeholderImages.testimonial1.src,
      avatarFallback: 'M',
      testimonial: t('testimonials.testimonial1.text'),
    },
    {
      name: t('testimonials.testimonial2.name'),
      role: t('testimonials.testimonial2.role'),
      avatarUrl: placeholderImages.testimonial2.src,
      avatarFallback: 'L',
      testimonial: t('testimonials.testimonial2.text'),
    },
  ];

  return (
    <>
      <section id="testimonials" className="w-full py-12 md:py-20 lg:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl font-headline mb-8">
            {t('testimonials.title')}
          </h2>

          <div className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {testimonials.map((tst, i) => (
              <TestimonialCard
                key={i}
                name={tst.name}
                role={tst.role}
                avatarUrl={tst.avatarUrl}
                avatarFallback={tst.avatarFallback}
                testimonial={tst.testimonial}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA with strong visual using next/image and overlay */}
      <section className="w-full py-16 md:py-24 lg:py-32 rounded-3xl mt-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1600&q=80"
            alt="People helping each other - background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/75 to-accent/65 opacity-90" />
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <div className="rounded-3xl p-10 md:p-16 text-white shadow-xl">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">{t('finalCta.title')}</h3>
              <p className="text-lg md:text-xl text-white/90 mb-6">{t('finalCta.description')}</p>
              <div className="flex items-center justify-center gap-4">
                <Button asChild size="lg" className="rounded-2xl">
                  <a href="/inscription">{t('finalCta.cta')}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
