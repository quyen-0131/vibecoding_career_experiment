type ChoiceGroupProps<T extends string> = {
  label: string;
  options: readonly T[];
  labels?: Partial<Record<T, string>>;
  value?: T;
  onChange: (value: T) => void;
};

export function ChoiceGroup<T extends string>({ label, options, labels, value, onChange }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="choice-fieldset">
      <legend>{label}</legend>
      <div className="segmented-control">
        {options.map((option) => (
          <button
            className={value === option ? "segment selected" : "segment"}
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {labels?.[option] ?? option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
