import "@testing-library/jest-native/extend-expect";
const mockResetPassword = jest.fn();

jest.mock("../../../providers/AuthProvider", () => {
  const originalModule = jest.requireActual("providers/AuthProvider");

  return {
    ...originalModule,
    useSession: jest.fn(() => ({
      user: null,
      loading: false,
      error: null,
      resetPassword: mockResetPassword
    }))
  };
});

import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import PasswordResetForm from "components/PasswordResetForm";
import { useSession } from "providers/AuthProvider";

import { renderWithAuth } from "../../../render";

describe("PasswordResetForm", () => {
  it("renders correctly", async () => {
    let getByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<PasswordResetForm />, {});
      getByTestId = result.getByTestId;
    });

    await waitFor(() =>
      expect(getByTestId("password-reset-form")).toBeDefined()
    );

    expect(getByTestId("Email-input")).toBeDefined();

    // Check if the button is in the document
    // Replace "Button Text" with the text of the button
    expect(getByTestId("reset-password-button")).toBeDefined();
  });

  it("calls resetPassword when the reset password button is pressed with a valid email", async () => {
    // Get the mock resetPassword function from the AuthProvider mock
    const { resetPassword } =
      require("../../../providers/AuthProvider").useSession();

    let getByTestId, debug;
    await waitFor(() => {
      const result = renderWithAuth(<PasswordResetForm />, {});
      getByTestId = result.getByTestId;
      debug = result.debug;
    });

    // Wait for the form to be in the document
    await waitFor(() =>
      expect(getByTestId("password-reset-form")).toBeDefined()
    );

    const email = "test@example.com";
    const emailInput = getByTestId("Email-input");
    fireEvent.changeText(emailInput, email);
    expect(emailInput.props.value).toBe(email);

    // Simulate a press event on the button
    fireEvent.press(getByTestId("reset-password-button"));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith(email);
    });
  });

  it("shows error 'Reset password failed' when no email is entered", async () => {
    // mockResetPassword.mockRejectedValue(
    //   new Error("Please enter an email address")
    // );

    let getByTestId, getByText;
    await waitFor(() => {
      const result = renderWithAuth(<PasswordResetForm />, {});
      getByTestId = result.getByTestId;
      getByText = result.getByText;
    });

    fireEvent.press(getByTestId("reset-password-button"));

    await waitFor(() =>
      expect(getByTestId("Email-error-message")).toHaveStyle({
        color: "#EE0B0B"
      })
    );
    expect(getByText("Please enter a valid email address")).toBeTruthy();
  });

  it("shows error message when resetPassword fails and email is entered", async () => {
    mockResetPassword.mockRejectedValue(new Error("Reset password failed"));

    let getByTestId, getByText;
    await waitFor(() => {
      const result = renderWithAuth(<PasswordResetForm />, {});
      getByTestId = result.getByTestId;
      getByText = result.getByText;
    });

    const email = "test@example.com";
    const emailInput = getByTestId("Email-input");
    fireEvent.changeText(emailInput, email);

    fireEvent.press(getByTestId("reset-password-button"));

    await waitFor(() =>
      expect(getByTestId("Email-error-message")).toHaveStyle({
        color: "#EE0B0B"
      })
    );
    expect(getByText("Reset password failed")).toBeTruthy();
  });

  it("hides error message when resetPassword succeeds and shows a success message", async () => {
    mockResetPassword.mockResolvedValue(undefined);

    let getByTestId, queryByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<PasswordResetForm />, {});
      getByTestId = result.getByTestId;
      queryByTestId = result.queryByTestId;
    });

    const email = "test@example.com";
    const emailInput = getByTestId("Email-input");
    fireEvent.changeText(emailInput, email);

    fireEvent.press(getByTestId("reset-password-button"));

    await waitFor(() => {
      expect(queryByTestId("error-message")).toBeNull();
      expect(getByTestId("success-message")).toBeTruthy();
    });
  });
});
