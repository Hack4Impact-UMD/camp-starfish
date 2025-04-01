"use client";

import { useState, useRef, KeyboardEvent } from 'react';
import { MagnifyingGlassIcon, Cross2Icon } from '@radix-ui/react-icons';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

{/* Type TaggingProps */ }
type TaggingProps<T> = {
    items: T[];
    selectedItems: T[];
    compFunc: (item: T, searchText: string) => boolean;
    onSelectionChange: (item: T) => void;
    displayFunc: (item: T) => string;
    placeholder?: string;
    emptyMessage?: string;
};

export default function Tagging<T>({
    items,
    selectedItems,
    compFunc,
    onSelectionChange,
    displayFunc,
    placeholder = "Search...",
    emptyMessage = "No matches found",
}: TaggingProps<T>) {
    const [searchText, setSearchText] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    {/* Filter items based on search text and selected items */ }
    const filteredItems = items.filter(
        (item) => !selectedItems.includes(item) && compFunc(item, searchText)
    );

    {/* Handle item selection and close dropdown */ }
    const handleSelect = (item: T) => {
        onSelectionChange(item);
        setSearchText('');
        inputRef.current?.focus();
    };

    {/* Handle tag removal */ }
    const handleRemoveTag = (item: T, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSelectionChange(item);
    };

    {/* Handle keyboard events for Enter and Backspace */ }
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchText && filteredItems.length > 0) {
            handleSelect(filteredItems[0]);
        }
        if (e.key === 'Backspace' && searchText === '' && selectedItems.length > 0) {
            onSelectionChange(selectedItems[selectedItems.length - 1]);
        }
    };

    return (
        <div className="relative w-full max-w-lg mx-auto">
            <DropdownMenu.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                {/* Search Bar */}
                <div className="flex items-center px-4 py-2 border-2 border-black rounded-full bg-white min-h-12 w-full">
                    {/* Fixed Search Icon */}
                    <MagnifyingGlassIcon className="h-5 w-5 text-black flex-shrink-0 mr-2" />

                    {/* Input and Tags */}
                    <div className="flex items-center flex-1 gap-2 overflow-x-hidden">
                        {/* Tags Container */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
                            {selectedItems.map((item) => (
                                <div
                                    key={displayFunc(item)}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 rounded-full border border-gray-300 flex-shrink-0"
                                >
                                    {displayFunc(item)}
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemoveTag(item, e)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                        aria-label={`Remove ${displayFunc(item)}`}
                                    >
                                        <Cross2Icon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Dropdown Trigger */}
                        <DropdownMenu.Trigger asChild>
                            <div className="flex-1 min-w-[120px]">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder={selectedItems.length === 0 ? placeholder : ''}
                                    className="w-full bg-transparent outline-none text-black placeholder-gray-400 text-[16px]"
                                />
                            </div>
                        </DropdownMenu.Trigger>
                    </div>
                </div>

                {/* Dropdown Menu */}
                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        align="start"
                        className="w-[--radix-dropdown-menu-trigger-width] bg-white border-2 border-black rounded-lg shadow-lg max-h-60 overflow-auto z-50"
                        sideOffset={8}
                        style={{
                            transform: 'translateX(-16px)'
                        }}
                    >
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <DropdownMenu.Item
                                    key={displayFunc(item)}
                                    onSelect={() => handleSelect(item)}
                                    className="p-3 cursor-pointer hover:bg-gray-100 outline-none border-b border-gray-200 last:border-b-0"
                                >
                                    {displayFunc(item)}
                                </DropdownMenu.Item>
                            ))
                        ) : searchText ? (
                            <div className="p-3 text-gray-500 text-sm">
                                {emptyMessage}
                            </div>
                        ) : null}
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    );
}