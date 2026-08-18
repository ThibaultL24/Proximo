// src/components/public/public-page-hero.tsx
interface PublicPageHeroProps {
  image: { image_url: string; image_alt: string };
  kicker: string;
  title: string;
  titleClassName?: string;
  children?: React.ReactNode;
  size?: "md" | "lg";
}

export function PublicPageHero({
  image,
  kicker,
  title,
  titleClassName,
  children,
  size = "md",
}: PublicPageHeroProps) {
  const frame =
    size === "lg"
      ? "aspect-[21/9] min-h-[260px] max-h-[420px]"
      : "aspect-[21/9] min-h-[200px] max-h-[320px]";

  return (
    <section className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-lg">
      <div className={`relative w-full ${frame}`}>
        <img
          src={image.image_url}
          alt={image.image_alt}
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/35 to-ink/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-6 pb-8 sm:px-10 sm:pb-10 lg:px-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              {kicker}
            </p>
            <h1
              className={
                titleClassName ||
                "mt-3 font-serif text-4xl font-semibold tracking-tight text-white sm:text-5xl"
              }
            >
              {title}
            </h1>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
