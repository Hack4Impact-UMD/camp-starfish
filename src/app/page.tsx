"use client";

import { useState } from "react";
import Tagging from "../components/Tagging";

{/* Sample type */ }
type Element = {
  id: string;
  name: string;
};

export default function HomePage() {
  const [selectedTags, setSelectedTags] = useState<Element[]>([]);

  {/* Sample data - Camp Starfish guest appearances! */ }
  const allTags: Element[] = [
    { id: '1', name: 'Harshitha J.' },
    { id: '2', name: 'Claire C.' },
    { id: '3', name: 'Riya M.' },
    { id: '4', name: 'Nitin K.' },
    { id: '5', name: 'Maia J.' },
    { id: '6', name: 'Esha V.' },
    { id: '7', name: 'Benjamin E.' },
    { id: '8', name: 'Christine N.' },
    { id: '9', name: 'Gelila K.' },
    { id: '10', name: 'Joel C.' },
    { id: '11', name: 'Rivan P.' },
    { id: '12', name: 'Saharsh M.' },
    { id: '13', name: 'Nishtha D.' },
  ];

  return (
    <div className="p-8">
      <Tagging<Element>
        items={allTags}
        selectedItems={selectedTags}
        onSelectionChange={setSelectedTags}
        getOptionLabel={(item) => item.name}
        getOptionValue={(item) => item.id}
        placeholder="Search tags..."
        emptyMessage="No tags found"
        className="max-w-lg"
      />
    </div>
  );
}