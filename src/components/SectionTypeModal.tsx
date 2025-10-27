import { useState } from "react";
import { Button, Group, Radio, TextInput, Title, Stack, Box, Text, ActionIcon } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import moment from "moment";

interface ChooseSectionTypeProps {
  selectedDate: Date;
  onSubmit: (data: {
    startDate: Date | null;
    endDate: Date | null;
    scheduleType: string;
    name: string;
  }) => void;
  onDelete?: () => void;
  onClose?: () => void;
}

const CALENDAR_STYLES = {
  calendarHeaderControl: {
    width: 28,
    height: 28,
    fontSize: 14,
  },
  calendarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 8,
  },
  calendarHeaderLevel: {
    fontWeight: 600,
    fontSize: "15px",
    textAlign: "center" as const,
    flex: 1,
  },
  day: {
    fontVariantNumeric: "tabular-nums",
    fontFeatureSettings: "'tnum' 1",
    fontFamily: "Inter, sans-serif",
    width: 32,
    height: 32,
    lineHeight: "32px",
    textAlign: "center" as const,
  },
};

export function ChooseSectionType({ selectedDate, onSubmit, onDelete, onClose }: ChooseSectionTypeProps) {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate);
  const [startDate, setStartDate] = useState<Date | null>(selectedDate);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [scheduleType, setScheduleType] = useState("Bundle");
  const [name, setName] = useState("");

  // Format date as "Day of the week, Month Day, Year"
  const formatDate = (date: Date) => {
    return moment(date).format('dddd, MMMM D, YYYY');
  };

  // Format date as "Day, Mon DD" (e.g., "Mon, Aug 11")
  const formatStartDate = (date: Date) => {
    return moment(date).format('ddd, MMM D');
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
      bg="white"
      style={{
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        maxWidth: 400,
        margin: "auto",
        position: "relative",
      }}
    >
      <ActionIcon
        variant="subtle"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          color: "#1e3a5f",
        }}
      >
        <X size={24} strokeWidth={3} />
      </ActionIcon>
      
      <Title order={2} ta="center" mb="md" style={{ color: "#1e3a5f" }}>
        Choose Section Type
      </Title>

      <Group justify="center" mb="lg" gap="md">
        <ActionIcon
          variant="subtle"
          color="dark"
          onClick={decrementDate}
          aria-label="Previous day"
        >
          <ChevronLeft size={28} strokeWidth={3} />
        </ActionIcon>
        <Text ta="center" fw={500}>
          {formatDate(currentDate)}
        </Text>
        <ActionIcon
          variant="subtle"
          color="dark"
          onClick={incrementDate}
          aria-label="Next day"
        >
          <ChevronRight size={28} strokeWidth={3} />
        </ActionIcon>
      </Group>

      <Stack gap="md">
        {/* Date fields */}
        <Box>
          <Text fw={500} mb={4}>
            Date(s)
          </Text>
          <Group>
            <TextInput
              value={startDate ? formatStartDate(startDate) : ''}
              readOnly
              radius="md"
              size="sm"
              w={140}
              styles={{ // TODO remove override
                input: {
                  backgroundColor: 'hsla(206, 67%, 89%, 1.00)',
                  cursor: 'default',
                  border: 'none',
                }
              }}
            />
            <Text fw={500}>to</Text>
            <DatePickerInput
              placeholder="End date"
              value={endDate ? new Date(endDate.getTime() + 86400000) : null}
              onChange={handleEndDateChange}
              valueFormat="ddd, MMM D"
              radius="md"
              size="sm"
              w={140}
              previousIcon={<ChevronLeft size={16} />}
              nextIcon={<ChevronRight size={16} />}
              styles={{
                input: { // TODO remove override
                  backgroundColor: 'hsla(206, 67%, 89%, 1.00)',
                  border: 'none',
                },
                ...CALENDAR_STYLES,
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
              <Radio 
                value="Bunk Jamboree" 
                label="Bunk Jamboree"
                styles={{
                  radio: {
                    width: 16,
                    height: 16,
                    marginTop: 2,
                    '&:checked': {
                      backgroundColor: 'var(--mantine-color-blue-filled)',
                      borderColor: 'var(--mantine-color-blue-filled)',
                    }
                  },
                  icon: { display: 'none' }
                }}
              />
              <Radio 
                value="Non-Bunk Jamboree" 
                label="Non-Bunk Jamboree"
                styles={{
                  radio: {
                    width: 16,
                    height: 16,
                    marginTop: 2,
                    '&:checked': {
                      backgroundColor: 'var(--mantine-color-blue-filled)',
                      borderColor: 'var(--mantine-color-blue-filled)',
                    }
                  },
                  icon: { display: 'none' }
                }}
              />
              <Radio 
                value="Bundle" 
                label="Bundle"
                styles={{
                  radio: {
                    width: 16,
                    height: 16,
                    marginTop: 2,
                    '&:checked': {
                      backgroundColor: 'var(--mantine-color-blue-filled)',
                      borderColor: 'var(--mantine-color-blue-filled)',
                    }
                  },
                  icon: { display: 'none' }
                }}
              />
              <Radio 
                value="Non-Scheduling" 
                label="Non-Scheduling"
                styles={{
                  radio: {
                    width: 16,
                    height: 16,
                    marginTop: 2,
                    '&:checked': {
                      backgroundColor: 'var(--mantine-color-blue-filled)',
                      borderColor: 'var(--mantine-color-blue-filled)',
                    }
                  },
                  icon: { display: 'none' }
                }}
              />
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
            radius="md"
            size="sm"
            w={290}
            styles={{
              input: {
                backgroundColor: 'hsla(206, 67%, 89%, 1.00)',
                border: 'none',
              }
            }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.currentTarget.value)}
          />
        </Box>

        <Group justify="space-between" gap="md" mt="md">
          <Button
            onClick={onDelete}
            radius="xl"
            size="sm"
            style={{
              flex: 1,
              backgroundColor: "#dc2626",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Delete
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !startDate}
            radius="xl"
            size="sm"
            style={{
              flex: 1,
              backgroundColor: "#1e3a5f",
              color: "white",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Done
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
