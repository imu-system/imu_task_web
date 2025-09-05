import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">ImuTask</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ImuTask. Tous droits réservés.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="/legal/terms"
              className="text-sm hover:underline underline-offset-4"
            >
              Conditions d'utilisation
            </Link>
            <Link
              href="/legal/privacy"
              className="text-sm hover:underline underline-offset-4"
            >
              Politique de confidentialité
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
