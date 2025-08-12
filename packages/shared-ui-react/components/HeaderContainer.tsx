import { PropsWithChildren } from "react";
export default function HeaderContainer({
  navbar,
  title = "ASafariM",
}: PropsWithChildren<{
  navbar?: React.ReactNode;
  title?: string;
}>) {
  return (
    <header className="border-b w-full">
      {navbar}
      {!navbar && (
        <div className="w-full max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-brand-500" />
            <span className="font-semibold">{title}</span>
          </div>
        </div>
      )}
    </header>
  );
}
