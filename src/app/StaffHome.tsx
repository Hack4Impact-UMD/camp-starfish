
export default function StaffHome() {
  return (
    <div className= "p-20 font-lato text-[20px] font-normal leading-normal text-black bg-white">
      {/* Welcome Section */}
      <div className= "mb-[100px]">
        <h1 className= "text-[80px] font-semibold font-newSpirit">Welcome, staffName!</h1>
        <p>You can schedule activities, upload and tag pictures</p>
        <p>You can schedule activities, upload and tag pictures</p>
        <p>You can schedule activities, upload and tag pictures</p>
      </div>

      {/* Content Section */}
      <div className= "flex flex-col w-[453px] items-start gap-[104px]">
        {/* Albums */}
        <div className= "flex flex-col gap-[32px] w-full">
          <h3 className= "text-[32px] font-black transform uppercase">Albums</h3>
          <p>Sample instruction text goes here</p>
        </div>
        {/* Programs */}
        <div className= "flex flex-col gap-[32px] w-full">
          <h3 className= "text-[32px] font-black transform uppercase">Programs</h3>
          <p>Sample instruction text goes here</p>
        </div>
        { /* Campers */}
        <div className= "flex flex-col gap-[32px] w-full">
          <h3 className= "text-[32px] font-black transform uppercase">Campers</h3>
          <p>Sample instruction text goes here</p>
        </div>
      </div>
    </div>
  )
}