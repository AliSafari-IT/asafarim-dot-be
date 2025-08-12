// LayoutContainer.tsx responsive and themeable
import { PropsWithChildren, useEffect, useState } from 'react';

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
            document.title = title + " - ASafariM";
        }
    }, [title]);

  return (
    <div className="w-full min-h-screen flex flex-col overflow-x-hidden" >
      {header}
      <main role="main" className="flex-grow w-full max-w-full">
        {children}
      </main>
      {footer}
    </div>
  );
}
