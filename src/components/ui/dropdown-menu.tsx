"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const XTOYBOX_COMMUNITY_URL = "https://discord.gg/abh27Dwktt";

type MenuContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenu() {
  return React.useContext(MenuContext) || { open: false, setOpen: () => {} };
}

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <MenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </MenuContext.Provider>
  );
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; children: React.ReactNode }
>(({ asChild, children, onClick, ...props }, ref) => {
  const { open, setOpen } = useMenu();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      ref,
      "aria-expanded": open,
      onClick: handleClick,
    });
  }

  return (
    <button ref={ref} type="button" aria-expanded={open} onClick={handleClick} {...props}>
      {children}
    </button>
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

function CommunityMenuLink() {
  return (
    <a
      href={XTOYBOX_COMMUNITY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M17 20c0-1.7-2.2-3-5-3s-5 1.3-5 3" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeWidth="2" />
          <path d="M19 9v4M21 11h-4" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          Comunidade XTOYBOX
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3.5 w-3.5 text-primary" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          Entre no Discord para novidades, suporte e avisos.
        </span>
      </span>
    </a>
  );
}

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end";
    sideOffset?: number;
    showCommunityLink?: boolean;
  }
>(({ className, align = "end", sideOffset = 10, style, children, showCommunityLink = true, ...props }, ref) => {
  const { open } = useMenu();
  if (!open) return null;
  const alignClass = align === "start" ? "left-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "right-0";

  return (
    <div
      ref={ref}
      style={{ top: `calc(100% + ${sideOffset}px)`, ...style }}
      className={cn(
        "absolute z-50 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border/80 bg-popover/95 p-2 text-popover-foreground shadow-xl shadow-black/20 backdrop-blur-md",
        alignClass,
        className,
      )}
      {...props}
    >
      {showCommunityLink && (
        <>
          <div className="px-1 pb-2 pt-1">
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
              Menu XTOYBOX
            </div>
            <CommunityMenuLink />
          </div>
          <div className="my-1 h-px bg-border/70" />
        </>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean;
    asChild?: boolean;
    onSelect?: (event: Event) => void;
  }
>(({ className, inset, asChild, children, onSelect, onClick, ...props }, ref) => {
  const { setOpen } = useMenu();
  const itemClass = cn(
    "relative flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground active:scale-[0.99]",
    inset && "pl-8",
    className,
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event as React.MouseEvent<HTMLDivElement>);
    onSelect?.(event.nativeEvent);
    setOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    const href = child.props.href || child.props.to || "#";
    return (
      <a href={href} className={itemClass} onClick={handleClick as any}>
        {child.props.children}
      </a>
    );
  }

  return (
    <div ref={ref} role="menuitem" tabIndex={0} className={itemClass} onClick={handleClick as any} {...props}>
      {children}
    </div>
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuSubTrigger = DropdownMenuItem;
const DropdownMenuSubContent = DropdownMenuContent;
const DropdownMenuCheckboxItem = DropdownMenuItem;
const DropdownMenuRadioItem = DropdownMenuItem;
const DropdownMenuLabel = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />;
const DropdownMenuSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />;
const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
