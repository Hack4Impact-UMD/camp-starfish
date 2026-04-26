export interface SortOption {
  label: string;
  onSelect: () => void;
}

interface SortDropdownProps {
  options: SortOption[]
}

export default function SortDropdown(props: SortDropdownProps) {
  const { options } = props;

  return(
    <ul className="w-48 text-sm font-medium text-black bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      {options.map((option, i) => <li key={i} tabIndex={i} className="w-full px-4 py-2 border-b first:rounded-t-lg last:rounded-b-lg bg-white text-black font-lato hover:bg-[#DEE1E3] focus:bg-[#C0C6C9] cursor-pointer" onClick={option.onSelect}>{option.label}</li>)}
    </ul>
  )
}