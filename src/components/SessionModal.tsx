import React, { useState } from 'react';
import { DatePicker, DatesRangeValue } from '@mantine/dates';
import { Button, TextInput, Stack, Group, Text } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import moment from 'moment';
import { datePickerGlobalStyles } from '@/styles/theme';

interface DateRangeGeneratorProps {
  onSubmit: (sessionName: string, startDate: moment.Moment | null, endDate: moment.Moment | null) => void;
  onCancel?: () => void;
}

// Button style configurations based on variant
const getButtonStyles = (variant: 'cancel' | 'generate') => {
  const baseStyles = {
    root: {
      borderRadius: 'var(--mantine-radius-xl)',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      padding: '10px 32px',
      fontSize: '14px',
      border: 'none',
    },
  };

  if (variant === 'cancel') {
    return {
      root: {
        ...baseStyles.root,
        backgroundColor: 'var(--mantine-color-neutral-3)',
        color: 'var(--mantine-color-neutral-9)',
        '&:hover': {
          backgroundColor: 'var(--mantine-color-neutral-4)',
        },
      },
    };
  }

  if (variant === 'generate') {
    return {
      root: {
        ...baseStyles.root,
        backgroundColor: 'var(--mantine-color-secondary-green-4)',
        color: 'white',
        '&:hover': {
          backgroundColor: 'var(--mantine-color-secondary-green-5)',
        },
        '&:disabled': {
          backgroundColor: 'var(--mantine-color-neutral-3)',
          color: 'var(--mantine-color-neutral-4)',
        },
      },
    };
  }

  return baseStyles;
};

export default function CreateSession({ onSubmit, onCancel }: DateRangeGeneratorProps) {
  const [sessionName, setSessionName] = useState('');
  const [dateRange, setDateRange] = useState<DatesRangeValue>([null, null]);

  const handleGenerate = () => {
    const startDate = dateRange[0] ? moment(dateRange[0]) : null;
    const endDate = dateRange[1] ? moment(dateRange[1]) : null;
    onSubmit(sessionName, startDate, endDate);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const formatDateRangeText = () => {
    if (dateRange[0] && dateRange[1]) {
      const start = moment(dateRange[0]).format('MMM D');
      const end = moment(dateRange[1]).format('MMM D');
      return `Selecting ${start} - ${end}`;
    }
    return '';
  };

  return (
    <>
      {/* Global styles for DatePicker data attributes */}
      <style dangerouslySetInnerHTML={{ __html: datePickerGlobalStyles }} />
      
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
            {/* Session Name Input - uses theme styles automatically */}
            <div>
              <Text size="lg" fw={700} style={{ marginBottom: '12px', color: '#000' }}>
                Enter Session Name:
              </Text>
              <TextInput
                placeholder="enter session name here"
                value={sessionName}
                onChange={(e) => setSessionName(e.currentTarget.value)}
              />
            </div>

            {/* Date Range Picker - uses theme styles automatically */}
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

            {/* Action Buttons - uses getButtonStyles helper */}
            <Group justify="flex-end" gap="md" style={{ marginTop: '20px' }}>
              <Button
                onClick={handleCancel}
                styles={getButtonStyles('cancel')}
              >
                CANCEL
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!sessionName || !dateRange[0] || !dateRange[1]}
                styles={getButtonStyles('generate')}
              >
                GENERATE
              </Button>
            </Group>
          </Stack>
        </div>
      </div>
    </>
  );
}