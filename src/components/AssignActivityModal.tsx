import { Block, SchedulingSectionType, AttendeeID } from "@/types/sessionTypes";
import { useState } from "react";

import { MdAccountCircle } from "react-icons/md";
import { Box, Button, Container, Select, Text, Title } from "@mantine/core";
import { getFullName } from "@/utils/personUtils";
import { modals } from "@mantine/modals";

interface AssignActivityModalProps {
  participant: AttendeeID;
  block: Block<SchedulingSectionType>;
  blockId: string;
  initialActivityName: string;
}

export default function AssignActivityModal(props: AssignActivityModalProps) {
  const { participant, block, blockId, initialActivityName } = props;

  const [selectedActivityName, setSelectedActivityName] = useState<
    string | null
  >(initialActivityName);

  return (
    <Container className="max-w-md mx-auto bg-gray-100 rounded-2xl shadow-md p-8">
      <Box className="space-y-6">
        <Title className="text-2xl font-semibold text-center text-gray-800 tracking-wide">
          Block {blockId}
        </Title>

        <Box className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-800 flex items-center justify-center">
            <MdAccountCircle className="w-6 h-6 text-gray-800" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900">
            {getFullName(participant)}
          </h3>
        </Box>

        <Text className="text-sm text-gray-600 italic -mt-2">
          Select dropdown to change schedule
        </Text>

        <Box>
          <Text className="block text-base font-medium text-gray-800 mb-2">
            Activity
          </Text>

          <Select
            placeholder="No Selected Activity"
            value={selectedActivityName}
            onChange={(value) => {
              setSelectedActivityName(value);
            }}
            data={block.activities.map((activity) => ({
              value: activity.name,
              label: activity.name,
            }))}
            className="w-full appearance-none bg-gray-300 rounded-lg px-4 py-3 pr-10 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
          />
        </Box>

        <Button color="green" className="w-full">CONFIRM CHANGES</Button>
      </Box>
    </Container>
  );
}

export function openAssignActivityModal(props: AssignActivityModalProps) {
  return modals.open({
    title: "Assign Activity Modal",
    children: <AssignActivityModal {...props} />,
    classNames: {
      content: "rounded-none border-2 border-black",
      body: "p-0",
    },
  });
}
