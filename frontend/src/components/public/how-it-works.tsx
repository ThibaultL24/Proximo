// src/components/public/how-it-works.tsx
import { BrandMark } from "../brand/brand-mark";
import { HOW_IT_WORKS } from "../../lib/public-nav";

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-heading"
      className="border-y border-line py-14 sm:py-16"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-16">
        <header className="flex flex-col items-center text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            {HOW_IT_WORKS.eyebrow}
          </p>
          <h2
            id="how-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          >
            {HOW_IT_WORKS.title}
          </h2>
          <BrandMark className="mt-8 h-28 w-28 text-ink sm:h-36 sm:w-36" />
        </header>

        <div className="max-w-2xl space-y-6">
          <p className="font-serif text-[1.35rem] font-normal leading-[1.45] tracking-tight text-ink sm:text-[1.5rem]">
            {HOW_IT_WORKS.lead}
          </p>
          <div className="space-y-5 text-[1.05rem] leading-[1.8] text-ink-muted">
            {HOW_IT_WORKS.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
