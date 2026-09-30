import { cn } from "@/lib/utils";

type ContainerProps = {
  as?: keyof JSX.IntrinsicElements;
  wide?: boolean;
  /** No max width at all, only the side gutters — for a section that runs
      the full width of the screen (the home hero). Takes precedence over
      `wide`. */
  full?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function Container({
  as: Tag = "div",
  wide = false,
  full = false,
  className,
  children,
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 sm:px-6 md:px-10 lg:px-14",
        !full && (wide ? "max-w-wide" : "max-w-content"),
        className
      )}
    >
      {children}
    </Tag>
  );
}
