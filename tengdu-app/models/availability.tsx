export enum Weekdays {
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
  SUNDAY = "Sunday"
}

export enum DailyPeriods {
  MORNING = "Morning",
  AFTERNOON = "Afternoon",
  EVENING = "Evening"
}

export interface dailyAvailability {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

export interface weeklyAvailability {
  monday: dailyAvailability;
  tuesday: dailyAvailability;
  wednesday: dailyAvailability;
  thursday: dailyAvailability;
  friday: dailyAvailability;
  saturday: dailyAvailability;
  sunday: dailyAvailability;
}

export const weeklyAvailabilityArray: Array<keyof weeklyAvailability> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];

export const dailyPeriodsArray: Array<keyof dailyAvailability> = [
  "morning",
  "afternoon",
  "evening"
];

export const emptyAvailability: weeklyAvailability = {
  monday: {
    morning: false,
    afternoon: false,
    evening: false
  },
  tuesday: {
    morning: false,
    afternoon: false,
    evening: false
  },
  wednesday: {
    morning: false,
    afternoon: false,
    evening: false
  },
  thursday: {
    morning: false,
    afternoon: false,
    evening: false
  },
  friday: {
    morning: false,
    afternoon: false,
    evening: false
  },
  saturday: {
    morning: false,
    afternoon: false,
    evening: false
  },
  sunday: {
    morning: false,
    afternoon: false,
    evening: false
  }
};
