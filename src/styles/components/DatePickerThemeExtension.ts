import { DatePicker } from "@mantine/dates";

const DatePickerThemeExtension = DatePicker.extend({
  classNames: {
    datePickerRoot: 'border-2 border-blue-9',
    calendarHeaderLevel: "text-sm font-bold text-blue-9 font-Lato",
    weekday: "text-neutral-5 font-semibold font-Lato text-sm border-none",
    day: "text-sm h-9 text-blue-9 font-normal font-Lato p-2 not-data-in-range:hover:rounded-sm data-disabled:text-neutral-4 data-outside:text-neutral-5 data-selected:bg-neutral-8 data-selected:text-neutral-0 data-first-in-range:rounded-s-sm data-last-in-range:rounded-e-sm",
  },
  defaultProps: {
    firstDayOfWeek: 0,
    withCellSpacing: false
  }
});

export default DatePickerThemeExtension;