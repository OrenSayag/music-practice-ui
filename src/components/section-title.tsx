interface SectionTitleProps {
  children: string;
  className?: string;
}

export function SectionTitle({ children, className = '' }: SectionTitleProps) {
  const text = children.toLowerCase().replace(/ /g, '_');

  return (
    <span className={className}>
      // {text}
    </span>
  );
}
