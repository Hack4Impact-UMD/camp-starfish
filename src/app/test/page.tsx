"use client";
import moment, { Moment } from "moment";
import { CalendarView } from "@/components/CalendarView";
import { Box, Text, Title } from "@mantine/core";
import { Flex } from "@mantine/core";
import { Container } from "@mantine/core";
import Underline from "@/assets/underline.svg";
import useCreateSession from "@/components/useSession";
import Image from "next/image";

export default function Page() {
  const { session, isLoading, error } = useCreateSession("session1"); //hardcoded sessionid, need to accept one from 

  if (isLoading) {
    return <p>Loading session data...</p>;
  }

  if (error) {
    return <p>Error loading session data</p>;
  }

  const sessionStartDate = moment(session?.startDate);
  const sessionEndDate = moment(session?.endDate);

  function isSameMonth(start: Moment, end: Moment) {
    return start.isSame(end, "month");
  }
  return (
    <Container>
      <Flex direction="column">
        <Box mb={"xl"}>
          <Flex dir="row" align={"baseline"} gap={"lg"}>
            <Flex direction="column" align="flex-start">
              <Box style={{ display: "inline-block" }}>
                <Title order={1} fw={800}>
                  Session A
                </Title>
                <Box mt={4} style={{ width: "100%" }}>
                  <Image
                    src={Underline}
                    alt="Underline"
                    layout="responsive"
                    width={100}
                  />
                </Box>
              </Box>
            </Flex>

            {isSameMonth(sessionStartDate, sessionEndDate) ? (
              <Text size="lg" c={"neutral.5"} fw={400}>
                {sessionStartDate.format("MMMM")} {sessionStartDate.year()}
              </Text>
            ) : (
              <Text size="lg" c={"neutral.5"} fw={400}>
                {sessionStartDate.format("MMMM")} -{" "}
                {sessionEndDate.format("MMMM")} {sessionStartDate.year()}
              </Text>
            )}
          </Flex>
        </Box>

        <Box mt={"xl"}>
          <CalendarView
            sessionStartDate={sessionStartDate}
            sessionEndDate={sessionEndDate}
          />
        </Box>
      </Flex>
    </Container>
  );
}
