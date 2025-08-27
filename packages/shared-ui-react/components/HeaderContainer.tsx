import type { PropsWithChildren } from "react";
import "./header.css";

export default function HeaderContainer({
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
