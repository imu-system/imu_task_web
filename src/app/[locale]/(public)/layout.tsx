import Header from "@/components/header";
import Footer from "@/components/footer";
import { UnifiedNav } from "@/components/unified-nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-dvh flex-col">
            <UnifiedNav currentApp="imutask" />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
