"use client";
import moment, { Moment } from "moment";
import { CalanderView } from "@/components/CalanderView";
import { Box, Text, Title } from "@mantine/core";
import { Flex } from "@mantine/core";
import { Container } from "@mantine/core";

export default function Page() {
  const sessionStartDate = moment("12-1-2025");
  const sessionEndDate = moment("12-11-2025");

  function isSameMonth(start: Moment, end: Moment) {
    return start.isSame(end, "month"); 
  }
  return (
    <div>
      Test Page
      <Container fluid m={"sm"}>
        <Box m={"sm"}>
          <Flex dir="row" align={"center"} gap={"md"}>
            <Title order={1} fw={800}>
              Session A
            </Title>
            {isSameMonth(sessionStartDate, sessionEndDate) ? (
              <Text size="sm">
                {sessionStartDate.format("MMMM")} {sessionStartDate.year()}
              </Text>
            ) : (
              <Text size="sm">
                {sessionStartDate.format("MMMM")} -{" "}
                {sessionEndDate.format("MMMM")} {sessionStartDate.year()}
              </Text>
            )}
          </Flex>
        </Box>

        <CalanderView
          sessionStartDate={sessionStartDate}
          sessionEndDate={sessionEndDate}
        />
      </Container>
    </div>
  );
}
