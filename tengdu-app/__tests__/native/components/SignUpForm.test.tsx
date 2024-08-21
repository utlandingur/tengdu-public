import { fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";

import SignUpForm from "../../../components/SignUpForm";
import { useSession } from "../../../providers/AuthProvider";
import { renderWithAuth } from "../../../render";

jest.mock("expo-router");
(useRouter as jest.Mock).mockReturnValue({
  navigate: jest.fn()
});

describe("SignUpForm", () => {
  it("calls signUp with correct arguments when form is submitted", async () => {
    const signUpMock = jest.fn().mockResolvedValue({ uid: "testUid" });
    (useSession as jest.Mock).mockReturnValue({
      signUp: signUpMock,
      user: null
    });

    let getByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<SignUpForm />, {});
      getByTestId = result.getByTestId;
    });

    const emailInput = getByTestId("Email-input");
    const passwordInput = getByTestId("Password-input");
    const checkbox = getByTestId("agree-to-terms-checkbox");
    const submitButton = getByTestId("create-account-button");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "testPassword");
    fireEvent.press(checkbox);
    fireEvent.press(submitButton);

    await waitFor(() =>
      expect(signUpMock).toHaveBeenCalledWith(
        "test@example.com",
        "testPassword"
      )
    );
  });

  it("calls signUp with correct arguments when form is submitted", async () => {
    const signUpMock = jest.fn().mockResolvedValue({ uid: "testUid" });
    (useSession as jest.Mock).mockReturnValue({
      signUp: signUpMock,
      user: null
    });

    let getByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<SignUpForm />, {});
      getByTestId = result.getByTestId;
    });

    const emailInput = getByTestId("Email-input");
    const passwordInput = getByTestId("Password-input");
    const checkbox = getByTestId("agree-to-terms-checkbox");
    const submitButton = getByTestId("create-account-button");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "testPassword");
    fireEvent.press(checkbox);
    fireEvent.press(submitButton);

    await waitFor(() => expect(useRouter().navigate).toHaveBeenCalledWith("/"));
  });

  it("does not call signUp when form is invalid", async () => {
    const signUpMock = jest.fn().mockResolvedValue({ uid: "testUid" });
    (useSession as jest.Mock).mockReturnValue({
      signUp: signUpMock,
      user: null
    });

    let getByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<SignUpForm />, {});
      getByTestId = result.getByTestId;
    });

    const submitButton = getByTestId("create-account-button");

    fireEvent.press(submitButton);

    await waitFor(() => expect(signUpMock).not.toHaveBeenCalled());
  });

  // // Test form validation
  it("shows an error message when the password is too weak", async () => {
    const signUpMock = jest
      .fn()
      .mockRejectedValue(new Error("password was too weak"));
    (useSession as jest.Mock).mockReturnValue({
      signUp: signUpMock,
      user: null
    });

    let getByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<SignUpForm />, {});
      getByTestId = result.getByTestId;
    });

    const emailInput = getByTestId("Email-input");
    const passwordInput = getByTestId("Password-input");
    const checkbox = getByTestId("agree-to-terms-checkbox");
    const submitButton = getByTestId("create-account-button");

    fireEvent.changeText(passwordInput, "123");
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.press(checkbox);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByTestId("Password-error-message")).toBeDefined();
    });
  });

  it("shows an error message when the email is invalid", async () => {
    const signUpMock = jest.fn().mockRejectedValue(new Error("invalid-email"));
    (useSession as jest.Mock).mockReturnValue({
      signUp: signUpMock,
      user: null
    });

    let getByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<SignUpForm />, {});
      getByTestId = result.getByTestId;
    });

    const emailInput = getByTestId("Email-input");
    const passwordInput = getByTestId("Password-input");
    const checkbox = getByTestId("agree-to-terms-checkbox");
    const submitButton = getByTestId("create-account-button");

    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(emailInput, "test@example.");
    fireEvent.press(checkbox);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByTestId("Email-error-message")).toHaveTextContent(
        "Invalid email"
      );
    });
  });

  it("show an error when the checkbox has not been checked", async () => {
    let getByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<SignUpForm />, {});
      getByTestId = result.getByTestId;
    });

    const emailInput = getByTestId("Email-input");
    const passwordInput = getByTestId("Password-input");
    const checkbox = getByTestId("agree-to-terms-checkbox");
    const submitButton = getByTestId("create-account-button");

    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(emailInput, "test@example.");
    fireEvent.press(submitButton);
    await waitFor(() => {
      expect(checkbox).toHaveStyle({
        borderLeftColor: "red",
        borderRightColor: "red",
        borderTopColor: "red",
        borderBottomColor: "red"
      });
    });
  });

  it("removes error messages when the input is corrected", async () => {
    const signUpMock = jest.fn().mockRejectedValue(new Error("invalid-email"));
    (useSession as jest.Mock).mockReturnValue({
      signUp: signUpMock,
      user: null
    });

    let getByTestId, queryByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<SignUpForm />, {});
      getByTestId = result.getByTestId;
      queryByTestId = result.queryByTestId;
    });

    const emailInput = getByTestId("Email-input");
    const passwordInput = getByTestId("Password-input");
    const checkbox = getByTestId("agree-to-terms-checkbox");
    const submitButton = getByTestId("create-account-button");

    // Enter invalid values and submit the form
    fireEvent.changeText(emailInput, "invalid email");
    fireEvent.changeText(passwordInput, "short");
    fireEvent.press(submitButton);

    // Wait for the error messages to appear
    await waitFor(() => {
      expect(queryByTestId("Checkbox-error-message")).toBeDefined();
      expect(queryByTestId("Email-error-message")).toBeDefined();
      expect(queryByTestId("Password-error-message")).toBeDefined();
    });

    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(emailInput, "test@example.");
    fireEvent.press(checkbox);
    fireEvent.press(submitButton);

    // Check that the error messages are no longer present
    await waitFor(() => {
      expect(queryByTestId("Email-error-message")).toBeNull();
      expect(queryByTestId("Checkbox-error-message")).toBeNull();
      expect(queryByTestId("Password-error-message")).toBeNull();
    });
  });

  test("redirects to the correct page after a successful sign up", async () => {
    // ...
  });
});
