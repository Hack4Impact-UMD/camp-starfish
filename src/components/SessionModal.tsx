import React, { useState } from 'react';
import { DatePicker, DatesRangeValue } from '@mantine/dates';
import { Button, TextInput, Stack, Group, Text } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

interface DateRangeGeneratorProps {
  onSubmit: (sessionName: string, startDate: Date | null, endDate: Date | null) => void;
  onCancel?: () => void;
}

export default function DateRangeGenerator({ onSubmit, onCancel }: DateRangeGeneratorProps) {
  const [sessionName, setSessionName] = useState('');
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);

  const handleGenerate = () => {
    const startDate = dateRange[0] ? new Date(dateRange[0]) : null;
    const endDate = dateRange[1] ? new Date(dateRange[1]) : null;
    onSubmit(sessionName, startDate, endDate);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const formatDateRangeText = () => {
    if (dateRange[0] && dateRange[1]) {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      const start = dateRange[0].toLocaleString('en-US', options);
      const end = dateRange[1].toLocaleString('en-US', options);
      return `Selecting ${start} - ${end}`;
    }
    return '';
  };

  return (
    <div style={{ 
      backgroundColor: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      maxWidth: '600px',
      margin: '40px auto',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#0c4a6e',
        padding: '20px 40px',
        color: '#fff',
      }}>
        <Text size="xl" fw={700} style={{ letterSpacing: '0.5px' }}>
          CREATE SESSION
        </Text>
      </div>

      {/* Content */}
      <div style={{ padding: '40px' }}>
        <Stack gap="xl">
          {/* Session Name Input */}
          <div>
            <Text size="lg" fw={700} style={{ marginBottom: '12px', color: '#000' }}>
              Enter Session Name:
            </Text>
            <TextInput
              placeholder="enter session name here"
              value={sessionName}
              onChange={(e) => setSessionName(e.currentTarget.value)}
              styles={{
                input: {
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#6b7280',
                  '&::placeholder': {
                    color: '#9ca3af',
                  },
                },
              }}
            />
          </div>

          {/* Date Range Picker */}
          <div>
            <Text size="lg" fw={700} style={{ marginBottom: '12px', color: '#000' }}>
              Select Session Dates:
            </Text>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ maxWidth: '350px' }}>
                <DatePicker
                  type="range"
                  value={dateRange}
                  onChange={setDateRange}
                  numberOfColumns={1}
                  size="md"
                  styles={{
                    calendarHeader: {
                      maxWidth: 'none',
                    },
                    calendarHeaderControl: {
                      color: '#000',
                    },
                    monthCell: {
                      color: '#000',
                    },
                    day: {
                      color: '#000',
                      fontSize: '16px',
                      height: '40px',
                      '&[data-selected]': {
                        backgroundColor: '#0c4a6e',
                        color: '#fff',
                      },
                      '&[data-in-range]': {
                        backgroundColor: '#e0f2fe',
                        color: '#000',
                      },
                    },
                    month: {
                      width: '100%',
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Selected Range Text */}
          {formatDateRangeText() && (
            <Text size="sm" style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', marginTop: '-12px' }}>
              {formatDateRangeText()}
            </Text>
          )}

          {/* Action Buttons */}
          <Group justify="flex-end" gap="md" style={{ marginTop: '20px' }}>
            <Button
              onClick={handleCancel}
              variant="default"
              styles={{
                root: {
                  backgroundColor: '#d1d5db',
                  color: '#000',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '10px 32px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  '&:hover': {
                    backgroundColor: '#9ca3af',
                  },
                },
              }}
            >
              CANCEL
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!sessionName || !dateRange[0] || !dateRange[1]}
              styles={{
                root: {
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '10px 32px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  '&:hover': {
                    backgroundColor: '#059669',
                  },
                  '&:disabled': {
                    backgroundColor: '#d1d5db',
                    color: '#9ca3af',
                  },
                },
              }}
            >
              GENERATE
            </Button>
          </Group>
        </Stack>
      </div>
    </div>
  );
}