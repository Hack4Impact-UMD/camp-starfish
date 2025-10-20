// "use client";

// import { useAuth } from "@/auth/useAuth";
// import GalleryCardOne from "../components/GalleryCardOne";

// export default function EmployeeHomePage() {
//   const auth = useAuth();

//   return (
//     <div className="p-10 lg:p-20 font-lato text-[20px] font-normal leading-normal text-primary-300 bg-white">
//       {/* Welcome Section */}
//       <div className="mb-[100px]">
//         <h1 className="text-[65px] lg:text-[80px] font-semibold font-newSpirit">Welcome, {auth.user?.displayName}!</h1>
//       </div>

//       {/* Content Section */}
//       <div className="flex flex-wrap justify-center items-center gap-[84px]">
//         {/* Albums */}
//         <GalleryCardOne title="ALBUMS" href="/albums" description="Manage photos from past and ongoing programs"/>
//         {/* Programs */}
//         <GalleryCardOne title="PROGRAMS" href="/programs" description="Use the activity scheduler to organize campers and staff"/>
//         { /* Campers */}
//         <GalleryCardOne title="CAMPERS" href="/campers" description="Access the cohort list and each camper’s details"/>
//       </div>
//     </div>
//   )
// }

"use client";

import { useAuth } from "@/auth/useAuth";
import GalleryCardOne from "../components/GalleryCardOne";
import { useState } from "react";
import { SchedulePDF } from "@/features/scheduleGeneration/camperStafferAdminGrid";
import { getSessionById } from "@/data/firestore/sessions";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import { SessionsSubcollection, SectionsSubcollection } from "@/data/firestore/utils";
import { CamperAttendeeID, StaffAttendeeID, AdminAttendeeID, BunkID, SectionSchedule, Freeplay } from "@/types/sessionTypes";

export default function EmployeeHomePage() {
  const auth = useAuth();
  const [showPDF, setShowPDF] = useState(false);
  const [pdfData, setPdfData] = useState<{
    schedule: SectionSchedule<"BUNDLE">;
    freeplay: Freeplay;
    staff: StaffAttendeeID[];
    admin: AdminAttendeeID[];
    campers: CamperAttendeeID[];
    bunkList: BunkID[];
  } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const handleGeneratePDF = async () => {
    try {
      setDebugInfo("Loading data from emulator...");
      
      // First, let's see what sessions exist
      const sessionsRef = collection(db, "sessions");
      const sessionsSnapshot = await getDocs(sessionsRef);
      
      if (sessionsSnapshot.empty) {
        setDebugInfo("No sessions found in emulator. You may need to populate test data first.");
        return;
      }

      // Get the first session (or you can specify a session ID)
      const sessionId = sessionsSnapshot.docs[0].id;
      setDebugInfo(`Found session: ${sessionId}`);

      // Get attendees
      const attendeesRef = collection(db, `sessions/${sessionId}/${SessionsSubcollection.ATTENDEES}`);
      const attendeesSnapshot = await getDocs(attendeesRef);
      
      const campers: CamperAttendeeID[] = [];
      const staff: StaffAttendeeID[] = [];
      const admins: AdminAttendeeID[] = [];

      attendeesSnapshot.forEach(doc => {
        const data = doc.data();
        const id = parseInt(doc.id);
        if (data.role === "CAMPER") {
          campers.push({ 
            id, 
            sessionId,
            ...data 
          } as CamperAttendeeID);
        } else if (data.role === "STAFF") {
          staff.push({ 
            id, 
            sessionId,
            ...data 
          } as StaffAttendeeID);
          // Debug: Log first few staff
          if (staff.length <= 3) {
            console.log(staff);
          }
        } else if (data.role === "ADMIN") {
          admins.push({ 
            id, 
            sessionId,
            ...data 
          } as AdminAttendeeID);
        }
      });

      setDebugInfo(`Found ${campers.length} campers, ${staff.length} staff, ${admins.length} admins`);

      // Get sections to find a BUNDLE section
      const sectionsRef = collection(db, `sessions/${sessionId}/${SessionsSubcollection.SECTIONS}`);
      const sectionsSnapshot = await getDocs(sectionsRef);
      
      let bundleSectionId = null;
      sectionsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === "BUNDLE") {
          bundleSectionId = doc.id;
        }
      });

      if (!bundleSectionId) {
        setDebugInfo("No BUNDLE section found. Available sections: " + 
          sectionsSnapshot.docs.map(doc => `${doc.id} (${doc.data().type})`).join(", "));
        return;
      }

      // Get the schedule for the bundle section
      const scheduleRef = collection(db, `sessions/${sessionId}/${SessionsSubcollection.SECTIONS}/${bundleSectionId}/${SectionsSubcollection.SCHEDULE}`);
      const scheduleSnapshot = await getDocs(scheduleRef);
      
      if (scheduleSnapshot.empty) {
        setDebugInfo(`No schedule found for section ${bundleSectionId}`);
        return;
      }

      const scheduleData = scheduleSnapshot.docs[0].data() as SectionSchedule<"BUNDLE">;
      setDebugInfo(`Found schedule with ${Object.keys(scheduleData.blocks).length} blocks`);

      // Get bunks
      const bunksRef = collection(db, `sessions/${sessionId}/${SessionsSubcollection.BUNKS}`);
      const bunksSnapshot = await getDocs(bunksRef);
      const bunkList: BunkID[] = bunksSnapshot.docs.map(doc => ({ 
        id: parseInt(doc.id), // Convert string ID to number
        sessionId,
        ...doc.data() 
      } as BunkID));

      // Get freeplays
      const freeplaysRef = collection(db, `sessions/${sessionId}/${SessionsSubcollection.FREEPLAYS}`);
      const freeplaysSnapshot = await getDocs(freeplaysRef);
      
      // Combine all freeplay data
      const freeplay: Freeplay = { posts: {}, buddies: {} };
      freeplaysSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.posts) {
          Object.assign(freeplay.posts, data.posts);
        }
        if (data.buddies) {
          Object.assign(freeplay.buddies, data.buddies);
        }
      });

      setPdfData({
        schedule: scheduleData,
        freeplay,
        staff,
        admin: admins,
        campers,
        bunkList
      });
      setShowPDF(true);
      setDebugInfo("PDF data loaded successfully!");

    } catch (error) {
      setDebugInfo(`Error: ${error}`);
      console.error("Error loading data:", error);
    }
  };

  if (showPDF && pdfData) {
    return (
      <div className="w-full h-screen">
        <div className="p-4 bg-gray-100 border-b">
          <button 
            onClick={() => setShowPDF(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ← Back to Home
          </button>
        </div>
        <SchedulePDF
          schedule={pdfData.schedule}
          freeplay={pdfData.freeplay}
          staff={pdfData.staff}
          admin={pdfData.admin}
          campers={pdfData.campers}
          bunkList={pdfData.bunkList}
        />
      </div>
    );
  }

  return (
    <div className="p-10 lg:p-20 font-lato text-[20px] font-normal leading-normal text-primary-300 bg-white">
      {/* Welcome Section */}
      <div className="mb-[100px]">
        <h1 className="text-[65px] lg:text-[80px] font-semibold font-newSpirit">Welcome, {auth.user?.displayName}!</h1>
      </div>

      {/* Content Section */}
      <div className="flex flex-wrap justify-center items-center gap-[84px]">
        {/* Albums */}
        <GalleryCardOne title="ALBUMS" href="/albums" description="Manage photos from past and ongoing programs"/>
        {/* Programs */}
        <GalleryCardOne title="PROGRAMS" href="/programs" description="Use the activity scheduler to organize campers and staff"/>
        { /* Campers */}
        <GalleryCardOne title="CAMPERS" href="/campers" description="Access the cohort list and each camper's details"/>
        
        {/* Debug PDF Test Button */}
        <div className="flex flex-col items-center justify-center w-80 h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <button
            onClick={handleGeneratePDF}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Load Data from Emulator
          </button>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Load actual data from Firestore emulator
          </p>
          {debugInfo && (
            <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-left max-w-full overflow-hidden">
              {debugInfo}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}