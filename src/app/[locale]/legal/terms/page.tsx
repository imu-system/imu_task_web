/**
 * Conditions Générales d'Utilisation - Utilisateurs
 */

'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Link } from '@/navigation';

export default function TermsPage() {
  const t = useTranslations('Legal');
  const router = useRouter();

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('backButton')}
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('Terms.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('version')} - {t('lastUpdated')} : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. {t('Terms.section1.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section1.content1')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              {t('Terms.section1.content2')}
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. {t('Terms.section2.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section2.content1')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              {t('Terms.section2.content2')}
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. {t('Terms.section3.title')}</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">3.1 {t('Terms.section3.subtitle1')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section3.content1')}
            </p>
            
            <h3 className="text-xl font-semibold mb-2 mt-4">3.2 {t('Terms.section3.subtitle2')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section3.content2')}
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.3 {t('Terms.section3.subtitle3')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section3.content3')}
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. {t('Terms.section4.title')}</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">4.1 {t('Terms.section4.subtitle1')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section4.content1')}
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 {t('Terms.section4.subtitle2')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section4.content2')}
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">4.3 {t('Terms.section4.subtitle3')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section4.content3')}
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">5. {t('Terms.section5.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('Terms.section5.intro')}</p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
              <li>{t('Terms.section5.item1')}</li>
              <li>{t('Terms.section5.item2')}</li>
              <li>{t('Terms.section5.item3')}</li>
              <li>{t('Terms.section5.item4')}</li>
              <li>{t('Terms.section5.item5')}</li>
              <li>{t('Terms.section5.item6')}</li>
              <li>{t('Terms.section5.item7')}</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">6. {t('Terms.section6.title')}</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">6.1 {t('Terms.section6.subtitle1')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section6.content1')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              {t('Terms.section6.content2')}
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-4">6.2 {t('Terms.section6.subtitle2')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section6.content3')}
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">7. {t('Terms.section7.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section7.content')}
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">8. {t('Terms.section8.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section8.content')}{' '}
              <Link href="/legal/privacy" className="text-primary hover:underline">
                {t('Terms.section8.privacyLink')}
              </Link>
              .
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">9. {t('Terms.section9.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section9.content')}
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">10. {t('Terms.section10.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section10.content')}
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">11. {t('Terms.section11.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section11.content')}
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">12. {t('Terms.section12.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('Terms.section12.content')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              <strong>{t('email')} :</strong> {t('Terms.section12.legalEmail')}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
                     