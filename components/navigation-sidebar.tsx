"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Globe2Icon, Pickaxe, Gauge, SwatchBook, Recycle } from "lucide-react";

export function NavigationSidebar({ username }: { username: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (name: string, href: string) => {
    if (pathname !== href) {
      setLoading(name);
    }
  };

  const linkClasses = (name: string) =>
    `inline-flex flex-col items-center justify-center text-[9px] text-stone-400 text-center leading-tight hover:text-white transition-colors ${
      loading === name ? "opacity-50" : ""
    }`;

  return (
    <aside className="w-10 h-screen border-r border-transparent flex flex-col justify-center items-center gap-12 bg-black">
      <a
        href={`/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses("site")}
      >
        <Globe2Icon size={18} strokeWidth={1.2} />
        <span>{loading === "site" ? "Loading..." : "Site"}</span>
      </a>

      <Link
        href={`/edit/${username}`}
        onClick={() => handleClick("edit", `/edit/${username}`)}
        className={linkClasses("edit")}
      >
        <Pickaxe size={18} strokeWidth={1.5} />
        <span>{loading === "edit" ? "Loading..." : "Edit"}</span>
      </Link>

      <Link
        href={`/dashboard/${username}`}
        onClick={() => handleClick("dash", `/dashboard/${username}`)}
        className={linkClasses("dash")}
      >
        <Gauge size={18} strokeWidth={1.5} />
        <span>{loading === "dash" ? "Loading..." : "Dash"}</span>
      </Link>

      <Link
        href={`/templates/${username}`}
        onClick={() => handleClick("templates", `/templates/${username}`)}
        className={linkClasses("templates")}
      >
        <SwatchBook size={18} strokeWidth={1.5} />
        <span>{loading === "templates" ? "Loading..." : "Template"}</span>
      </Link>

      <a
        href={`/templates/${username}`}
        onClick={() => handleClick("restore", `/templates/${username}`)}
        className={linkClasses("restore")}
      >
        <Recycle size={18} strokeWidth={1.5} />
        <span>{loading === "restore" ? "Loading..." : "Restore"}</span>
      </a>
    </aside>
  );
}
