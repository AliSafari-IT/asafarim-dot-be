// LayoutContainer.tsx responsive and themeable
import { type PropsWithChildren, useEffect, useState } from "react";

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
  const [ layoutTitle, setLayoutTitle] = useState<string | undefined>(undefined);

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
