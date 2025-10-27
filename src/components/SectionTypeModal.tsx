import { useState } from "react";
import { Button, Group, Radio, TextInput, Title, Stack, Box, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChooseSectionTypeProps {
  selectedDate: Date;
  onSubmit: (data: {
    startDate: Date | null;
    endDate: Date | null;
    scheduleType: string;
    name: string;
  }) => void;
}

export function ChooseSectionType({ selectedDate, onSubmit }: ChooseSectionTypeProps) {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate);
  const [startDate, setStartDate] = useState<Date | null>(selectedDate);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [scheduleType, setScheduleType] = useState("Bundle");
  const [name, setName] = useState("");

  // Format date as "Day of the week, Month Day, Year"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date as "Day, Mon DD"
  const formatStartDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const decrementDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
    setStartDate(newDate);
  };

  const incrementDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
    setStartDate(newDate);
  };

  const handleEndDateChange = (value: string | null) => {
  setEndDate(value ? new Date(value) : null);
  };

  const handleSubmit = () => {
    onSubmit({ startDate, endDate, scheduleType, name });
  };

  return (
    <Box
      p="lg"
      style={{
        backgroundColor: "white",
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        maxWidth: 400,
        margin: "auto",
      }}
    >
      <Title order={2} ta="center" mb="md" c="blue.9" fw={700}>
        Choose Section Type
      </Title>

      <Group justify="center" mb="lg" gap="md">
        <Box
          onClick={decrementDate}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <ChevronLeft size={20} />
        </Box>
        <Text ta="center" fw={500}>
          {formatDate(currentDate)}
        </Text>
        <Box
          onClick={incrementDate}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <ChevronRight size={20} />
        </Box>
      </Group>

      <Stack gap="md">
        {/* Date fields */}
        <Box>
          <Text fw={500} mb={4}>
            Date(s)
          </Text>
          <Group grow>
            <TextInput
              value={startDate ? formatStartDate(startDate) : ''}
              readOnly
              styles={{
                input: {
                  backgroundColor: 'hsla(206, 67%, 89%, 1.00)',
                  cursor: 'default',
                }
              }}
            />
            <DatePickerInput
              placeholder="End date"
              value={endDate ? new Date(endDate.getTime() + 86400000) : null}
              onChange={handleEndDateChange}
              valueFormat="ddd, MMM D"
              previousIcon={<ChevronLeft size={16} />}
            nextIcon={
              <div style={{ paddingLeft: 16 }}>
                <ChevronRight size={16} />
              </div>
            }
            styles={{
              input: {
                backgroundColor: 'hsla(206, 67%, 89%, 1.00)',
              },
              // Control buttons (left/right arrows)
              calendarHeaderControl: {
                width: 28,
                height: 28,
                fontSize: 14,
              },
              // Header container for the arrows and month text
              calendarHeader: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: 8,
              },
              // Month + year text
              calendarHeaderLevel: {
                fontWeight: 600,
                fontSize: "15px",
                textAlign: "center",
                flex: 1,
              },
              day: {
                fontVariantNumeric: "tabular-nums",
                fontFeatureSettings: "'tnum' 1", // ensure alignment
                fontFamily: "Inter, sans-serif",
                width: 32, // fixed width cells for perfect grid alignment
                height: 32,
                lineHeight: "32px",
                textAlign: "center",
              },
            }}
          />
        </Group>
        </Box>

        {/* Schedule type */}
        <Box>
          <Text fw={500} mb={6}>
            Schedule Type
          </Text>
          <Radio.Group value={scheduleType} onChange={setScheduleType}>
            <Stack gap="xs">
              <Radio value="Bunk Jamboree" label="Bunk Jamboree" />
              <Radio value="Non-Bunk Jamboree" label="Non-Bunk Jamboree" />
              <Radio value="Bundle" label="Bundle" />
              <Radio value="Non-Scheduling" label="Non-Scheduling" />
            </Stack>
          </Radio.Group>
        </Box>

        {/* Name field */}
        <Box>
          <Text fw={500} mb={6}>
            Name
          </Text>
          <TextInput
            placeholder="e.g. Bundle 1"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.currentTarget.value)}
            styles={{
              input: {
                backgroundColor: 'hsla(206, 67%, 89%, 1.00)',
              }
            }}
          />
        </Box>

        <Button
          fullWidth
          radius="xl"
          color="gray"
          onClick={handleSubmit}
          disabled={!name || !startDate}
        >
          DONE!
        </Button>
      </Stack>
    </Box>
  );
}
