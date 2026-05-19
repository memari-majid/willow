import Link from "next/link";

function inlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const token = match[0]!;
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-medium text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*")) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        const href = linkMatch[2]!;
        const external = href.startsWith("http");
        parts.push(
          external ? (
            <a
              key={key++}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {linkMatch[1]}
            </a>
          ) : (
            <Link
              key={key++}
              href={href}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {linkMatch[1]}
            </Link>
          ),
        );
      }
    }
    last = match.index + token.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function WikiMarkdown({ source }: { source: string }) {
  const lines = source.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="mt-6 text-sm font-medium tracking-tight">
          {line.slice(4)}
        </h3>,
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2
          key={key++}
          className="mt-8 text-base font-medium tracking-tight first:mt-0"
        >
          {line.slice(3)}
        </h2>,
      );
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(
        <h2 key={key++} className="text-lg font-semibold tracking-tight">
          {line.slice(2)}
        </h2>,
      );
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i]!.startsWith("> ")) {
        quoteLines.push(lines[i]!.slice(2));
        i++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-2 border-border/60 pl-4 text-sm italic leading-relaxed text-muted-foreground"
        >
          {quoteLines.map((q) => (
            <p key={q.slice(0, 24)}>{inlineMarkdown(q)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i]!.startsWith("- ")) {
        items.push(lines[i]!.slice(2));
        i++;
      }
      blocks.push(
        <ul
          key={key++}
          className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground"
        >
          {items.map((item) => (
            <li key={item.slice(0, 32)}>{inlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i]!.trim() &&
      !lines[i]!.startsWith("#") &&
      !lines[i]!.startsWith("- ") &&
      !lines[i]!.startsWith("> ")
    ) {
      paraLines.push(lines[i]!);
      i++;
    }
    blocks.push(
      <p
        key={key++}
        className="text-sm leading-relaxed text-muted-foreground"
      >
        {inlineMarkdown(paraLines.join(" "))}
      </p>,
    );
  }

  return <div className="space-y-3">{blocks}</div>;
}
