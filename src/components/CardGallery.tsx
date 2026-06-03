"use client";

import { JSX, useState } from "react";
import { Checkbox } from "@mantine/core";

export interface GroupOptions<T> {
  groupLabels: string[];
  defaultGroupLabel: string;
  groupFunc: (item: T) => string;
}

interface CardGalleryProps<T> {
  items: T[];
  renderItem: (item: T, isSelected: boolean) => JSX.Element;
  groups?: GroupOptions<T>;
  // Optional controlled selection. When provided, the parent owns the selected
  // ids (e.g. to render a selection toolbar); otherwise selection is internal.
  selectedItemIds?: string[];
  onSelectionChange?: (selectedItemIds: string[]) => void;
  // Optional content rendered right-aligned in the first group's label row
  // (only applies when `groups` is set).
  firstGroupActions?: JSX.Element;
  // When false, hides the group "select all" checkboxes and disables
  // click-to-select (items render unselected). Defaults to true.
  selectable?: boolean;
}

export default function CardGallery<T extends { id: string }>(
  props: CardGalleryProps<T>
) {
  const { items, renderItem, groups } = props;
  const selectable = props.selectable ?? true;
  const isControlled = props.selectedItemIds !== undefined;
  const [internalSelectedItemIds, setInternalSelectedItemIds] = useState<
    string[]
  >([]);
  const selectedItemIds = isControlled
    ? props.selectedItemIds!
    : internalSelectedItemIds;

  const updateSelection = (updater: (prev: string[]) => string[]) => {
    if (isControlled) {
      props.onSelectionChange?.(updater(selectedItemIds));
    } else {
      setInternalSelectedItemIds(updater);
    }
  };

  const toggleItem = (itemId: string) => {
    updateSelection((prev: string[]) => {
      if (prev.indexOf(itemId) === -1) {
        return [...prev, itemId];
      }
      return prev.filter((id: string) => id !== itemId);
    });
  };

  if (!groups) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {items.map((item: T) => (
          <div
            onClick={selectable ? () => toggleItem(item.id) : undefined}
            key={item.id}
          >
            {renderItem(
              item,
              selectable && selectedItemIds.indexOf(item.id) !== -1,
            )}
          </div>
        ))}
      </div>
    );
  }

  const { groupLabels, defaultGroupLabel, groupFunc } = groups;
  const itemGroups: { [groupLabel: string]: T[] } = {};
  items.forEach((item: T) => {
    let label = groupFunc(item);
    if (groupLabels.indexOf(label) === -1) {
      label = defaultGroupLabel;
    }
    itemGroups[label] = itemGroups[label] || [];
    itemGroups[label].push(item);
  });

  const toggleGroup = (label: string, checked: boolean) => {
    updateSelection((prev: string[]) => {
      if (checked) {
        return Array.from(
          new Set([...prev, ...itemGroups[label].map((item: T) => item.id)])
        );
      }
      return prev.filter(
        (id: string) => !itemGroups[label].some((item: T) => item.id === id)
      );
    });
  };

  const allLabels = [...groupLabels, defaultGroupLabel];
  const firstRenderedLabel = allLabels.find((label) => itemGroups[label]);
  return (
    <div className="mt-6 space-y-8">
      {allLabels.map(
        (label: string) =>
          itemGroups[label] && (
            <div key={label}>
              <div className="flex items-center gap-8 mb-4">
                <h2 className="text-xl font-semibold text-navy-9">{label}</h2>
                {selectable && (
                  <Checkbox
                    color="neutral.8"
                    aria-label={`Select all ${label}`}
                    classNames={{ input: "rounded-sm" }}
                    checked={itemGroups[label].every(
                      (item: T) => selectedItemIds.indexOf(item.id) !== -1
                    )}
                    onChange={(event) => toggleGroup(label, event.currentTarget.checked)}
                  />
                )}
                {label === firstRenderedLabel && props.firstGroupActions && (
                  <div className="ml-auto">{props.firstGroupActions}</div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {itemGroups[label].map((item: T) => (
                  <div
                    onClick={selectable ? () => toggleItem(item.id) : undefined}
                    key={item.id}
                  >
                    {renderItem(
                      item,
                      selectable && selectedItemIds.indexOf(item.id) !== -1,
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}
