import { fireEvent, waitFor } from "@testing-library/react-native";

import AvailabilityView from "../../../components/inputs/AvailabilityView";
import { DailyPeriods, Weekdays } from "../../../models/availability";
import { emptyAvailability as initialAvailability } from "../../../models/availability";
import { render } from "../../../render";

describe("AvailabilityView", () => {
  const mockSetAvailability = jest.fn();

  it("renders without crashing", () => {
    render(
      <AvailabilityView
        availability={initialAvailability}
        setAvailability={mockSetAvailability}
      />,
      {}
    );
  });

  it("displays the correct weekdays and periods", () => {
    const { getByText } = render(
      <AvailabilityView
        availability={initialAvailability}
        setAvailability={mockSetAvailability}
      />,
      {}
    );
    const weekdays = Object.values(Weekdays).filter((key) =>
      isNaN(Number(key))
    );
    const periods = Object.values(DailyPeriods).filter((key) =>
      isNaN(Number(key))
    );

    weekdays.forEach((weekday) => {
      expect(
        getByText(weekday.charAt(0).toUpperCase() + weekday.slice(1, 3))
      ).toBeTruthy();
    });

    periods.forEach((period) => {
      expect(
        getByText(period.charAt(0).toUpperCase() + period.slice(1))
      ).toBeTruthy();
    });
  });

  it("calls onChange with the correct arguments when a period is added", async () => {
    const { getByTestId } = render(
      <AvailabilityView
        availability={initialAvailability}
        setAvailability={mockSetAvailability}
      />,
      {}
    );
    const periodElement = getByTestId("availability-item-saturday-morning"); // You might need to add data-testid attributes to your period elements

    fireEvent.press(periodElement);

    expect(mockSetAvailability).toHaveBeenCalledWith({
      friday: {
        afternoon: false,
        evening: false,
        morning: false
      },
      monday: {
        afternoon: false,
        evening: false,
        morning: false
      },
      saturday: {
        afternoon: false,
        evening: false,
        morning: true
      },
      sunday: {
        afternoon: false,
        evening: false,
        morning: false
      },
      thursday: {
        afternoon: false,
        evening: false,
        morning: false
      },
      tuesday: {
        afternoon: false,
        evening: false,
        morning: false
      },
      wednesday: {
        afternoon: false,
        evening: false,
        morning: false
      }
    });
  });

  it("calls onChange with the correct arguments when a period is removed", async () => {
    const { getByTestId } = render(
      <AvailabilityView
        availability={initialAvailability}
        setAvailability={mockSetAvailability}
      />,
      {}
    );
    const periodElement = getByTestId(
      "availability-item-checked-saturday-morning"
    ); // You might need to add data-testid attributes to your period elements

    fireEvent.press(periodElement);

    expect(mockSetAvailability).toHaveBeenCalledWith({
      friday: {
        afternoon: false,
        evening: false,
        morning: false
      },
      monday: {
        afternoon: false,
        evening: false,
        morning: false
      },
      saturday: {
        afternoon: false,
        evening: false,
        morning: false
      },
      sunday: {
        afternoon: false,
        evening: false,
        morning: false
      },
      thursday: {
        afternoon: false,
        evening: false,
        morning: false
      },
      tuesday: {
        afternoon: false,
        evening: false,
        morning: false
      },
      wednesday: {
        afternoon: false,
        evening: false,
        morning: false
      }
    });
  });
  it("does not call onChange when setAvailability is not provided", async () => {
    const { getByTestId, queryByTestId } = render(
      <AvailabilityView availability={initialAvailability} />,
      {}
    );
    const periodElement = getByTestId("availability-item-saturday-morning");

    fireEvent.press(periodElement);

    expect(periodElement).toBeDefined();
    await waitFor(() => {
      expect(
        queryByTestId("availability-item-checked-saturday-morning")
      ).toBeNull();
    });
  });
});
