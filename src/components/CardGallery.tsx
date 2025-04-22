"use client";

import { JSX } from "react";

export interface GroupOptions {
  groupLabels: string[];
  defaultGroupLabel: string;
  groupFunc: (item: any) => string;
}

interface CardGalleryProps<T> {
  items: T[];
  renderItem: (item: T) => JSX.Element;
  groups?: GroupOptions;
}

export default function CardGallery<T>(props: CardGalleryProps<T>) {
  const { items, renderItem, groups } = props;

  if (groups) {
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

    groupLabels.push(defaultGroupLabel);
    return (
      <div className="mt-6 space-y-8">
        {groupLabels.map(
          (label: string) =>
            itemGroups[label] && (
              <div key={label}>
                <div className="flex items-center gap-8 mb-4">
                  <h2 className="text-xl font-lato text-camp-primary">
                    {label}
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {itemGroups[label].map((item: T) => renderItem(item))}
                </div>
              </div>
            )
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {items.map((item: T) => renderItem(item))}
    </div>
  );
}
