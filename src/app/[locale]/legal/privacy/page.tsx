/**
 * Politique de confidentialité (RGPD)
 */

'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  const t = useTranslations('Legal.Privacy');
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
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('version')} - {t('lastUpdate')} : {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. {t('section1.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section1.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. {t('section2.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section2.intro')}
            </p>
            <div className="mt-2 text-muted-foreground">
              <p><strong>{t('section2.companyName')}</strong></p>
              <p>Email : {t('section2.contactEmail')}</p>
              <p>Email DPO : {t('section2.dpoEmail')}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. {t('section3.title')}</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">3.1 {t('section3.subtitle1')}</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>{t('section3.item1_1')}</li>
              <li>{t('section3.item1_2')}</li>
              <li>{t('section3.item1_3')}</li>
              <li>{t('section3.item1_4')}</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.2 {t('section3.subtitle2')}</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>{t('section3.item2_1')}</li>
              <li>{t('section3.item2_2')}</li>
              <li>{t('section3.item2_3')}</li>
              <li>{t('section3.item2_4')}</li>
              <li>{t('section3.item2_5')}</li>
              <li>{t('section3.item2_6')}</li>
              <li>{t('section3.item2_7')}</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.3 {t('section3.subtitle3')}</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>{t('section3.item3_1')}</li>
              <li>{t('section3.item3_2')}</li>
              <li>{t('section3.item3_3')}</li>
              <li>{t('section3.item3_4')}</li>
              <li>{t('section3.item3_5')}</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">3.4 {t('section3.subtitle4')}</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>{t('section3.item4_1')}</li>
              <li>{t('section3.item4_2')}</li>
              <li>{t('section3.item4_3')}</li>
              <li>{t('section3.item4_4')}</li>
              <li>{t('section3.item4_5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. {t('section4.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              {t('section4.intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>{t('section4.purpose1')} :</strong> {t('section4.purpose1_desc')}
              </li>
              <li>
                <strong>{t('section4.purpose2')} :</strong> {t('section4.purpose2_desc')}
              </li>
              <li>
                <strong>{t('section4.purpose3')} :</strong> {t('section4.purpose3_desc')}
              </li>
              <li>
                <strong>{t('section4.purpose4')} :</strong> {t('section4.purpose4_desc')}
              </li>
              <li>
                <strong>{t('section4.purpose5')} :</strong> {t('section4.purpose5_desc')}
              </li>
              <li>
                <strong>{t('section4.purpose6')} :</strong> {t('section4.purpose6_desc')}
              </li>
              <li>
                <strong>{t('section4.purpose7')} :</strong> {t('section4.purpose7_desc')}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. {t('section5.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section5.intro')}
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
              <li>
                <strong>{t('section5.basis1')} :</strong> {t('section5.basis1_desc')}
              </li>
              <li>
                <strong>{t('section5.basis2')} :</strong> {t('section5.basis2_desc')}
              </li>
              <li>
                <strong>{t('section5.basis3')} :</strong> {t('section5.basis3_desc')}
              </li>
              <li>
                <strong>{t('section5.basis4')} :</strong> {t('section5.basis4_desc')}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. {t('section6.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section6.intro')}
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
              <li>
                <strong>{t('section6.recipient1')} :</strong> {t('section6.recipient1_desc')}
              </li>
              <li>
                <strong>{t('section6.recipient2')} :</strong> {t('section6.recipient2_desc')}
              </li>
              <li>
                <strong>{t('section6.recipient3')} :</strong> {t('section6.recipient3_desc')}
              </li>
              <li>
                <strong>{t('section6.recipient4')} :</strong> {t('section6.recipient4_desc')}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. {t('section7.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              {t('section7.intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>{t('section7.duration1')} :</strong> {t('section7.duration1_desc')}
              </li>
              <li>
                <strong>{t('section7.duration2')} :</strong> {t('section7.duration2_desc')}
              </li>
              <li>
                <strong>{t('section7.duration3')} :</strong> {t('section7.duration3_desc')}
              </li>
              <li>
                <strong>{t('section7.duration4')} :</strong> {t('section7.duration4_desc')}
              </li>
              <li>
                <strong>{t('section7.duration5')} :</strong> {t('section7.duration5_desc')}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. {t('section8.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              {t('section8.intro')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>{t('section8.right1')} :</strong> {t('section8.right1_desc')}
              </li>
              <li>
                <strong>{t('section8.right2')} :</strong> {t('section8.right2_desc')}
              </li>
              <li>
                <strong>{t('section8.right3')} :</strong> {t('section8.right3_desc')}
              </li>
              <li>
                <strong>{t('section8.right4')} :</strong> {t('section8.right4_desc')}
              </li>
              <li>
                <strong>{t('section8.right5')} :</strong> {t('section8.right5_desc')}
              </li>
              <li>
                <strong>{t('section8.right6')} :</strong> {t('section8.right6_desc')}
              </li>
              <li>
                <strong>{t('section8.right7')} :</strong> {t('section8.right7_desc')}
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section8.exerciseRights')} <strong>{t('section2.dpoEmail')}</strong>
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              {t('section8.complaint')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. {t('section9.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section9.intro')}
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>{t('section9.measure1')}</li>
              <li>{t('section9.measure2')}</li>
              <li>{t('section9.measure3')}</li>
              <li>{t('section9.measure4')}</li>
              <li>{t('section9.measure5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. {t('section10.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section10.intro')}
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">{t('section10.typesTitle')}</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>{t('section10.type1')} :</strong> {t('section10.type1_desc')}
              </li>
              <li>
                <strong>{t('section10.type2')} :</strong> {t('section10.type2_desc')}
              </li>
              <li>
                <strong>{t('section10.type3')} :</strong> {t('section10.type3_desc')}
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('section10.settings')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. {t('section11.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section11.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. {t('section12.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section12.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. {t('section13.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('section13.intro')}
            </p>
            <div className="mt-2 text-muted-foreground">
              <p><strong>{t('section13.dpoLabel')} :</strong> {t('section2.dpoEmail')}</p>
              <p><strong>{t('section13.emailLabel')} :</strong> {t('section2.contactEmail')}</p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
