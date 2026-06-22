// src/lib/article-body.tsx
interface ArticleBodyProps {
  body: string;
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function ArticleBody({ body }: ArticleBodyProps) {
  const blocks = body.split(/\n{2,}/);

  return (
    <div className="prose prose-neutral mt-8 max-w-none space-y-5 leading-relaxed text-ink/90">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={index} className="font-serif text-2xl font-semibold text-petrol">
              {trimmed.slice(3)}
            </h2>
          );
        }

        if (trimmed.startsWith("> ")) {
          const quote = trimmed
            .split("\n")
            .map((line) => line.replace(/^>\s?/, ""))
            .join(" ");
          return (
            <blockquote
              key={index}
              className="border-l-4 border-brass bg-sand/30 px-5 py-4 font-serif text-lg italic text-petrol"
            >
              {renderInline(quote)}
            </blockquote>
          );
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
