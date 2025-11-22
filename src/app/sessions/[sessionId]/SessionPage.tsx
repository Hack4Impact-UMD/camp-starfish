import { SessionID } from "@/types/sessionTypes";
import { Container, Flex, Box, Title, Text } from "@mantine/core";
import Image from "next/image";
import Underline from "@/assets/underline.svg";
import moment, { Moment } from "moment";
import CalendarView from "@/components/CalendarView";

interface SessionPageProps {
  session: SessionID;
}

export default function SessionPage(props: SessionPageProps) {
  const { session } = props;

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
          <CalendarView session={session} />
        </Box>
      </Flex>
    </Container>
  );
}
