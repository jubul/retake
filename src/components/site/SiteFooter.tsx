import Link from 'next/link';
import { PixelIcon, WhatsAppLink } from '@/components/ui';
import { CATEGORIES } from '@/lib/products/constants';
import { publicEnv } from '@/lib/public-env';
import { GENERIC_WHATSAPP_MESSAGE } from '@/lib/utils/whatsapp';

export function SiteFooter() {
  const handle = publicEnv.instagram.replace(/^@/, '');
  return (
    <footer>
      <div className="wrap foot">
        <div>
          <div className="skull">
            <PixelIcon name="skull" />
          </div>
          <div className="brand">RETAKE</div>
          <p className="pixel" style={{ margin: '8px 0 14px', color: 'rgba(242,239,230,.6)' }}>
            Buenos Aires, AR {'//'} importado de Japón
          </p>
          <span className="hand rot">hecho con cinta, fotocopias y nostalgia</span>
        </div>
        <div>
          <h4 className="pixel">Navegar</h4>
          <ul>
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li>
              <Link href="/botin">Botín</Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.value}>
                <Link href={`/botin?categoria=${c.value}`}>{c.plural}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="pixel">Hablemos</h4>
          <ul>
            <li>
              <WhatsAppLink message={GENERIC_WHATSAPP_MESSAGE}>WhatsApp</WhatsAppLink>
            </li>
            {handle ? (
              <li>
                <a href={`https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer">
                  Instagram @{handle}
                </a>
              </li>
            ) : null}
            <li>
              <a href="#top">Volver arriba ↑</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap legal pixel">
        <span>© {new Date().getFullYear()} Retake. Todos los cartuchos reservados.</span>
        <span>No afiliados a Nintendo. Ni a nadie.</span>
      </div>
    </footer>
  );
}
