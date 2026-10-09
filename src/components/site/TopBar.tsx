import Link from 'next/link';
import { Suspense } from 'react';
import { Button, Skull } from '@/components/ui';
import { publicEnv } from '@/lib/public-env';
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from '@/lib/utils/whatsapp';
import { NavLinks } from './NavLinks';

export function TopBar() {
  return (
    <header className="top">
      <div className="wrap">
        <Link className="logo" href="/">
          <Skull />
          RETAKE
        </Link>
        <Suspense fallback={<nav className="nav pixel" />}>
          <NavLinks />
        </Suspense>
        <Button
          variant="pink"
          size="sm"
          href={whatsappUrl(publicEnv.whatsappNumber, GENERIC_WHATSAPP_MESSAGE)}
          external
        >
          WhatsApp
        </Button>
      </div>
    </header>
  );
}
