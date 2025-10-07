import React, { useState, useEffect } from "react";
import { Hero } from '@asafarim/shared-ui-react';
import "./variant-items-display.css";

export interface VariantConfig {
  id: string;
  title: string;
  description?: string;
}

interface VariantItemsDisplayProps<T> {
  variants: VariantConfig[];
  fetchFunction: (variant: string, featuredOrFilter?: boolean, myContent?: boolean) => Promise<T[]>;
  filterByUser?: boolean;
  heroProps?: {
    kicker: string;
    title: string;
    subtitle: string;
    bullets: string[];
    primaryCta?: { label: string; href: string } | { label: string; to: string };
    secondaryCta?: { label: string; href: string } | { label: string; to: string };
  };
  className?: string;
  showLoadingState?: boolean;
  showEmptySections?: boolean;
  renderSection?: (variant: VariantConfig, items: T[], index: number) => React.ReactNode;
  renderItem?: (item: T, variant: string, index: number) => React.ReactNode;
}

export const VariantItemsDisplay = <T,>({
  variants,
  fetchFunction,
  filterByUser = false,
  heroProps,
  className = "",
  showLoadingState = true,
  showEmptySections = false,
  renderSection,
  renderItem,
}: VariantItemsDisplayProps<T>) => {
  const [itemsByVariant, setItemsByVariant] = useState<Record<string, T[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const itemsData: Record<string, T[]> = {};

        await Promise.all(
          variants.map(async ({ id: variant }) => {
            const data = await fetchFunction(variant, undefined, filterByUser);
            itemsData[variant] = data;
          })
        );

        setItemsByVariant(itemsData);
      } catch (err) {
        console.error("Failed to load items:", err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [variants, fetchFunction, filterByUser]);

  const renderDefaultSection = (variant: VariantConfig, items: T[], index: number) => (
    <section key={variant.id} className={`variant-section variant-${variant.id}`}>
      <h2 className="section-title">{variant.title}</h2>
      <div className="items-grid">
        {items.map((item, itemIndex) =>
          renderItem ? renderItem(item, variant.id, itemIndex) : (
            <div key={`${variant.id}-${index}-${itemIndex}`} className="item-card">
              {JSON.stringify(item)}
            </div>
          )
        )}
      </div>
    </section>
  );

  return (
    <div className={`variant-items-display ${className}`}>
      {heroProps && (
        <Hero {...heroProps}  />
      )}

      <div className="container">
        {loading && showLoadingState ? (
          <div className="loading-state">Loading...</div>
        ) : (
          variants.map((variant, index) => {
            const items = itemsByVariant[variant.id] || [];

            // Only render section if there are items or if showEmptySections is true
            if (items.length === 0 && !showEmptySections) {
              return null;
            }

            return renderSection
              ? renderSection(variant, items, index)
              : renderDefaultSection(variant, items, index);
          })
        )}
      </div>
    </div>
  );
};

export default VariantItemsDisplay;
