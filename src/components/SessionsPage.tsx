"use client";

import { useMemo, useState } from "react";
import { Button, Group, Stack, Title, Menu, Text } from "@mantine/core";
import moment from "moment";
import Image from "next/image";
import { SessionID } from "@/types/sessionTypes";
import pencilIcon from "@/assets/icons/pencilIcon.svg";
import checkIcon from "@/assets/icons/checkIcon.svg";
import trailPattern2 from "@/assets/patterns/trailPattern2.svg";
import arrowDown from "@/assets/icons/arrowDown.svg";
import arrowRight from "@/assets/icons/arrowRight.svg";
import SessionCard from "@/components/SessionCard";
import { openCreateSessionModal } from "@/components/CreateSessionModal";



interface SessionsPageProps {
  sessions: SessionID[];
}

export default function SessionsPage({ sessions }: SessionsPageProps) {
  const [editMode, setEditMode] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNonCurrent, setShowNonCurrent] = useState(false);

  // --- Categorize sessions ---
  const { current, future, past } = useMemo(() => {
    const now = moment();
    const current: SessionID[] = [];
    const future: SessionID[] = [];
    const past: SessionID[] = [];

    for (const s of sessions) {
      const start = moment(s.startDate);
      const end = moment(s.endDate);

      if (now.isSameOrAfter(start) && now.isBefore(end)) current.push(s);
      else if (start.isAfter(now)) future.push(s);
      else past.push(s);
    }

    future.sort((a, b) => moment(a.startDate).diff(moment(b.startDate)));
    past.sort((a, b) => moment(b.startDate).diff(moment(a.startDate)));

    return { current, future, past };
  }, [sessions]);

  if (sessions.length === 0) {
    return (

      <Group className="relative flex-1 flex flex-col items-center justify-center w-full min-h-screen overflow-x-hidden">
        <Image
          src={trailPattern2.src}
          alt="Trail Pattern"
          width={1000}
          height={218}
          className="absolute top-[20px] left-[700px] flex items-center justify-center transform rotate-[1.86deg] z-0 overflow-hidden"
        />
        <Text
          fw={700}
          fz={52}
          ta="center"
          className="font-lato text-black"
        >
          You have nothing <br></br>scheduled yet!
        </Text>
        <Button
          size="lg"
          color="green"
          radius="xl"
          onClick={openCreateSessionModal}
        >
          <span className="flex items-center gap-2">
            Create Session
            <Image src={checkIcon} alt="Customized" width={16} height={16} />
          </span>
        </Button>


      </Group>
    );
  }


  return (
    <Stack gap={36} className = "min-h-screen w-full p-[40px] px-[80px]">
      {/* Top bar */}
      <Group justify="space-between" align="center">
        <Title order={2} className ="text-blue-6 text-[54px]">Sessions</Title>

        <Group gap="sm">
          {/* Edit / Done button */}
          <Button
            radius="xl"
            className = "bg-blue-6 text-white w-[200px] h-[56px] "
            fw = {700}
            leftSection={
              <Image
                src={pencilIcon}
                alt="Edit"
                width={18}
                height={18}
                style={{
                  filter:
                    "invert(100%) sepia(100%) saturate(0%) hue-rotate(180deg)",
                }}
              />
            }
            onClick={() => setEditMode((prev) => !prev)}
          >
            {editMode ? "Done" : "Edit"}
          </Button>

          {/* Create Session Dropdown */}
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Button size="lg" radius="xl" fw = {700} className = "bg-green-5 w-[200px] h-[56px]">
                <span className="flex items-center gap-2">

                  Create Session
                  <Image src={arrowDown} alt="Customized" width={16} height={16} />
                </span>
              </Button>
            </Menu.Target>

            <Menu.Dropdown className = "rounded-none">
              <Menu.Item
                leftSection={
                  <Image
                    src={pencilIcon}
                    alt="Standard"
                    width={16}
                    height={16}
                  />
                }
                onClick={openCreateSessionModal}
                className = "rounded-none text-blue-9"
              >
                Standard Session
              </Menu.Item>

              <Menu.Item
                leftSection={
                  <Image
                    src={pencilIcon}
                    alt="Customized"
                    width={16}
                    height={16}
                  />
                }
                className = "rounded-none text-blue-9"
                onClick={openCreateSessionModal}
              >
                Customized Session
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      {/* Current Sessions */}
      <Stack gap={12}>
        <span className="flex items-center gap-2 cursor-pointer" onClick={() => setShowCurrent(!showCurrent)}>
          <Title order={3} className="text-neutral-5">CURRENT SESSION</Title>
          <Image
            src={arrowRight}
            alt="arrow"
            className={`w-[13px] h-[13px] transition-transform duration-200 ${
              showCurrent ? 'rotate-90' : 'rotate-0'
            }`}
          />
        </span>

        {showCurrent && (
          <Group justify="flex-start" wrap="wrap" gap="md">
            {current.length > 0 ? (
              current.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  editMode={editMode}
                />
              ))
            ) : (
              <Text c="dimmed">No current session</Text>
            )}
          </Group>
        )}

      </Stack>

      {/* Non-Current Sessions */}
      <Stack gap={12}>
        {/* Header with toggle */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setShowNonCurrent(!showNonCurrent)}
        >
          <Title order={3} className="text-neutral-5">
            NON-CURRENT SESSION
          </Title>
          <Image
            src={arrowRight}
            alt="arrow"
            className={`w-[13px] h-[13px] transition-transform duration-200 ${
              showNonCurrent ? "rotate-90" : "rotate-0"
            }`}
          />
        </div>

        {/* Collapsible content */}
        {showNonCurrent && (
          <Stack gap={6}>
            {/* Future sessions */}
            <Stack gap={4}>
              <Title order={4} className = "text-neutral-5 font-[22px] py-[10px]">FUTURE SESSIONS</Title>
              <Group justify="flex-start" wrap="wrap" gap="md">
                {future.length > 0 ? (
                  future.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      editMode={editMode}
                    />
                  ))
                ) : (
                  <Text c="dimmed">No future sessions</Text>
                )}
              </Group>
            </Stack>

            {/* Past sessions */}
            <Stack gap={4}>
              <Title order={4} className = "text-neutral-5 font-[22px] py-[10px]">PAST SESSIONS</Title>
              <Group justify="flex-start" wrap="wrap" gap="md">
                {past.length > 0 ? (
                  past.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      editMode={editMode}
                    />
                  ))
                ) : (
                  <Text c="dimmed">No past sessions</Text>
                )}
              </Group>
            </Stack>
          </Stack>
        )}
      </Stack>

    </Stack>
  );
}
