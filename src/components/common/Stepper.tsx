interface StepperProps {
  steps: string[];
  current: number;
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((label, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${done ? 'bg-gold text-felt-darker' : active ? 'bg-gold/80 text-felt-darker' : 'bg-card-surface text-white/40 border border-card-border'}`}
              >
                {done ? '✓' : idx + 1}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${active ? 'text-gold' : done ? 'text-white/60' : 'text-white/30'}`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${done ? 'bg-gold/60' : 'bg-card-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
