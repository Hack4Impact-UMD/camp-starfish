export default function ReusableFilter2(
  filterOldNew: () => void,
  filterNewOld: () => void,
  filterAZ: () => void,
  filterZA: () => void,
  ) 
  {  
    // Reusable Filter for four options
    return(
      <ul className="w-48 text-sm font-medium text-black bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        <li tabIndex={0} className="w-full px-4 py-2 border-[1px] rounded-t-lg bg-white text-black font-lato hover:bg-[#DEE1E3] focus:bg-[#C0C6C9] cursor-pointer" onClick={filterOldNew}>Oldest → Newest</li>
        <li tabIndex={1} className="w-full px-4 py-2 border-b bg-white text-black font-lato hover:bg-[#DEE1E3] focus:bg-[#C0C6C9] cursor-pointer" onClick={filterNewOld}>Newest → Oldest</li>
        <li tabIndex={2}className="w-full px-4 py-2 border-b bg-white text-black font-lato hover:bg-[#DEE1E3] focus:bg-[#C0C6C9] cursor-pointer" onClick={filterAZ}>A-Z</li>
        <li tabIndex={3} className="w-full px-4 py-2 rounded-b-lg bg-white text-black font-lato hover:bg-[#DEE1E3] focus:bg-[#C0C6C9] cursor-pointer" onClick={filterZA}>Z-A</li>
      </ul>
    )
}