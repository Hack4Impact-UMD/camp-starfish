"use client";

import { useState } from "react";
import Tagging from "../components/Tagging";

{/* Type Element (for testing purposes) */ }
type Element = {
  id: string;
  name: string;
};

export default function HomePage() {
  const [selectedTags, setSelectedTags] = useState<Element[]>([]);

  {/* Sample tag data (for testing purposes) */ }
  const allTags: Element[] = [
    { id: '1', name: 'first' },
    { id: '2', name: 'second' },
    { id: '3', name: 'third' },
    { id: '4', name: 'fourth' },
    { id: '5', name: 'fifth' },
    { id: '6', name: 'sixth' },
    { id: '7', name: 'seventh' },
    { id: '8', name: 'eighth' },
  ];

  return (
    // Tagging Component (for testing purposes)
    <Tagging<Element>
      items={allTags}
      selectedItems={selectedTags}
      onSelectionChange={(user) => {
        setSelectedTags(prev => 
          prev.some(u => u.id === user.id) 
            ? prev.filter(u => u.id !== user.id)
            : [...prev, user]
        );
      }}
      displayFunc={(user) => user.name}
      compFunc={(user, searchText) => 
        user.name.toLowerCase().includes(searchText.toLowerCase())
      }
      placeholder="Search tags..."
      emptyMessage="No users found"
    />
  );
}
