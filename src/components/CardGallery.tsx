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
}

export default function CardGallery<T extends { id: string }>(
  props: CardGalleryProps<T>
) {
  const { items, renderItem, groups } = props;
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    setSelectedItemIds((prev: string[]) => {
      if (prev.indexOf(itemId) === -1) {
        return [...prev, itemId];
      }
      return prev.filter((id: string) => id !== itemId);
    });
  };

  if (!groups) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg" mt="md">
        {items.map((item: T) => (
          <div onClick={() => toggleItem(item.id)} key={item.id}>
            {renderItem(item, selectedItemIds.indexOf(item.id) !== -1)}
          </div>
        ))}
      </SimpleGrid>
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
    setSelectedItemIds((prev: string[]) => {
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

  groupLabels.push(defaultGroupLabel);
  return (
    <Stack gap="xl" mt="md">
      {groupLabels.map(
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
              <SimpleGrid cols={{ base: 2, md: 3, lg: 4 }} spacing="md">
                {itemGroups[label].map((item: T) => (
                  <div onClick={() => toggleItem(item.id)} key={item.id}>
                    {renderItem(item, selectedItemIds.indexOf(item.id) !== -1)}
                  </div>
                ))}
              </SimpleGrid>
            </Stack>
          )
      )}
    </Stack>
  );
}
