import GalleryCardOne from "../components/GalleryCardOne";
export default function StaffHome() {
  return (
    <div className="p-20 font-lato text-[20px] font-normal leading-normal text-black bg-white">
      {/* Welcome Section */}
      <div className="mb-[100px]">
        <h1 className="text-[80px] font-semibold font-newSpirit">Welcome, staffName!</h1>
      </div>

      {/* Content Section */}
      <div className="flex flex-row flex-wrap items-start justify-between gap-[104px]">
        {/* Albums */}
        <GalleryCardOne title = "ALBUMS" description = "Manage photos from past and ongoing programs"/>
        {/* Programs */}
        <GalleryCardOne title = "PROGRAMS" description = "Use the activity scheduler to organize campers and staff"/>
        { /* Campers */}
        <GalleryCardOne title = "CAMPERS" description = "Access the cohort list and each camper’s details"/>
      </div>
    </div>
  )
}