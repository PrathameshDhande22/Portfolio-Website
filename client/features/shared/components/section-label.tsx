interface SectionLabelProps {
  left: string | null;
  right?: string | null;
}

export function SectionLabel({ left, right }: SectionLabelProps) {
  if (!left && !right) return null;

  return (
    <div className="mb-6 flex items-center gap-[0.9rem] text-[0.72rem] font-semibold tracking-widest text-ink-3 uppercase after:h-px after:flex-1 after:bg-line after:content-['']">
      {left}
      {right ? <span className="order-1 text-accent">{right}</span> : null}
    </div>
  );
}
