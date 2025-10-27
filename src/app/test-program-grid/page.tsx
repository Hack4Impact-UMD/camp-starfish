'use client';

import { ProgramAreaGrid } from '@/features/scheduling/ProgramAreaGrid';
import { SectionSchedule } from '@/types/sessionTypes';
import { PDFViewer } from '@react-pdf/renderer';

// Test data for ProgramAreaGrid - Based on the example image
const testSchedule: SectionSchedule<'BUNDLE'> = {
  blocks: {
    "A": {
      activities: [
        {
          name: "Jump For Joy!",
          description: "Jumping activities",
          programArea: { name: "Activate", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [1, 2, 3],
            staffIds: [10, 11],
            adminIds: [20]
          }
        },
        {
          name: "Paper Dolls",
          description: "Paper crafts",
          programArea: { name: "Arts & Crafts", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [4, 5],
            staffIds: [12],
            adminIds: [21]
          }
        },
        {
          name: "Quidditch",
          description: "Fantasy sport",
          programArea: { name: "Athletics", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [6, 7, 8],
            staffIds: [13, 14],
            adminIds: [22]
          }
        },
        {
          name: "Groovy Moves",
          description: "Dance activities",
          programArea: { name: "Dance", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [9, 10],
            staffIds: [15],
            adminIds: [23]
          }
        },
        {
          name: "Bird Houses",
          description: "Build bird houses",
          programArea: { name: "Discovery", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [11, 12],
            staffIds: [16],
            adminIds: [24]
          }
        },
        {
          name: "Nature",
          description: "Nature activities",
          programArea: { name: "Xplore!", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [13, 14],
            staffIds: [17],
            adminIds: [25]
          }
        },
        {
          name: "Swimming",
          description: "Swimming",
          programArea: { name: "Waterfront", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [15, 16, 17],
            staffIds: [18, 19],
            adminIds: [26]
          }
        }
      ],
      periodsOff: [1, 2]
    },
    "B": {
      activities: [
        {
          name: "Parkour",
          description: "Obstacle course",
          programArea: { name: "Activate", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [18, 19, 20],
            staffIds: [20, 21],
            adminIds: [27]
          }
        },
        {
          name: "Art",
          description: "Art projects",
          programArea: { name: "Arts & Crafts", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [21, 22],
            staffIds: [22],
            adminIds: [28]
          }
        },
        {
          name: "Basketball",
          description: "Basketball games",
          programArea: { name: "Athletics", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [23, 24, 25],
            staffIds: [23, 24],
            adminIds: [29]
          }
        },
        {
          name: "Slime Time",
          description: "Science experiments",
          programArea: { name: "Learning Center", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [26, 27],
            staffIds: [25],
            adminIds: [30]
          }
        },
        {
          name: "You can Uke",
          description: "Music lessons",
          programArea: { name: "Music", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [28, 29],
            staffIds: [26],
            adminIds: [31]
          }
        },
        {
          name: "Goat Yoga",
          description: "Yoga with animals",
          programArea: { name: "Small Animals", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [30, 31],
            staffIds: [27],
            adminIds: [32]
          }
        },
        {
          name: "Swimming",
          description: "Swimming",
          programArea: { name: "Waterfront", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [32, 33, 34],
            staffIds: [28, 29],
            adminIds: [33]
          }
        }
      ],
      periodsOff: [3, 4]
    },
    "C": {
      activities: [
        {
          name: "Jumping",
          description: "Jumping activities",
          programArea: { name: "Activate", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [35, 36, 37],
            staffIds: [30, 31],
            adminIds: [34]
          }
        },
        {
          name: "Costumes",
          description: "Create costumes",
          programArea: { name: "Arts & Crafts", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [38, 39],
            staffIds: [32],
            adminIds: [35]
          }
        },
        {
          name: "Basketball",
          description: "Basketball games",
          programArea: { name: "Athletics", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [40, 41, 42],
            staffIds: [33, 34],
            adminIds: [36]
          }
        },
        {
          name: "Canoeing",
          description: "Canoeing",
          programArea: { name: "Boating", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [43, 44, 45],
            staffIds: [35, 36],
            adminIds: [37]
          }
        },
        {
          name: "Campfire Cornbread",
          description: "Outdoor cooking",
          programArea: { name: "Outdoor Cooking", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [46, 47],
            staffIds: [37],
            adminIds: [38]
          }
        },
        {
          name: "Teen Chat",
          description: "Teen discussion",
          programArea: { name: "Teens", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [48, 49, 50],
            staffIds: [38],
            adminIds: [39]
          }
        },
        {
          name: "Swimming",
          description: "Swimming",
          programArea: { name: "Waterfront", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [51, 52, 53],
            staffIds: [39, 40],
            adminIds: [40]
          }
        }
      ],
      periodsOff: [5, 6]
    },
    "D": {
      activities: [
        {
          name: "Design",
          description: "Create costumes",
          programArea: { name: "Arts & Crafts", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [54, 55],
            staffIds: [41],
            adminIds: [41]
          }
        },
        {
          name: "Quidditch",
          description: "Fantasy sport",
          programArea: { name: "Athletics", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [56, 57, 58],
            staffIds: [42, 43],
            adminIds: [42]
          }
        },
        {
          name: "Canoeing",
          description: "Canoeing",
          programArea: { name: "Boating", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [59, 60, 61],
            staffIds: [44, 45],
            adminIds: [43]
          }
        },
        {
          name: "Leaf Love",
          description: "Nature activities",
          programArea: { name: "Xplore!", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [62, 63],
            staffIds: [46],
            adminIds: [44]
          }
        },
        {
          name: "Teen Chat",
          description: "Teen discussion",
          programArea: { name: "Teens", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [64, 65, 66],
            staffIds: [47],
            adminIds: [45]
          }
        },
        {
          name: "Swimming",
          description: "Swimming",
          programArea: { name: "Waterfront", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [67, 68, 69],
            staffIds: [48, 49],
            adminIds: [46]
          }
        }
      ],
      periodsOff: [7, 8]
    },
    "E": {
      activities: [
        {
          name: "Parkour",
          description: "Obstacle course",
          programArea: { name: "Activate", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [70, 71, 72],
            staffIds: [50, 51],
            adminIds: [47]
          }
        },
        {
          name: "Pottery",
          description: "Clay sculpting",
          programArea: { name: "Arts & Crafts", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [73, 74],
            staffIds: [52],
            adminIds: [48]
          }
        },
        {
          name: "Rowing",
          description: "Rowing skills",
          programArea: { name: "Boating", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [75, 76, 77],
            staffIds: [53, 54],
            adminIds: [49]
          }
        },
        {
          name: "Drama",
          description: "Improv theater",
          programArea: { name: "Drama", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [78, 79],
            staffIds: [55],
            adminIds: [50]
          }
        },
        {
          name: "Music",
          description: "Music lessons",
          programArea: { name: "Music", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [80, 81],
            staffIds: [56],
            adminIds: [51]
          }
        },
        {
          name: "Teen Chat",
          description: "Teen discussion",
          programArea: { name: "Teens", isDeleted: false },
          ageGroup: "OCP" as const,
          assignments: {
            camperIds: [82, 83, 84],
            staffIds: [57],
            adminIds: [52]
          }
        },
        {
          name: "Swimming",
          description: "Swimming",
          programArea: { name: "Waterfront", isDeleted: false },
          ageGroup: "NAV" as const,
          assignments: {
            camperIds: [85, 86, 87],
            staffIds: [58, 59],
            adminIds: [53]
          }
        }
      ],
      periodsOff: [9, 10]
    }
  },
  alternatePeriodsOff: {
    "1": [1, 2],
    "2": [3, 4],
    "3": [5, 6],
    "4": [7, 8],
    "5": [9, 10]
  }
};

const testSectionName = "Summer Camp 2024";

export default function TestProgramGridPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Program Area Grid Test
          </h1>
          <p className="text-gray-600 mb-4">
            This page allows you to test the ProgramAreaGrid component with sample data.
            The grid shows how activities are organized across different program areas and blocks.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Test Data Includes:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• 5 blocks (A, B, C, D, E)</li>
              <li>• 12 program areas (Activate, Arts & Crafts, Athletics, Boating, Dance, Discovery, Drama, Learning Center, Music, Outdoor Cooking, Small Animals, Teens, Waterfront, Xplore!)</li>
              <li>• Activities with different age groups (NAV, OCP)</li>
              <li>• Mixed activity distribution across blocks with some empty cells</li>
              <li>• Realistic camp activities matching the example image</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Generated Program Area Grid
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              This is how the PDF will look when generated
            </p>
          </div>
          
          <div style={{ height: '80vh', width: '100%' }}>
            <PDFViewer width="100%" height="100%">
              <ProgramAreaGrid schedule={testSchedule} sectionName={testSectionName} />
            </PDFViewer>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Instructions</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>1. Visual Check:</strong> Verify that the grid displays correctly with proper borders and layout</p>
            <p><strong>2. Program Areas:</strong> Check that all 12 program areas appear as column headers, sorted alphabetically</p>
            <p><strong>3. Block Organization:</strong> Ensure blocks A, B, C, D, E are sorted alphabetically and show as row headers</p>
            <p><strong>4. Activity Placement:</strong> Verify activities appear in the correct program area columns</p>
            <p><strong>5. Age Groups:</strong> Check that age groups (NAV, OCP) are displayed in parentheses after activity names</p>
            <p><strong>6. Empty Cells:</strong> Notice that some program areas don't have activities in certain blocks (empty cells with light gray background)</p>
            <p><strong>7. Text Wrapping:</strong> Check that long activity names wrap properly within cells instead of overflowing</p>
            <p><strong>8. Centering & Padding:</strong> Verify all text is properly centered and has adequate padding on all sides</p>
            <p><strong>9. Layout:</strong> Verify the grid matches the example image structure with proper spacing and alignment</p>
          </div>
        </div>
      </div>
    </div>
  );
}