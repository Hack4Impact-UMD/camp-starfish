import { DatePicker } from "@mantine/dates";

const DatePickerThemeExtension = DatePicker.extend({
  classNames: {
    datePickerRoot: 'border-2 border-blue-9',
    calendarHeaderLevel: "text-sm font-bold text-blue-9 font-Lato",
    weekday: "text-neutral-5 font-semibold font-Lato text-sm border-none",
    day: "text-sm h-9 text-blue-9 font-normal font-Lato p-2 rounded-none data-disabled:text-neutral-4 data-outside:text-neutral-5 data-selected:bg-neutral-8 data-selected:text-neutral-0",
  },
  defaultProps: {
    firstDayOfWeek: 0,
    withCellSpacing: false
  }
});

export default DatePickerThemeExtension;