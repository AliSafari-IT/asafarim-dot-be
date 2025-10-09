import type { PropsWithChildren } from "react";
import "./header.css";

export function HeaderContainer({
  children,
}: PropsWithChildren<{
  children?: React.ReactNode;
}>) {
  return (
    <header className="header">
      {children}
    </header>
  );
}
