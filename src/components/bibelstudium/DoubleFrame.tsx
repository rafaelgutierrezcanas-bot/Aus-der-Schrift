interface DoubleFrameProps {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export function DoubleFrame({ children, accent, className }: DoubleFrameProps) {
  const borderColor = accent ? "border-accent" : "border-navy";

  return (
    <div className={`border ${borderColor} p-1 ${className ?? ""}`}>
      <div className={`border ${borderColor} p-6 md:p-8`}>
        {children}
      </div>
    </div>
  );
}
