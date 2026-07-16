import { cn } from "@/lib/utils";

type ContainerProps = {
  as?: keyof JSX.IntrinsicElements;
  wide?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function Container({
  as: Tag = "div",
  wide = false,
  className,
  children,
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 sm:px-6 md:px-10 lg:px-14",
        wide ? "max-w-wide" : "max-w-content",
        className
      )}
    >
      {children}
    </Tag>
  );
}
