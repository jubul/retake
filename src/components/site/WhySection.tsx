import { PixelIcon, Stamp, TornSection, Wrap } from '@/components/ui';
import type { IconName } from '@/lib/pixel/grids';
import { rot } from '@/lib/utils/css';

const PROPS: ReadonlyArray<{ icon: IconName; r: number; title: string; text: string; hand: string }> = [
  {
    icon: 'truck',
    r: -4,
    title: 'Envíos a todo el país',
    text: 'Recibí tu compra estés donde estés. Embalado como si fuera a cruzar el Pacífico, porque ya lo cruzó.',
    hand: '(sí, también a Ushuaia)',
  },
  {
    icon: 'star',
    r: 3,
    title: 'Productos únicos',
    text: 'Elegimos cada pieza por su estado, calidad y rareza. Si está acá, es porque la hubiéramos comprado nosotros.',
    hand: '(y a veces lo hicimos)',
  },
  {
    icon: 'headset',
    r: -2,
    title: 'Soporte real, no solo venta',
    text: '¿Dudas con juegos, configuración o instalación? Te acompañamos después de la compra, no desaparecemos.',
    hand: '(te respondemos un humano)',
  },
];

export function WhySection() {
  return (
    <TornSection seed="why">
      <Wrap>
        <Stamp color="ink" className="corner">
          Página 02 {'//'} sin fecha
        </Stamp>
        <div className="props">
          {PROPS.map((p) => (
            <div key={p.title} className="prop">
              <div className="px rot" style={rot(p.r)}>
                <PixelIcon name={p.icon} />
              </div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <span className="hand rot">{p.hand}</span>
            </div>
          ))}
        </div>
      </Wrap>
    </TornSection>
  );
}
