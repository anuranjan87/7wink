import { Globe2Icon, LayoutDashboard, Origami, Recycle, SwatchBook, Undo2, Redo } from "lucide-react"

interface NavigationSidebarProps {
  username: string
}

export function NavigationSidebar({ username }: NavigationSidebarProps) {
  return (
    <aside className="w-10 h-screen border-r border-transparent flex flex-col justify-center items-center gap-12 bg-black">
      <a
        href={`/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex flex-col items-center justify-center text-[9px] text-stone-400 text-center leading-tight hover:text-white transition-colors"
      >
        <Globe2Icon size={18} strokeWidth={1.2} className="text-stone-300 hover:text-white transition-colors" />
        <span className="mt-1 break-words">Site</span>
      </a>

      <a
        href={`/dashboard/${username}`}
        className="inline-flex flex-col items-center justify-center text-[9px] text-stone-400 text-center leading-tight hover:text-white transition-colors"
      >
        <LayoutDashboard size={18} strokeWidth={1.5} className="text-stone-300 hover:text-white transition-colors" />
        <span className="mt-1 break-words">Dash</span>
      </a>

      <a
        href={`/templates/${username}`}
        className="inline-flex flex-col items-center justify-center text-[9px] text-zinc-400 text-center leading-tight hover:text-white transition-colors"
      >
        <SwatchBook size={18} strokeWidth={1.5} className="text-zinc-300 hover:text-white transition-colors" />
        <span className="mt-1 break-words">Template</span>
      </a>

       <a
        href={`/templates/${username}`}
        className="inline-flex flex-col items-center justify-center text-[9px] text-zinc-400 text-center leading-tight hover:text-white transition-colors"
      >
        <Recycle size={18} strokeWidth={1.5} className="text-zinc-300 hover:text-white transition-colors" />
        <span className="mt-1 break-words">Restore</span>
      </a>
    </aside>
  )
}
