export function StaticHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mx-auto max-w-3xl px-4 pt-16 sm:px-6">
      <p className="label-mono">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-neutral-500">{description}</p>}
    </header>
  );
}
