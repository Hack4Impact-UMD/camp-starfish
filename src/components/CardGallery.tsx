"use client";

import { JSX, useState } from "react";

export interface GroupOptions {
  groupLabels: string[];
  defaultGroupLabel: string;
  groupFunc: (item: any) => string;
}

interface CardGalleryProps<T> {
  items: T[];
  renderItem: (item: T, isSelected?: boolean) => JSX.Element;
  groups?: GroupOptions;
}

export default function CardGallery<T extends { id: any }>(
  props: CardGalleryProps<T>
) {
  const { items, renderItem, groups } = props;
  const [selectedItemIds, setSelectedItemIds] = useState<any[]>([]);
  console.log(selectedItemIds);

  const toggleItem = (itemId: any) => {
    setSelectedItemIds((prev: any[]) => {
      if (prev.indexOf(itemId) === -1) {
        return [...prev, itemId];
      }
      return prev.filter((i: T) => i !== itemId);
    });
  };

  if (!groups) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {items.map((item: T) => (
          <div onClick={() => toggleItem(item.id)}>
            {renderItem(item, selectedItemIds.indexOf(item.id) !== -1)}
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
    setSelectedItemIds((prev: any[]) => {
      if (checked) {
        return Array.from(
          new Set([...prev, ...itemGroups[label].map((item: T) => item.id)])
        );
      }
      return prev.filter(
        (id: any) => !itemGroups[label].some((item: T) => item.id === id)
      );
    });
  };

  groupLabels.push(defaultGroupLabel);
  return (
    <div className="mt-6 space-y-8">
      {groupLabels.map(
        (label: string) =>
          itemGroups[label] && (
            <div key={label}>
              <div className="flex items-center gap-8 mb-4">
                <h2 className="text-xl font-lato text-camp-primary">{label}</h2>
                <input
                  type="checkbox"
                  checked={itemGroups[label].every(
                    (item: T) => selectedItemIds.indexOf(item.id) !== -1
                  )}
                  onChange={(event) => toggleGroup(label, event.target.checked)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {itemGroups[label].map((item: T) => (
                  <div onClick={() => toggleItem(item.id)}>
                    {renderItem(item, selectedItemIds.indexOf(item.id) !== -1)}
                  </div>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}
