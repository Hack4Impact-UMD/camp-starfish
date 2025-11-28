import React, { useState } from 'react';
import { DatePicker, DatesRangeValue } from '@mantine/dates';
import { Button, TextInput, Stack, Group, Text } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import moment from 'moment';
import { Session } from '@/types/sessionTypes';

interface DateRangeGeneratorProps {
  onSubmit: (newSession: Session) => void;
  onCancel?: () => void;
}

export default function CreateSessionModal({ onSubmit, onCancel }: DateRangeGeneratorProps) {
  const [sessionName, setSessionName] = useState('');
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);

  const handleGenerate = () => {
    const [startDateStr, endDateStr] = dateRange;

    if (sessionName.trim() === '') {
      throw new Error('Please enter a session name.');
    }

    if (!startDateStr || !endDateStr) {
      throw new Error('Please select a start and end date.');
    }

    const newSession: Session = {
      name: sessionName,
      startDate: moment(startDateStr).toISOString(),
      endDate: moment(endDateStr).toISOString(),
      driveFolderId: '',
    };

    onSubmit(newSession);
  };

  const formatDateRangeText = () => {
    const [startDateStr, endDateStr] = dateRange;
    
    if (startDateStr && endDateStr) {
      const start = moment(startDateStr).format('MMM D');
      const end = moment(endDateStr).format('MMM D');
      return `Selecting ${start} - ${end}`;
    }
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md max-w-[600px] mx-auto mt-10 overflow-hidden">
      {/* Header */}
      <div className="bg-[#0c4a6e] px-10 py-6 text-white">
        <Text size="xl" fw={700} className="tracking-wide">
          CREATE SESSION
        </Text>
      </div>

      {/* Content */}
      <div className="p-10">
        <Stack gap="xl">
          {/* Session Name */}
          <div className = "flex flex-row gap-[5px]">
            <Text size="lg" fw={700} className="mb-3 text-black">
              Enter Session Name:
            </Text>
            <TextInput
              placeholder="Enter session name here"
              value={sessionName}
              onChange={(e) => setSessionName(e.currentTarget.value)}
              className='w-[50%]'
            />
          </div>

          {/* Date Picker */}
          <div>
            <div className="flex flex-row items-center gap-[5px]">
            <Text size="lg" fw={700} className=" text-black">
              Select Session Dates:
            </Text>

            <TextInput
              placeholder="Start Date"
              className="w-[25%]"
              disabled
            />

            <Text>To</Text>

            <TextInput
              placeholder="End Date"
              className="w-[25%] placeholder:text-neutral-400"
              disabled
            />
          </div>

            
            <div className="flex justify-center">
              <div className="max-w-[350px]">
                <DatePicker
                  type="range"
                  value={dateRange}
                  onChange={setDateRange}
                  numberOfColumns={1}
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Selected Range Text */}
          {formatDateRangeText() && (
            <Text className="text-gray-500 italic text-center -mt-3">
              {formatDateRangeText()}
            </Text>
          )}

          {/* Buttons */}
          <Group justify="center" gap="md" className="mt-5">
            <Button color="neutral.3" c="neutral.9" onClick={onCancel}>
              CANCEL
            </Button>

            <Button color="secondary-green.4" c="neutral.0" onClick={handleGenerate}>
              GENERATE
            </Button>
          </Group>
        </Stack>
      </div>
    </div>
  );
}