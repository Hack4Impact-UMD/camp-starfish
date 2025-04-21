interface SortDropdownProps {
  items: {
    label: string;
    onSelect: () => void;
  }[]
}

export default function SortDropdown(props: SortDropdownProps) {
  const { items } = props;

  return(
    <ul className="w-48 text-sm font-medium text-black bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
      {items.map((item, i) => <li tabIndex={i} className="w-full px-4 py-2 border-b first:rounded-t-lg last:rounded-b-lg bg-white text-black font-lato hover:bg-[#DEE1E3] focus:bg-[#C0C6C9] cursor-pointer" onClick={item.onSelect}>{item.label}</li>)}
    </ul>
  )
}