import { SiteFooter } from '@/components/site/SiteFooter';
import { TopBar } from '@/components/site/TopBar';
import { Button, Cut, Wrap } from '@/components/ui';

export default function NotFound() {
  return (
    <>
      <TopBar />
      <main className="sec">
        <Wrap>
          <h1 className="h1">
            <Cut>404</Cut>
            <br />
            <Cut color="pink" r={-1}>
              la consola se colgó
            </Cut>
          </h1>
          <p className="pixel mt-8">Apagá, soplá el cartucho y volvé a intentar.</p>
          <div className="cta mt-8">
            <Button variant="pink" href="/">
              Volver al inicio
            </Button>
            <Button href="/botin">Ver el botín</Button>
          </div>
        </Wrap>
      </main>
      <SiteFooter />
    </>
  );
}
