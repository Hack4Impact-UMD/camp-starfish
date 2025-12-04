"use client";

import { Flex, Title, Text } from "@mantine/core";
import useSession from "@/hooks/sessions/useSession";
import moment from "moment";
import { useParams } from "next/navigation";
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

  if (status === "pending") return <p>Loading...</p>;
  if (status === "error") return <p>Error loading session data</p>;

  const start = moment(session?.startDate);
  const end = moment(session?.endDate);

  return (

      <div className="w-full flex  ">
        <Flex className="flex flex-col gap-5 w-full align-center px-[100px] py-[50px] justify-center">
          <Flex className="flex-row items-end gap-lg">
            <Title order={1} className = "m-[0px]">{session?.name}</Title>
            <Text className="text-lg text-neutral-5 font-semibold">
              {start.format("MMMM YYYY")}
              {!start.isSame(end, "month") && ` - ${end.format("MMMM YYYY")}`}
            </Text>
          </Flex>

          {children}
        </Flex>
      </div>

  );
}
