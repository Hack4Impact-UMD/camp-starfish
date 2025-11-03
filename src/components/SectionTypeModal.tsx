import { useState } from "react";
import { Button, Group, Radio, TextInput, Title, Stack, Box, Text, ActionIcon } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import moment from "moment";

/**
 * Props for the ChooseSectionType modal component
 * Handles section configuration including dates, type, and name
 */
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

export function ChooseSectionType({ selectedDate, onSubmit, onDelete, onClose }: ChooseSectionTypeProps) {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate); // Header date
  const [startDate, setStartDate] = useState<Date | null>(selectedDate);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [scheduleType, setScheduleType] = useState("Bundle");
  const [name, setName] = useState("");

  // Current date format - "Wednesday, October 29, 2025"
  const formatDate = (date: Date) => {
    return moment(date).format('dddd, MMMM D, YYYY');
  };

  const handleStartDateChange = (value: string | null) => {
    const newDate = value ? new Date(value) : null;
    setStartDate(newDate);
    if (newDate) {
      setCurrentDate(newDate); // Updates header date
    }
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
      bd="2px solid #002D45"
      style={{
        borderRadius: 8,
        maxWidth: 400,
        margin: "auto",
        position: "relative",
      }}
    >
      {/* Close button (X) in top left corner */}
      <ActionIcon
        variant="subtle"
        onClick={onClose}
        aria-label="Close"
        c="primary.5"
        pos="absolute"
        top={16}
        left={16}
      >
        <X size={24} strokeWidth={3} />
      </ActionIcon>
      
      {/* Modal title */}
      <Title order={2} ta="center" mb="md" c="primary.5">
        Choose Section Type
      </Title>

      {/* Current Date */}
      <Group justify="center" mb="lg" gap="md">
        <Text ta="center" fw={500}>
          {formatDate(currentDate)}
        </Text>
      </Group>

      <Stack gap="md">
        {/* Date range selection (start date to end date) */}
        <Box>
          <Text fw={500} mb={4}>
            Date(s)
          </Text>
          <Group>
            {/* Start date (user selectable via calendar) */}
            <DatePickerInput
              placeholder="Start date"
              value={startDate}
              onChange={handleStartDateChange}
              valueFormat="ddd, MMM D"
              radius="md"
              size="sm"
              w={140}
            />
            <Text fw={500}>to</Text>
            {/* End date (user selectable via calendar) */}
            <DatePickerInput
              placeholder="End date"
              value={endDate} //  ? new Date(endDate.getTime() + 86400000) : null
              onChange={handleEndDateChange}
              valueFormat="ddd, MMM D"
              radius="md"
              size="sm"
              w={140}
            />
        </Group>
        </Box>

        {/* Schedule type radio selection */}
        <Box>
          <Text fw={500} mb={6}>
            Schedule Type
          </Text>
          <Radio.Group value={scheduleType} onChange={setScheduleType}>
            <Stack gap="xs">
              <Radio 
                value="Bunk Jamboree" 
                label="Bunk Jamboree"
              />
              <Radio 
                value="Non-Bunk Jamboree" 
                label="Non-Bunk Jamboree"
              />
              <Radio 
                value="Bundle" 
                label="Bundle"
              />
              <Radio 
                value="Non-Scheduling" 
                label="Non-Scheduling"
              />
            </Stack>
          </Radio.Group>
        </Box>

        {/* Name input field for section identifier */}
        <Box>
          <Text fw={500} mb={6}>
            Name
          </Text>
          <TextInput
            placeholder="e.g. Bundle 1"
            value={name}
            w={290}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.currentTarget.value)}
          />
        </Box>

        {/* Action buttons: Delete and Done */}
        <Group justify="space-between" gap="md" mt="md">
          <Button
            onClick={onDelete}
            bg="#dc2626"
            style={{ flex: .45 }}
          >
            Delete
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !startDate} // Disabled until name and startDate are provided
            bg="#1e3a5f"
              style={{ flex: .45 }}
          >
            Done
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
