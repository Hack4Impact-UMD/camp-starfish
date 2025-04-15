export default function ReusableFilter1(
  filterOldNew: () => void,
  filterNewOld: () => void,
  ) 
  {  
    // Reusable Filter for two options
    return(
      <ul className="w-48 text-sm font-medium text-black bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        <li tabIndex={0} className="w-full px-4 py-2 border-b rounded-t-lg bg-white text-black font-lato hover:bg-[#DEE1E3] focus:bg-[#C0C6C9] cursor-pointer" onClick={filterOldNew}>Oldest → Newest</li>
        <li tabIndex={1} className="w-full px-4 py-2 border-b rounded-b-lg bg-white text-black font-lato hover:bg-[#DEE1E3] focus:bg-[#C0C6C9] cursor-pointer" onClick={filterNewOld}>Newest → Oldest</li>
      </ul>
    )
}