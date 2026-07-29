interface InputOption {
  id: string;
  label: string;
}

interface StationInputProps {
  prompt: string;
  inputType: "freitext" | "auswahl";
  options?: InputOption[];
  stationId: string;
  unitSlug: string;
  disabled?: boolean;
  action: (formData: FormData) => Promise<void>;
}

export function StationInput({
  prompt,
  inputType,
  options,
  stationId,
  unitSlug,
  disabled,
  action,
}: StationInputProps) {
  return (
    <div className="mb-8">
      <p
        className="text-navy mb-4"
        style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
      >
        {prompt}
      </p>

      <form action={action}>
        <input type="hidden" name="stationId" value={stationId} />
        <input type="hidden" name="unitSlug" value={unitSlug} />

        {inputType === "freitext" ? (
          <textarea
            name="input"
            disabled={disabled}
            className="w-full min-h-[120px] p-4 text-navy bg-surface/50 border-0 resize-y focus:outline-none focus:ring-1 focus:ring-navy/30 rounded"
            style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
            placeholder="Schreibe hier deine Antwort…"
          />
        ) : (
          <div className="space-y-2">
            {options?.map((option) => (
              <label
                key={option.id}
                className="block w-full p-3 border border-border text-navy cursor-pointer hover:bg-surface/50 transition-colors"
                style={{ fontFamily: "var(--font-body-serif)" }}
              >
                <input
                  type="radio"
                  name="input"
                  value={option.label}
                  className="sr-only"
                  disabled={disabled}
                />
                {option.label}
              </label>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="mt-4 px-5 py-2 text-sm text-navy border border-navy hover:bg-navy/5 transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Einklammern
        </button>
      </form>
    </div>
  );
}
