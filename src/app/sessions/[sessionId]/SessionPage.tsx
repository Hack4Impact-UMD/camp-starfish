"use client";

import { Session } from "@/types/sessions/sessionTypes";
import { ActionIcon, Flex, Title, Text, Tooltip } from "@mantine/core";
import { MdEdit } from "react-icons/md";
import moment from "moment";
import SessionCalendar from "./SessionCalendar";
import { SmallDirectoryBlock } from "@/components/SmallDirectoryBlock";
import { openEditSessionModal } from "@/components/EditSessionModal";
import underline from "@/assets/sessionUnderline.svg";

interface SessionPageProps {
  session: Session;
}

export default function SessionPage(props: SessionPageProps) {
  const { session } = props;

  const sessionStartDate = moment(session.startDate);
  const sessionEndDate = moment(session.endDate);

  return (
    <Flex className="flex-col w-full px-20 py-6 gap-5">
      <Flex className="flex-row items-center gap-lg">
        <Title order={1} className="font-black">
          <span
            className="inline pb-2"
            style={{
              backgroundImage: `url(${underline.src})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left bottom",
              backgroundSize: "100% 0.55rem",
            }}
          >
            {session.name}
          </span>
        </Title>
        <Text className="text-lg text-neutral-5 font-semibold">
          {sessionStartDate.format("MMMM YYYY")}
          {sessionStartDate.isSame(sessionEndDate, "month")
            ? ""
            : `-${sessionEndDate.format("MMMM YYYY")}`}
        </Text>
        <Tooltip label="Edit session">
          <ActionIcon
            variant="subtle"
            aria-label="Edit session"
            onClick={() => openEditSessionModal(session)}
          >
            <MdEdit size={22} />
          </ActionIcon>
        </Tooltip>
      </Flex>
      <div className="flex flex-row w-full gap-lg items-start">
        <div className="flex-1 min-w-0">
          <SessionCalendar sessionId={session.id} />
        </div>
        <div className="w-80 shrink-0">
          <SmallDirectoryBlock sessionId={session.id} />
        </div>
      </div>
    </Flex>
  );
}
