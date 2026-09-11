import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
        <li>
          <Link
            href="/"
            className="no-underline hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {item.href ? (
              <Link
                href={item.href}
                className="no-underline hover:underline"
                style={{ color: "var(--text-muted)" }}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: "var(--foreground)" }}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
