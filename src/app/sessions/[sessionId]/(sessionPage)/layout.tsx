"use client";

import { Flex, Title, Text, Button } from "@mantine/core";
import useSession from "@/hooks/sessions/useSession";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import { Params } from "next/dist/server/request/params";

export type SessionLayoutProps = { 
  children: React.ReactNode;
};

interface SessionRouteParams extends Params {
  sessionId: string;
}

export default function SessionLayout({ children }: SessionLayoutProps) {
  const { sessionId } = useParams<SessionRouteParams>();
  const { data: session, status } = useSession(sessionId);
  const router = useRouter();

  if (status === "pending") return <p>Loading...</p>;
  if (status === "error") return <p>Error loading session data</p>;

  const start = moment(session?.startDate);
  const end = moment(session?.endDate);

  const handleGenerate = () => {
    // Replace "/generate-page" with your desired route
    router.push(`/activity-grid`);
  };

  return (
    <div className="w-full flex">
      <Flex className="flex flex-col gap-5 w-full py-[50px] justify-between">
        <Flex className="flex-row items-center w-full justify-between">
          <div className = "flex flex-col">
            <Title order={1} className="m-0">{session?.name}</Title>
            <Text className="text-lg text-neutral-5 font-semibold">
              {start.format("MMMM YYYY")}
              {!start.isSame(end, "month") && ` - ${end.format("MMMM YYYY")}`}
            </Text>
          </div>

          <Button onClick={handleGenerate} color="green">
            Generate
          </Button>
        </Flex>

        {children}
      </Flex>
    </div>
  );
}
