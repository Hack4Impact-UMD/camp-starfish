import {
  Block,
  BundleActivity,
  BundleBlockActivities,
  SchedulingSectionType,
  JamboreeActivity,
} from "@/types/sessionTypes";
import { useState } from "react";

import { User } from "lucide-react";
import { Box, Button, Container, Select, Text, Title } from "@mantine/core";

type BlockWithId<T extends SchedulingSectionType> = Block<T> & {
  id: string;
};

interface EditActivityCardProps {
  author: string;
  block: BlockWithId<SchedulingSectionType>;
  activities: BundleBlockActivities;
  selectedActivity?: BundleActivity | JamboreeActivity;
}

export const EditActivityCard: React.FC<EditActivityCardProps> = ({
  author,
  block,
  activities,
  selectedActivity,
}) => {
  const [activity, setActivity] = useState<
    BundleActivity | JamboreeActivity | null
  >(selectedActivity ?? null);

  return (
    <Container className="max-w-md mx-auto bg-gray-100 rounded-2xl shadow-md p-8">
      <Box className="space-y-6">
        <Title className="text-2xl font-semibold text-center text-gray-800 tracking-wide">
          Block {block.id}
        </Title>

        <Box className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-800 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-800" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900">{author}</h3>
        </Box>

        <Text className="text-sm text-gray-600 italic -mt-2">
          Select dropdown to change schedule
        </Text>

        <Box>
          <Text className="block text-base font-medium text-gray-800 mb-2">
            Activity
          </Text>

            <Select
              value={activity? activity.name : "no selected activity"}
              onChange={(value) => {
                const selectedActivityObj = activities.find(
                  (a) => a.name === value
                );
                setActivity(selectedActivityObj ?? null);
              }}
              data={activities.map((activity) => ({
                value: activity.name,
                label: activity.name,
              }))}
              className="w-full appearance-none bg-gray-300 rounded-lg px-4 py-3 pr-10 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
            ></Select>
        </Box>

        <Button
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold text-base uppercase tracking-wide rounded-full py-4 transition-colors duration-200"
        >
          Confirm Changes
        </Button>
      </Box>
    </Container>
  );
};
