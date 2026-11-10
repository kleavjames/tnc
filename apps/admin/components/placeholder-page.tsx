export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2 p-6 lg:p-8">
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="max-w-lg text-muted-foreground">{description}</p>
    </div>
  );
}
