import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppLauncherItem } from './AppLauncherItem';
import type { AppLauncherPanelProps, AppLauncherItem as AppLauncherItemType } from './types';

/**
 * The floating panel that contains the grid of app launcher items.
 */
export function AppLauncherPanel({
  items,
  sections,
  columns = 3,
  showSearch = false,
  searchPlaceholder = 'Search apps...',
  onSearch,
  onClose,
  onItemClick,
  className = '',
  style,
  panelTitle = 'Apps',
}: AppLauncherPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Get all items (flat list for keyboard navigation)
  const allItems = sections
    ? sections.flatMap((section) => section.items)
    : items;

  // Filter items based on search query
  const filteredItems = searchQuery
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allItems;

  // Group filtered items by section if using sections
  const groupedItems = sections
    ? sections.map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          filteredItems.some((fi) => fi.id === item.id)
        ),
      })).filter((section) => section.items.length > 0)
    : null;

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
    setFocusedIndex(-1);
  };

  // Handle item click
  const handleItemClick = useCallback((item: AppLauncherItemType) => {
    item.onClick?.();
    onItemClick?.(item);
    onClose();
  }, [onItemClick, onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const itemCount = filteredItems.length;
    if (itemCount === 0) return;

    const currentCols = columns;
    let newIndex = focusedIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = focusedIndex < itemCount - 1 ? focusedIndex + 1 : 0;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = focusedIndex > 0 ? focusedIndex - 1 : itemCount - 1;
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = focusedIndex + currentCols;
        if (newIndex >= itemCount) {
          newIndex = focusedIndex % currentCols;
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = focusedIndex - currentCols;
        if (newIndex < 0) {
          const lastRowStart = Math.floor((itemCount - 1) / currentCols) * currentCols;
          newIndex = Math.min(lastRowStart + (focusedIndex % currentCols), itemCount - 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = itemCount - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < itemCount) {
          handleItemClick(filteredItems[focusedIndex]);
        }
        return;
      case 'Escape':
        e.preventDefault();
        onClose();
        return;
      case 'Tab':
        // Allow natural tab behavior but close if tabbing out
        if (!e.shiftKey && focusedIndex === itemCount - 1) {
          onClose();
        } else if (e.shiftKey && focusedIndex === 0 && !showSearch) {
          onClose();
        }
        return;
      default:
        return;
    }

    setFocusedIndex(newIndex);
  }, [focusedIndex, filteredItems, columns, handleItemClick, onClose, showSearch]);

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Initial focus on search or first item
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    } else if (filteredItems.length > 0) {
      setFocusedIndex(0);
    }
  }, [showSearch, filteredItems.length]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const renderItems = (itemList: AppLauncherItemType[]) => {
    return itemList.map((item, index) => {
      const globalIndex = filteredItems.findIndex((fi) => fi.id === item.id);
      return (
        <AppLauncherItem
          key={item.id}
          ref={(el) => {
            itemRefs.current[globalIndex] = el;
          }}
          item={item}
          onClick={() => handleItemClick(item)}
          onKeyDown={handleKeyDown}
          isFocused={focusedIndex === globalIndex}
        />
      );
    });
  };

  return (
    <div
      ref={panelRef}
      className={`app-launcher-panel app-launcher-panel--cols-${columns} ${className}`}
      role="menu"
      aria-label={panelTitle}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {/* Header with search */}
      {showSearch && (
        <div className="app-launcher-panel__header">
          <div className="app-launcher-panel__search">
            <svg
              className="app-launcher-panel__search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="app-launcher-panel__search-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label={searchPlaceholder}
            />
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="app-launcher-panel__content">
        {filteredItems.length === 0 ? (
          <div className="app-launcher-panel__empty">
            <span>No apps found</span>
          </div>
        ) : groupedItems ? (
          // Render with sections
          groupedItems.map((section) => (
            <div key={section.id} className="app-launcher-panel__section">
              {section.title && (
                <h3 className="app-launcher-panel__section-title">
                  {section.title}
                </h3>
              )}
              <div className="app-launcher-panel__grid">
                {renderItems(section.items)}
              </div>
            </div>
          ))
        ) : (
          // Render flat grid
          <div className="app-launcher-panel__grid">
            {renderItems(filteredItems)}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppLauncherPanel;
