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
      ? "min-h-[18rem] sm:min-h-[20rem] lg:min-h-[22rem]"
      : "min-h-[14.5rem] sm:min-h-[16.5rem] lg:min-h-[18rem]";

  return (
    <section className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-lg">
      <div className={`relative flex w-full items-end ${frame}`}>
        <img
          src={image.image_url}
          alt={image.image_alt}
          className="absolute inset-0 h-full w-full max-w-none object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/15" />
        <div className="relative w-full px-4 pb-6 pt-14 sm:px-10 sm:pb-10 sm:pt-16 lg:px-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-[11px] sm:tracking-[0.22em]">
            {kicker}
          </p>
          <h1
            className={
              titleClassName ||
              "mt-2 break-words font-serif text-[1.75rem] font-semibold leading-tight tracking-tight text-white sm:mt-3 sm:text-4xl md:text-5xl"
            }
          >
            {title}
          </h1>
          {children}
        </div>
      </div>
    </section>
  );
}
