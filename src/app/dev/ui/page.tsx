import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CART_PALETTES, CONSOLE_PALETTES } from '@/lib/pixel/palettes';
import { rot } from '@/lib/utils/css';
import {
  BootScreen,
  Burst,
  Button,
  Cut,
  Glitch,
  Hazard,
  Hi,
  Marquee,
  Photo,
  PixelIcon,
  Polaroid,
  SectionHead,
  Sprite,
  Stamp,
  Stars,
  Sticker,
  Tape,
  TornSection,
  Wrap,
} from '@/components/ui';

export const metadata: Metadata = { title: 'dev/ui', robots: { index: false, follow: false } };

const TAGS = [
  { n: '01', icon: 'ds', title: 'Consolas', hint: 'DS, DS Lite, 3DS, New 3DS', r: -1.5 },
  { n: '02', icon: 'cart', title: 'Cartuchos', hint: 'originales, en japonés', r: 1 },
  { n: '03', icon: 'plug', title: 'Accesorios', hint: 'cargadores, stylus, R4', r: -0.5 },
  { n: '04', icon: 'box', title: 'Estuches', hint: 'para que no se raye', r: 1.5 },
] as const;

const CARDS = [
  {
    price: '$350.000',
    burst: 'pink',
    pal: 0,
    name: 'Nintendo 3DS Gloss Pink',
    note: 'pantalla sin rayones, con cargador',
    year: 2013,
    r: -1.5,
    sr: -3,
    sold: false,
  },
  {
    price: '$250.000',
    burst: 'cyan',
    pal: 1,
    name: 'Nintendo 3DS Cosmo Black',
    note: 'la clásica. el 3D todavía marea',
    year: 2011,
    r: 1,
    sr: 2,
    sold: false,
  },
  {
    price: '$180.000',
    burst: 'acid',
    pal: 2,
    name: 'DS Lite Crimson / Black',
    note: 'bisagra firme, cosa rara',
    year: 2007,
    r: -0.8,
    sr: -2,
    sold: true,
  },
  {
    price: '$90.000',
    burst: 'yellow',
    pal: -1,
    name: 'Pokémon SoulSilver (JP)',
    note: 'en japonés, pero ya sabés qué hace',
    year: 2009,
    r: 1.4,
    sr: 3,
    sold: false,
  },
] as const;

const NOTES = [
  {
    r: -1.2,
    text: 'Buena atención y respondieron rápido todas mis dudas. El envío tardó un par de días más de lo que esperaba, pero llegó todo bien embalado.',
    who: 'Agustín // 30.09.26',
    stars: 4,
  },
  {
    r: 1.5,
    text: 'Llegó impecable, mejor de lo que se veía en las fotos. Me respondieron todas las dudas por WhatsApp antes y después de la compra.',
    who: 'Nadin // 30.09.26',
    stars: 5,
  },
  {
    r: -0.6,
    text: 'Pedí una DS Lite y me mandaron una foto del cartucho funcionando antes de despacharla. Eso no lo hace nadie.',
    who: 'Flor // 04.10.26',
    stars: 5,
  },
] as const;

export default function DevUiPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <>
      <BootScreen />

      <Marquee
        items={[
          'Envíos a todo el país',
          'Importado de Japón',
          'No es stock, es botín',
          'Soporte real, no solo venta',
          'Probadas una por una',
        ]}
      />

      <section className="hero dots">
        <Wrap className="hero-grid">
          <div className="hero-copy">
            <div className="kicker pixel">
              Nintendo DS <b>{'//'}</b> 3DS <b>{'//'}</b> Importado de Japón
            </div>
            <Glitch>
              <Cut r={-2}>Tu</Cut> <Cut r={1}>infancia,</Cut>
              <br />
              <Cut color="pink" r={-1}>
                reimportada.
              </Cut>
            </Glitch>
            <p className="lead">
              Nintendo DS, 3DS, cartuchos y rarezas rescatadas de Akihabara. Elegidas una por una, probadas, y
              enviadas a cualquier punto del país.
            </p>
            <p className="hand rot">→ retomá lo que era tuyo</p>
            <div className="cta">
              <Button variant="pink" href="#botin">
                Ver el botín
              </Button>
              <Button href="https://wa.me/5491100000000?text=Hola%20Retake" external>
                Escribinos por WhatsApp
              </Button>
            </div>
          </div>

          <div className="hero-art">
            <span className="hand doodle rot">¡mirá esto!</span>
            <Polaroid r={3} tapes="corners" caption="New 3DS XL // Akihabara">
              <Photo>
                <Sprite kind="ds" palette={CONSOLE_PALETTES[3]!} />
              </Photo>
            </Polaroid>
            <Sticker className="s1">
              Importado
              <br />
              de Japón
            </Sticker>
            <Burst className="b1">
              ¡Recién
              <br />
              llegada!
            </Burst>
            <Stamp className="st1">Ingresó 09.10.26</Stamp>
          </div>
        </Wrap>
        <Marquee
          diagonal
          color="cyan"
          separator="star"
          items={[
            'Retomá lo que era tuyo',
            'Región Japón, idioma nostalgia',
            'Soplar el cartucho no hace falta',
          ]}
        />
      </section>

      <TornSection seed="why">
        <Wrap>
          <Stamp color="ink" className="corner">
            Página 02 // sin fecha
          </Stamp>
          <div className="props">
            <div className="prop">
              <div className="px rot" style={rot(-4)}>
                <PixelIcon name="truck" />
              </div>
              <h3>Envíos a todo el país</h3>
              <p>
                Recibí tu compra estés donde estés. Embalado como si fuera a cruzar el Pacífico, porque ya lo
                cruzó.
              </p>
              <span className="hand rot">(sí, también a Ushuaia)</span>
            </div>
            <div className="prop">
              <div className="px rot" style={rot(3)}>
                <PixelIcon name="star" />
              </div>
              <h3>Productos únicos</h3>
              <p>
                Elegimos cada pieza por su estado, calidad y rareza. Si está acá, es porque la hubiéramos
                comprado nosotros.
              </p>
              <span className="hand rot">(y a veces lo hicimos)</span>
            </div>
            <div className="prop">
              <div className="px rot" style={rot(-2)}>
                <PixelIcon name="headset" />
              </div>
              <h3>Soporte real, no solo venta</h3>
              <p>
                ¿Dudas con juegos, configuración o instalación? Te acompañamos después de la compra, no
                desaparecemos.
              </p>
              <span className="hand rot">(te respondemos un humano)</span>
            </div>
          </div>
        </Wrap>
      </TornSection>

      <section className="sec" id="cat">
        <Wrap>
          <SectionHead
            label="// 01 — Categorías"
            title={
              <>
                Buscá por <Hi>tipo</Hi>
              </>
            }
            sub="Cuatro cajones. Todos importados, todos revisados."
          />
          <div className="tags">
            {TAGS.map((t) => (
              <Link key={t.n} className="tag" href="#cat" style={rot(t.r)}>
                <Tape />
                <span className="n pixel">{t.n}</span>
                <div className="px">
                  <PixelIcon name={t.icon} />
                </div>
                <h3>{t.title}</h3>
                <span className="hand">{t.hint}</span>
              </Link>
            ))}
          </div>
        </Wrap>
      </section>

      <Hazard>⚠ Stock limitado // cuando se va, se va ⚠</Hazard>

      <section className="sec" id="botin">
        <Wrap>
          <SectionHead
            label="// 02 — Últimos ingresos"
            title={
              <>
                El <Hi color="cyan">botín</Hi> de esta semana
              </>
            }
            sub="Lo más nuevo que sumamos. Una unidad de cada una, sin excepción."
          />
          <div className="cards">
            {CARDS.map((c) => (
              <article key={c.name} className={c.sold ? 'card sold' : 'card'} style={rot(c.r)}>
                <Tape />
                <Burst color={c.burst}>{c.price}</Burst>
                <Photo variant={c.pal < 0 ? 'cyan' : 'paper'} ratio="1/1">
                  {c.pal < 0 ? (
                    <Sprite kind="cart" palette={CART_PALETTES[0]!} />
                  ) : (
                    <Sprite kind="ds" palette={CONSOLE_PALETTES[c.pal]!} />
                  )}
                </Photo>
                <div className="meta">
                  <Stamp color={c.pal < 0 ? 'cyan' : 'pink'} r={c.sr}>
                    {c.pal < 0 ? 'Cartucho' : 'Consola'}
                  </Stamp>
                  <h3>{c.name}</h3>
                  <p className="hand note">{c.note}</p>
                  <div className="row">
                    <Button variant="ink" size="sm" href="#botin">
                      Lo quiero
                    </Button>
                    <span className="pixel">JP // {c.year}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Wrap>
      </section>

      <Marquee
        color="acid"
        items={['Ediciones limitadas', 'Una unidad de cada una', 'Cuando se va, se va']}
      />

      <section className="sec" id="dicen">
        <Wrap>
          <SectionHead
            label="// 03 — Reseñas"
            title={
              <>
                Lo que <Hi color="acid">dicen</Hi>
              </>
            }
            hand="(gente real, lo juramos)"
          />
          <div className="notes">
            {NOTES.map((n) => (
              <div key={n.who} className="note-card" style={rot(n.r)}>
                <Tape />
                <blockquote>&quot;{n.text}&quot;</blockquote>
                <div className="who">
                  <span className="pixel">{n.who}</span>
                  <Stars value={n.stars} />
                </div>
              </div>
            ))}
          </div>
          <div className="rating">
            <span className="big">4.7</span>
            <Stars value={5} />
            <span className="pixel">Basado en 3 reseñas. Las publicamos después de leerlas.</span>
            <Button size="sm" href="#dicen">
              Dejá la tuya
            </Button>
          </div>
        </Wrap>
      </section>

      <section className="sec">
        <Wrap>
          <SectionHead label="// dev — Botones y sellos" title="Variantes" />
          <div className="cta">
            <Button>Default</Button>
            <Button variant="pink">Pink</Button>
            <Button variant="ink">Ink</Button>
            <Button size="sm">Default sm</Button>
            <Button variant="pink" size="sm">
              Pink sm
            </Button>
            <Button variant="ink" size="sm">
              Ink sm
            </Button>
            <Button disabled>Disabled</Button>
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 32 }}>
            <Stamp r={-3}>Consola</Stamp>
            <Stamp color="cyan" r={3}>
              Cartucho
            </Stamp>
            <Stamp color="ink" r={-2}>
              Vendida
            </Stamp>
          </div>
        </Wrap>
      </section>
    </>
  );
}
