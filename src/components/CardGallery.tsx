"use client";

import { JSX, useState } from "react";
import { Checkbox, Group, SimpleGrid, Stack, Title } from "@mantine/core";

export interface GroupOptions<T> {
  groupLabels: string[];
  defaultGroupLabel: string;
  groupFunc: (item: T) => string;
}

interface CardGalleryProps<T> {
  items: T[];
  renderItem: (item: T, isSelected: boolean) => JSX.Element;
  groups?: GroupOptions<T>;
  // Controlled selection — when provided, the parent owns selection state
  selectedItemIds?: string[];
  onToggleItem?: (id: string) => void;
  onToggleGroup?: (label: string, checked: boolean) => void;
}

export default function CardGallery<T extends { id: string }>(
  props: CardGalleryProps<T>
) {
  const { items, renderItem, groups } = props;
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);

  const isControlled = props.selectedItemIds !== undefined;
  const selectedItemIds = isControlled ? props.selectedItemIds! : internalSelectedIds;

  // Build item groups up-front so both toggleGroup and the render can reference it
  const itemGroups: { [groupLabel: string]: T[] } = {};
  if (groups) {
    const { groupLabels, defaultGroupLabel, groupFunc } = groups;
    items.forEach((item: T) => {
      let label = groupFunc(item);
      if (groupLabels.indexOf(label) === -1) label = defaultGroupLabel;
      itemGroups[label] = itemGroups[label] || [];
      itemGroups[label].push(item);
    });
  }

  const toggleItem = (itemId: string) => {
    if (isControlled) {
      props.onToggleItem?.(itemId);
    } else {
      setInternalSelectedIds((prev) =>
        prev.indexOf(itemId) === -1
          ? [...prev, itemId]
          : prev.filter((id) => id !== itemId)
      );
    }
  };

  const toggleGroup = (label: string, checked: boolean) => {
    if (isControlled) {
      props.onToggleGroup?.(label, checked);
    } else {
      setInternalSelectedIds((prev) => {
        if (checked) {
          return Array.from(new Set([...prev, ...itemGroups[label].map((item) => item.id)]));
        }
        return prev.filter((id) => !itemGroups[label].some((item) => item.id === id));
      });
    }
  };

  if (!groups) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg" mt="md">
        {items.map((item: T) => {
          const isSelected = selectedItemIds.indexOf(item.id) !== -1;
          return (
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggleItem(item.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleItem(item.id); } }}
              key={item.id}
              aria-pressed={isSelected}
              className="cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-5"
            >
              {renderItem(item, isSelected)}
            </div>
          );
        })}
      </SimpleGrid>
    );
  }

  const { groupLabels, defaultGroupLabel } = groups;
  const labels = [...groupLabels, defaultGroupLabel];
  return (
    <Stack gap="xl" mt="md">
      {labels.map(
        (label: string) =>
          itemGroups[label] && (
            <Stack gap="md" key={label}>
              <Group gap="lg" align="center">
                <Title order={4}>{label}</Title>
                <Checkbox
                  checked={itemGroups[label].every(
                    (item: T) => selectedItemIds.indexOf(item.id) !== -1
                  )}
                  onChange={(event) => toggleGroup(label, event.currentTarget.checked)}
                  aria-label={`Select all in ${label}`}
                />
              </Group>
              <SimpleGrid cols={{ base: 2, md: 3, lg: 6 }} spacing="xs">
                {itemGroups[label].map((item: T) => {
                  const isSelected = selectedItemIds.indexOf(item.id) !== -1;
                  return (
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      key={item.id}
                      aria-pressed={isSelected}
                      className="text-left p-0 bg-transparent border-0 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-5"
                    >
                      {renderItem(item, isSelected)}
                    </button>
                  );
                })}
              </SimpleGrid>
            </Stack>
          )
      )}
    </Stack>
  );
}
