import { Dayjs } from "dayjs";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface CalendarProps {
  mode?: "single" | "range" | "multiple";
  selected?: Date | DateRange | Date[];
  onSelect?: (date: Date | DateRange | Date[] | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  numberOfMonths?: number;
  defaultMonth?: Date;
}
