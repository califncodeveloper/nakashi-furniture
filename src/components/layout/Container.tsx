import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** Adds consistent vertical section spacing */
  section?: boolean;
  id?: string;
}

export function Container({ as: Tag = "div", className, children, section, id }: ContainerProps) {
  return (
    <Tag id={id} className={cn("container-page", section && "section-y", className)}>
      {children}
    </Tag>
  );
}
