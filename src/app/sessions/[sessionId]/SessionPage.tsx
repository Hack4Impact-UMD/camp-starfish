import { SessionID } from "@/types/sessionTypes";
import { Container, Flex, Title, Text } from "@mantine/core";
import moment from "moment";
import CalendarView from "./SessionCalendar";

interface SessionPageProps {
  session: SessionID;
}

export default function SessionPage(props: SessionPageProps) {
  const { session } = props;

  const sessionStartDate = moment(session.startDate);
  const sessionEndDate = moment(session.endDate);

  return (
    <Container>
      <Flex className="flex-col gap-5">
        <Flex className="flex-row items-center gap-lg border-red-500">
          <Title
            order={1}
            className="font-black bg-none cursor-pointer hover:bg-[url(../assets/underline.svg)] hover:bg-no-repeat hover:bg-bottom hover:bg-contain"
          >
            {session.name}
          </Title>
          <Text className="text-lg text-neutral-5 font-semibold">
            {sessionStartDate.format("MMMM YYYY")}
            {sessionStartDate.isSame(sessionEndDate, "month")
              ? ""
              : `-${sessionEndDate.format("MMMM YYYY")}`}
          </Text>
        </Flex>
        <CalendarView session={session} />
      </Flex>
    </Container>
  );
}
