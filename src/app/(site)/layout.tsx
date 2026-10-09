import { SiteFooter } from '@/components/site/SiteFooter';
import { TopBar } from '@/components/site/TopBar';
import { WhatsAppFloat } from '@/components/site/WhatsAppFloat';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      {children}
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
