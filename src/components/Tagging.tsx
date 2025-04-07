"use client";

import Select, { MultiValue, StylesConfig, components } from 'react-select';
import { AvatarIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';

// Props for generic Tagging component
type TaggingProps<T> = {
    items: T[]; // Array of items to select from
    selectedItems: T[]; // Array of currently selected items
    onSelectionChange: (items: T[]) => void;
    getOptionLabel: (item: T) => string;
    getOptionValue: (item: T) => string;
    placeholder?: string;
    emptyMessage?: string;
    className?: string;
};

export default function Tagging<T>({
    items,
    selectedItems,
    onSelectionChange,
    getOptionLabel,
    getOptionValue,
    placeholder = "Search...",
    emptyMessage = "No matches found",
    className = ""
}: TaggingProps<T>) {
    // Custom styles for react-select
    const customStyles: StylesConfig<T, true> = {
        // Styling of main control/container
        control: (base, state) => ({
            ...base,
            border: '2px solid black',
            borderRadius: '8px',
            minHeight: '48px',
            boxShadow: 'none',
            padding: '8px 8px 8px 30px',
            '&:hover': {
                border: '2px solid black',
            }
        }),
        // Styling for selected tags
        multiValue: (base) => ({
            ...base,
            backgroundColor: '#E6EAEC',
            borderRadius: '30px',
            padding: '1px 6px',
            border: '1px solid #d1d5db',
            color: '#3B4E57',
        }),
        // Styling for remove button of selected tags
        multiValueRemove: (base) => ({
            ...base,
            ':hover': {
                backgroundColor: 'transparent',
                color: '#374151'
            },
            svg: {
                width: '20px',
                height: '20px',
            }
        }),
        // Styling for search bar container
        valueContainer: (base) => ({
            ...base,
            paddingLeft: '8px',
            gap: '8px',
            fontSize: '18px',
        }),
        // Styling for dropdown options
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#DEE1E3' : 'white',
            color: 'black',
            ':active': {
                backgroundColor: '#DEE1E3'
            }
        }),
    };

    // Custom Option component to display avatar icon with names in dropdown
    const Option = (props: any) => (
        <components.Option {...props}>
            <div className="flex items-center">
                <AvatarIcon className="w-4 h-4 mr-2" />
                {props.children}
            </div>
        </components.Option>
    );

    // Handler function to update selected items
    const handleChange = (selected: MultiValue<T>) => {
        onSelectionChange(selected ? [...selected] : []);
    };

    return (
        <div className={`w-full relative ${className}`}>
            {/* Search icon */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <MagnifyingGlassIcon className="h-5 w-5 text-black" />
            </div>

            {/* React Select component */}
            <Select<T, true>
                isMulti
                options={items}
                value={selectedItems}
                onChange={handleChange}
                getOptionLabel={getOptionLabel}
                getOptionValue={getOptionValue}
                placeholder={placeholder}
                noOptionsMessage={() => emptyMessage}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={customStyles}
                components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                    Option
                }}
            />
        </div>
    );
}