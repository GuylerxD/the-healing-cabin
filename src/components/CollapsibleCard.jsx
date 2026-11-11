import { ChevronDown } from "lucide-react";
import { useCabin, toggleSectionCollapsed } from "../store";

export default function CollapsibleCard({
  id,
  title,
  icon: Icon,
  badge,
  defaultOpen = false,
  headerClassName = "",
  children,
}) {
  const { collapsedSections } = useCabin();

  // If `id` is provided, collapse state is persisted in the global store across tabs.
  // When collapsedSections[id] is true => card is collapsed (!isOpen).
  // When collapsedSections[id] is false => card is expanded (isOpen).
  // If undefined => falls back to defaultOpen.
  const isCollapsed =
    id && collapsedSections && id in collapsedSections
      ? !!collapsedSections[id]
      : !defaultOpen;

  const isOpen = !isCollapsed;

  const handleToggle = () => {
    if (id) {
      toggleSectionCollapsed(id);
    }
  };

  return (
    <section
      className="glass overflow-hidden text-right transition-all duration-200"
      dir="rtl"
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between p-4 text-right transition hover:bg-white/[0.03] ${headerClassName}`}
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-moon shrink-0">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-xs text-moon">{title}</h3>
            {badge && (
              <span className="text-[11px] text-purple-300 block leading-tight">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-purple-300 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-mint bg-mint/15" : "rotate-0"
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-white/10 p-4 space-y-3 animate-fade-in">
          {children}
        </div>
      )}
    </section>
  );
}
