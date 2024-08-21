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

export const fullAvailability: weeklyAvailability = {
  monday: {
    morning: true,
    afternoon: true,
    evening: true,
  },
  tuesday: {
    morning: true,
    afternoon: true,
    evening: true,
  },
  wednesday: {
    morning: true,
    afternoon: true,
    evening: true,
  },
  thursday: {
    morning: true,
    afternoon: true,
    evening: true,
  },
  friday: {
    morning: true,
    afternoon: true,
    evening: true,
  },
  saturday: {
    morning: true,
    afternoon: true,
    evening: true,
  },
  sunday: {
    morning: true,
    afternoon: true,
    evening: true,
  },
};

export const emptyAvailability: weeklyAvailability = {
  monday: {
    morning: false,
    afternoon: false,
    evening: false,
  },
  tuesday: {
    morning: false,
    afternoon: false,
    evening: false,
  },
  wednesday: {
    morning: false,
    afternoon: false,
    evening: false,
  },
  thursday: {
    morning: false,
    afternoon: false,
    evening: false,
  },
  friday: {
    morning: false,
    afternoon: false,
    evening: false,
  },
  saturday: {
    morning: false,
    afternoon: false,
    evening: false,
  },
  sunday: {
    morning: false,
    afternoon: false,
    evening: false,
  },
};

export const weeklyAvailabilityArray: Array<keyof weeklyAvailability> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const dailyPeriodsArray: Array<keyof dailyAvailability> = [
  "morning",
  "afternoon",
  "evening",
];
