import { Button } from "./components/button";
import { cn } from "./lib/utils";

export function ChoiceGroup<T extends string>({
  id,
  label,
  value,
  options,
  invalid,
  onChange,
  className,
  size = "sm",
}: {
  id: string;
  label: string;
  className?: string;
  size?:
    | "xs"
    | "sm"
    | "lg"
    | "default"
    | "xl"
    | "icon"
    | "icon-xs"
    | "icon-sm"
    | "icon-lg";
  value: T | null;
  options: readonly { value: T; label: string }[];
  invalid?: boolean;
  onChange: (value: T) => void;
}) {
  return (
    <div
      id={id}
      role="group"
      aria-label={label}
      aria-invalid={invalid || undefined}
      tabIndex={-1}
      className={cn("flex flex-wrap gap-2 outline-none", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Button
            key={option.value}
            type="button"
            size={size}
            variant={selected ? "default" : "outline"}
            aria-pressed={selected}
            className="rounded-full px-4"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
