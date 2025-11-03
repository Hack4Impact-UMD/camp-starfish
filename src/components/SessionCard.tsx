// "use client";

// import { Card, Stack, Title, Text, Button, ActionIcon, useMantineTheme } from "@mantine/core";
// import Image from "next/image";
// import moment from "moment";
// import trashIcon from "@/assets/icons/trashIcon.svg";
// import { Session } from "@/types/sessionTypes";

// interface SessionCardProps {
//   session: Session;
//   editMode: boolean;
//   onDelete: (id: string) => void;
//   onOpenSchedule?: (id: string) => void;
// }

// export default function SessionCard({
//   session,
//   editMode,
//   onDelete,
//   onOpenSchedule,
// }: SessionCardProps) {
//   const theme = useMantineTheme();

//   const formatDate = (date: string) => moment(date).format("dddd, MMMM Do");

//   return (
//     <Card
//       key={session.name}
//       shadow="md"
//       radius="lg"
//       withBorder
//       style={{
//         position: "relative",
//         width: "260px",
//         borderColor: theme.colors.gray[3],
//         backgroundColor: theme.colors.gray[0],
//       }}
//     >
//       <Stack align="center" gap="sm" p="sm">
//         <Title order={4} c="primary">
//           {session.name}
//         </Title>

//         <Stack gap={0} align="center">
//           <Text size="sm">
//             <strong>From:</strong> {formatDate(session.startDate)}
//           </Text>
//           <Text size="sm">
//             <strong>To:</strong> {formatDate(session.endDate)}
//           </Text>
//         </Stack>

//         <Button
//           mt="sm"
//           color="secondary-green"
//           radius="xl"
//           onClick={() => onOpenSchedule?.(session.name)}
//         >
//           GO TO SCHEDULE
//         </Button>
//       </Stack>

//       {/* Trash Icon (only in edit mode) */}
//       {editMode && (
//         <ActionIcon
//           variant="transparent"
//           radius="xl"
//           onClick={() => onDelete(session.name)}
//           style={{
//             position: "absolute",
//             top: 10,
//             right: 10,
//           }}
//         >
//           <Image src={trashIcon} alt="Delete" width={20} height={20} />
//         </ActionIcon>
//       )}
//     </Card>
//   );
// }


"use client";

import { Card, Stack, Title, Text, Button, ActionIcon } from "@mantine/core";
import Image from "next/image";
import moment from "moment";
import trashIcon from "@/assets/icons/trashIcon.svg";
import { Session } from "@/types/sessionTypes";

interface SessionCardProps {
  session: Session;
  editMode: boolean;
  onDelete: (id: string) => void;
  onOpenSchedule?: (id: string) => void;
}

export default function SessionCard({
  session,
  editMode,
  onDelete,
  onOpenSchedule,
}: SessionCardProps) {
  const formatDate = (date: string) => moment(date).format("dddd, MMMM Do");

  return (
    <Card
      key={session.name}
      shadow="md"
      radius="lg"
      withBorder
      classNames={{
        root: "relative w-[260px] border-gray-300 bg-gray-100",
      }}
    >
    {/* Trash Icon wrapper */}
    {editMode && (
      <div className="absolute top-2.5 right-2.5 z-10">
        <ActionIcon
          variant="transparent"
          radius="xl"
          onClick={() => onDelete(session.name)}
          className="hover:scale-110 transition-transform"
        >
          <Image src={trashIcon} alt="Delete" width={20} height={20} />
        </ActionIcon>
      </div>
  )}

  <Stack align="center" gap="sm" p="sm">
    <Title order={4} c="primary">
      {session.name}
    </Title>

    <Stack gap={0} align="center">
      <Text size="sm">
        <strong>From:</strong> {formatDate(session.startDate)}
      </Text>
      <Text size="sm">
        <strong>To:</strong> {formatDate(session.endDate)}
      </Text>
    </Stack>

    <Button
      mt="sm"
      color="secondary-green"
      radius="xl"
      onClick={() => onOpenSchedule?.(session.name)}
    >
      GO TO SCHEDULE
    </Button>
  </Stack>
</Card>

  );
}
