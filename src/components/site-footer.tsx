import Link from "next/link";
import { Github } from "lucide-react";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/discover", label: "Discover" },
      { href: "/discover?tab=projects", label: "Projects" },
      { href: "/about", label: "About" },
      { href: "/docs/api", label: "API docs" }
    ]
  },
  {
    title: "Creators",
    links: [
      { href: "/signup", label: "Create your page" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/faq", label: "FAQ" },
      { href: "/guidelines", label: "Guidelines" }
    ]
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "Our story" },
      { href: "https://github.com/", label: "GitHub", external: true },
      { href: "/open-source", label: "Open source" },
      { href: "/contact", label: "Contact" }
    ]
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/guidelines", label: "Guidelines" }
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-mono text-lg font-bold">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-white" />
              OpenJar
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
              Open support for open creators. A free, open-source home for the people building amazing things.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 transition-colors hover:text-white"
                aria-label="OpenJar on GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <Link href="/rss" className="font-mono text-xs text-neutral-500 transition-colors hover:text-white">
                RSS
              </Link>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-neutral-900 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xs text-neutral-600">
            © {new Date().getFullYear()} OpenJar · MIT licensed · no middlemen, no lock-in
          </p>
          <p className="font-mono text-xs text-neutral-600">made in the open, by creators</p>
        </div>
      </div>
    </footer>
  );
}
