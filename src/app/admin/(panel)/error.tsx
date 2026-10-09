'use client';

export default function PanelError() {
  return (
    <div role="alert" className="border-[3px] border-ink bg-paper p-6 shadow-[6px_6px_0_var(--color-ink)]">
      <h1 className="font-shout text-3xl uppercase">Algo se rompió. Probá de nuevo.</h1>
      <p className="mt-4">
        {/* <a> a propósito: recarga completa para salir del estado de error */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/admin/productos"
          className="pixel inline-block border-[3px] border-ink bg-acid px-4 py-3 shadow-[4px_4px_0_var(--color-ink)]"
        >
          Volver
        </a>
      </p>
    </div>
  );
}
