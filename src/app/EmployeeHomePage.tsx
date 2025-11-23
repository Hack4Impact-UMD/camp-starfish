"use client";

import { useAuth } from "@/auth/useAuth";
import GalleryCardOne from "../components/GalleryCardOne";
import { openConfirmationModal, openContentModal, openContextModal } from "@/components/genericModal";
import { modals } from "@mantine/modals";

export default function EmployeeHomePage() {
  const auth = useAuth();

  // Test handlers for each modal type
  const testConfirmationModal = () => {
    openConfirmationModal({
      title: "Are you sure you want to delete this item?",
      warningText: "WARNING: This action cannot be undone",
      onConfirm: () => {
        console.log("Confirmed!");
        alert("Item deleted!");
      },
      onCancel: () => {
        console.log("Cancelled");
      },
      confirmLabel: "CONFIRM",
      cancelLabel: "CANCEL",
      dangerous: true,
    });
  };

  const testContentModal = () => {
    openContentModal({
      title: "AM/PM FREEPLAY",
      subtitle: "Select dropdown to change schedule",
      headerIcon: (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xl">👤</span>
        </div>
      ),
      size: "lg",
      children: (
        <div className="space-y-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Freeplay Partner(s)
            </label>
            <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg">
              <span className="text-gray-400">🔍</span>
              <span className="bg-gray-200 px-3 py-1 rounded text-sm">
                Sam Smith
              </span>
              <button className="text-gray-500 hover:text-gray-700">✕</button>
              <button className="ml-auto px-3 py-1 border border-gray-300 rounded text-sm">
                1 more
              </button>
            </div>
          </div>
          <button
            className="w-full py-4 text-lg font-bold text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors uppercase tracking-wide"
            onClick={() => {
              console.log("Changes confirmed!");
              alert("Changes saved!");
              modals.closeAll();
            }}
          >
            CONFIRM CHANGES
          </button>
        </div>
      ),
    });
  };

  const testContextModal = () => {
    openContextModal({
      title: "Welcome to the Platform!",
      contextText: "Thank you for joining our camp management system.",
      description: "Here are some tips to get started with managing your programs and campers.",
      icon: (
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-4xl">✓</span>
        </div>
      ),
      actionLabel: "GET STARTED",
      cancelLabel: "CLOSE",
      onAction: () => {
        console.log("User clicked Get Started");
        alert("Let's get started!");
      },
    });
  };

  const testDangerousConfirmation = () => {
    openConfirmationModal({
      title: "Are you sure you want to delete all camper data?",
      message: "This will permanently remove all camper information from the system.",
      warningText: "WARNING: This action cannot be undone and will affect all programs.",
      onConfirm: async () => {
        console.log("Deleting all data...");
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("All data deleted!");
      },
      dangerous: true,
    });
  };

  return (
    <div className="p-10 lg:p-20 font-lato text-[20px] font-normal leading-normal text-primary-300 bg-white">
      {/* Welcome Section */}
      <div className="mb-[100px]">
        <h1 className="text-[65px] lg:text-[80px] font-semibold font-newSpirit">
          Welcome, {auth.user?.displayName}!
        </h1>
      </div>

      {/* Modal Testing Section */}
      <div className="mb-20 p-8 bg-gray-50 rounded-lg border-2 border-blue-500">
        <h1 className="text-2xl font-bold mb-4">Modal Manager Testing</h1>
        <h2 className="text-lg font-semibold mb-6 text-gray-600">
          Click buttons below to test each modal type:
        </h2>
        
        <div className="flex flex-wrap gap-4">
          {/* Confirmation Modal Test */}
          <button
            onClick={testConfirmationModal}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Test Confirmation Modal (Dangerous)
          </button>

          {/* Content Modal Test */}
          <button
            onClick={testContentModal}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Test Content Modal (Form)
          </button>

          {/* Context Modal Test */}
          <button
            onClick={testContextModal}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            Test Context Modal (Info)
          </button>

          {/* Extra Dangerous Confirmation */}
          <button
            onClick={testDangerousConfirmation}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            Test Dangerous Confirmation
          </button>

          {/* Direct Modal Manager Test */}
          <button
            onClick={() => {
              modals.open({
                title: 'Custom Modal',
                children: (
                  <div className="space-y-4">
                    <p>This is a completely custom modal using modals.open() directly.</p>
                    <button
                      className="px-4 py-2 bg-gray-800 text-white rounded"
                      onClick={() => modals.closeAll()}
                    >
                      Close
                    </button>
                  </div>
                ),
                classNames: {
                  content: 'border-2 border-green-500 rounded-xl',
                },
              });
            }}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
          >
            Test Direct modals.open()
          </button>
        </div>

        {/* Testing Notes */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-bold text-yellow-800 mb-2">Testing Checklist:</h3>
          <ul className="text-sm text-yellow-900 space-y-1 list-disc list-inside">
            <li>Check if modals have correct border colors (blue/purple)</li>
            <li>Verify buttons are rounded-full with correct colors</li>
            <li>Test confirm/cancel actions work correctly</li>
            <li>Check modal centering and overlay blur</li>
            <li>Verify close button (X) works</li>
            <li>Test clicking outside to close (if enabled)</li>
            <li>Check console logs for confirmation actions</li>
          </ul>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-wrap justify-center items-center gap-[84px]">
        {/* Albums */}
        <GalleryCardOne
          title="ALBUMS"
          href="/albums"
          description="Manage photos from past and ongoing programs"
        />
        {/* Programs */}
        <GalleryCardOne
          title="PROGRAMS"
          href="/programs"
          description="Use the activity scheduler to organize campers and staff"
        />
        {/* Campers */}
        <GalleryCardOne
          title="CAMPERS"
          href="/campers"
          description="Access the cohort list and each camper's details"
        />
      </div>
    </div>
  );
}