import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface AdminTabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ tabs, value, onChange }) => {
  return (
    <div className="relative -mx-4 md:mx-0">
      <div
        role="tablist"
        className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar snap-x px-4 md:px-0 [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] md:[mask-image:none]"
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={value === t.id}
              onClick={(e) => {
                onChange(t.id);
                e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
              }}
              className={`shrink-0 snap-start inline-flex items-center gap-2 h-10 px-4 rounded-full whitespace-nowrap text-sm font-medium transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                value === t.id
                  ? 'bg-white/10 text-white border border-white/15 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
