import { SessionID } from "@/types/sessionTypes";
import { useState } from "react";
import { Container, Flex, Title, Text, Button } from "@mantine/core";
import Image from "next/image";
import uploadIcon from "../../../assets/icons/uploadIcon.svg";
import viewIcon from "../../../assets/icons/viewIcon.svg";

import underline from "../../../assets/underline.svg";
import moment from "moment";
import SessionCalendar from "./SessionCalendar";

interface SessionPageProps {
  session: SessionID;
}

export default function SessionPage(props: SessionPageProps) {
  const { session } = props;
  const [isEnabled, setIsEnabled] = useState(false);


  const sessionStartDate = moment(session.startDate);
  const sessionEndDate = moment(session.endDate);

  return (
    <Container className = "w-full min-h-screen">
      <Flex className="flex-col h-full w-full flex justify-center ">
        <Flex className="flex flex-row w-full justify-between items-center">
          <span className = "flex flex-row items-center gap-[12px]">

            <span>
                <Title
                  className="font-black m-0 text-blue-6 text-[40px]"
                >
                  {session.name}
                </Title>
                <Image
                  src={underline}
                  alt=""
                  width={166}
                  height={12}
                />

                {/* underline */}

            </span>

            <Text className=" text-neutral-5 font-semibold text-[24px]">
              {sessionStartDate.format("MMMM YYYY")}
              {sessionStartDate.isSame(sessionEndDate, "month")
                ? ""
                : `-${sessionEndDate.format("MMMM YYYY")}`}
            </Text>

          </span>

          <span className = "flex flex-row items-center gap-[12px]">
            <Button
              disabled={!isEnabled}              
              className="w-[170px] h-[48px] p-0 text-white bg-green-5 disabled:bg-neutral-4"
              radius={40}
            >
              <span className="flex items-center ">
                <Text size="sm" fw={700}>
                  GENERATE
                </Text>


              </span>
            </Button>

            <Button
              disabled={!isEnabled}              
              className=" w-[48px] h-[48px] p-0 bg-aqua-5 disabled:bg-neutral-4 "
            >
                <Image
                  src={viewIcon}
                  alt=""
                  width={24}
                  height={24}
                />
            </Button>

            <Button

              className="bg-blue-6 w-[48px] h-[48px] p-0"
            >
                <Image
                  src={uploadIcon}
                  alt=""
                  width={24}
                  height={24}

                />
            </Button>
          </span>

        </Flex>

        <Text className = "text-neutral-5 font-lato italic mt-[20px]">Last Generated: N/A</Text>

        <Flex className="flex w-full justify-center mb-[20px]">
          <Text className = "text-neutral-5 font-lato italic">Please select  dates to edit session calendar. </Text>
        </Flex>
        <SessionCalendar session={session} />
      </Flex>
    </Container>
  );
}
