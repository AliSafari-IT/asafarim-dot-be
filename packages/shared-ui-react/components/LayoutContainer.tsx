// LayoutContainer.tsx responsive and themeable
import { type PropsWithChildren, useEffect } from "react";

export default function LayoutContainer({
  children,
  title,
  header,
  footer,
}: PropsWithChildren<{
  title?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}>) {
  useEffect(() => {
    if (title) {
      document.title = title || "ASafariM";
    }
  }, [title]);

  return (
    <>
      {header}
      {children}
      {footer}
    </>
  );
}
