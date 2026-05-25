import Link from "next/link";

const links = [
  { href: "/admin/safety", label: "Safety review" },
  { href: "/admin/personalization", label: "Personalization review" },
] as const;

export function AdminNav({ current }: { current: (typeof links)[number]["href"] }) {
  return (
    <nav className="flex flex-wrap gap-3 text-sm">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={
            href === current
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground hover:underline"
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
