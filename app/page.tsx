export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12 sm:py-20">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Coffee Corner</h1>
        <p className="text-muted-foreground">
          Tracker personal de café de especialidad.
        </p>
      </header>
      <section className="rounded-lg border border-border bg-card p-6 text-sm text-card-foreground">
        <p className="font-medium">Fase 0 completada.</p>
        <p className="mt-2 text-muted-foreground">
          Próximo paso: conectar Neon y correr la primera migración.
        </p>
      </section>
    </main>
  )
}
