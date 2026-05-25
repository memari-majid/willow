import Link from "next/link";

type SettingsNavProps = {
  active: "prefs" | "profile" | "memory" | "data" | "research";
};

const links: { key: SettingsNavProps["active"]; href: string; label: string }[] =
  [
    { key: "prefs", href: "/settings", label: "Preferences" },
    { key: "profile", href: "/settings/profile", label: "Your notes" },
    { key: "data", href: "/settings/data", label: "Data" },
    { key: "research", href: "/settings/research", label: "Research" },
  ];

export function SettingsNav({ active }: SettingsNavProps) {
  return (
    <nav className="flex flex-wrap gap-3 text-xs">
      {links.map((l) => (
        <Link
          key={l.key}
          href={l.href}
          className={
            active === l.key
              ? "font-medium text-foreground underline"
              : "text-muted-foreground underline-offset-4 hover:underline"
          }
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
