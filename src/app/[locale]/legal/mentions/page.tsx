/**
 * Mentions légales
 */

'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

export default function MentionsPage() {
  const t = useTranslations('Legal.Mentions');
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
        {t('back')}
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('lastUpdate')} : {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. {t('section1.title')}</h2>
            <div className="text-muted-foreground space-y-2">
              <p><strong>{t('section1.legalName')} :</strong> {t('section1.companyName')}</p>
              <p><strong>{t('section1.legalForm')} :</strong> {t('section1.legalFormValue')}</p>
              <p><strong>{t('section1.capital')} :</strong> {t('section1.capitalValue')}</p>
              <p><strong>{t('section1.siret')} :</strong> {t('section1.siretValue')}</p>
              <p><strong>{t('section1.rcs')} :</strong> {t('section1.rcsValue')}</p>
              <p>
                <strong>{t('section1.headquarters')} :</strong> {t('section1.headquartersValue')}
              </p>
              <p><strong>{t('section1.vat')} :</strong> {t('section1.vatValue')}</p>
              <p><strong>{t('section1.emailLabel')} :</strong> {t('section1.email')}</p>
              <p><strong>{t('section1.phoneLabel')} :</strong> {t('section1.phone')}</p>
            </div>
            <div className="mt-4 text-muted-foreground">
              <p>
                <strong>{t('section1.director')} :</strong> {t('section1.directorName')}
              </p>
              <p><strong>{t('section1.emailLabel')} :</strong> {t('section1.directorEmail')}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. {t('section2.title')}</h2>
            <div className="text-muted-foreground space-y-2">
              <p><strong>{t('section2.nameLabel')} :</strong> {t('section2.name')}</p>
              <p><strong>{t('section2.companyLabel')} :</strong> {t('section2.company')}</p>
              <p>
                <strong>{t('section2.addressLabel')} :</strong> {t('section2.address')}
              </p>
              <p><strong>{t('section2.websiteLabel')} :</strong> <a href="https://cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://cloud.google.com</a></p>
            </div>
            <p className="text-muted-foreground mt-4">
              {t('section2.details')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. {t('section3.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section3.paragraph1')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section3.paragraph2')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section3.paragraph3')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. {t('section4.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section4.paragraph1')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section4.paragraph2')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section4.paragraph3')}{' '}
              <button
                onClick={() => router.push('/legal/privacy')}
                className="text-primary hover:underline"
              >
                {t('section4.privacyLink')}
              </button>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. {t('section5.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section5.paragraph1')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section5.paragraph2')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section5.paragraph3')}
            </p>
            <div className="mt-2 text-muted-foreground">
              <p><strong>{t('section5.dpoLabel')} :</strong> {t('section5.dpoEmail')}</p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section5.paragraph4')}{' '}
              <button
                onClick={() => router.push('/legal/privacy')}
                className="text-primary hover:underline"
              >
                {t('section5.privacyLink')}
              </button>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. {t('section6.title')}</h2>
            <div className="text-muted-foreground space-y-2">
              <p>
                <strong>{t('section6.design')} :</strong> {t('section6.designValue')}
              </p>
              <p>
                <strong>{t('section6.uiLabel')} :</strong> shadcn/ui (
                <a
                  href="https://ui.shadcn.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://ui.shadcn.com
                </a>
                )
              </p>
              <p>
                <strong>{t('section6.framework')} :</strong> Next.js (
                <a
                  href="https://nextjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://nextjs.org
                </a>
                )
              </p>
              <p>
                <strong>{t('section6.backend')} :</strong> {t('section6.backendValue')}
              </p>
              <p>
                <strong>{t('section6.icons')} :</strong> Lucide React (
                <a
                  href="https://lucide.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://lucide.dev
                </a>
                )
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. {t('section7.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section7.paragraph1')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section7.paragraph2')}
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
              <li>{t('section7.item1')}</li>
              <li>{t('section7.item2')}</li>
              <li>{t('section7.item3')}</li>
              <li>{t('section7.item4')}</li>
              <li>{t('section7.item5')}</li>
              <li>{t('section7.item6')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. {t('section8.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section8.paragraph1')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section8.paragraph2')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. {t('section9.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section9.paragraph1')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section9.paragraph2')}
            </p>
            <p className="mt-2">
              <a
                href="https://www.economie.gouv.fr/mediation-conso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://www.economie.gouv.fr/mediation-conso
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. {t('section10.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section10.paragraph1')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. {t('section11.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section11.intro')}
            </p>
            <div className="mt-4 text-muted-foreground space-y-2">
              <p><strong>{t('section11.emailLabel')} :</strong> {t('section11.email')}</p>
              <p><strong>{t('section11.legalEmailLabel')} :</strong> {t('section11.legalEmail')}</p>
              <p><strong>{t('section11.phoneLabel')} :</strong> {t('section11.phone')}</p>
              <p>
                <strong>{t('section11.mailLabel')} :</strong> {t('section11.mailAddress')}<br />
                {t('section11.mailStreet')}<br />
                {t('section11.mailCity')}<br />
                {t('section11.mailCountry')}
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
