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
    <ul className="w-48 font-latotext-sm font-medium text-black bg-white  rounded-[4px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      {options.map((option, i) => <li tabIndex={i} className="w-full px-4 py-2 text-camp-text-body first:rounded-t-[4px] last:rounded-b-[4px] border-b-[1px] border-b-[#DEE1E3] bg-white font-lato hover:bg-[#DEE1E3] focus:bg-[#C0C6C9] cursor-pointer" onClick={option.onSelect}>{option.label}</li>)}
    </ul>
  )
}