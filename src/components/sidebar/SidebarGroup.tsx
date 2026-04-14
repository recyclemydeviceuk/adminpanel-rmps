interface SidebarGroupProps {
  label: string;
  children: React.ReactNode;
}

export default function SidebarGroup({ label, children }: SidebarGroupProps) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600 select-none">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
