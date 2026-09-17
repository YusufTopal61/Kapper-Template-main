import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-eyebrow text-muted-foreground">{eyebrow}</span>
      <h2 className="mt-4 font-display text-4xl font-medium leading-[0.98] tracking-tighter text-foreground sm:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-relaxed tracking-tight text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
