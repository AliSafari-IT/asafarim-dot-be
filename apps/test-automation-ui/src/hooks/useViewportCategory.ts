import { useEffect, useState } from "react";
import { getViewportCategory, ViewportCategory } from "@asafarim/helpers";

export function useViewportCategory(): ViewportCategory {
  const [category, setCategory] = useState<ViewportCategory>(
    getViewportCategory()
  );

  useEffect(() => {
    const handler = () => setCategory(getViewportCategory());
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return category;
}