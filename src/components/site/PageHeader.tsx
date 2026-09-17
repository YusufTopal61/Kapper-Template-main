import { Reveal } from "./Reveal";
import { Badge } from "./Badge";

type PageHeaderProps = {
  badgeLabel: string;
  badgeText: string;
  title: string;
  description: string;
};

export function PageHeader({ badgeLabel, badgeText, title, description }: PageHeaderProps) {
  return (
    <section className="border-b border-border pt-28 pb-14 sm:pt-36 sm:pb-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <Badge label={badgeLabel} text={badgeText} />
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-medium leading-[0.95] tracking-tighter text-foreground sm:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed tracking-tight text-muted-foreground sm:text-lg">
            {description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
