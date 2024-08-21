import "@testing-library/jest-native/extend-expect";

import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import * as Linking from "expo-linking";

import SignInForm from "../../../components/SignInForm";
import { useSession } from "../../../providers/AuthProvider";
import { renderWithAuth } from "../../../render";

describe("LoginForm", () => {
  it("submits the form with correct email and password", async () => {
    const signIn = jest.fn().mockResolvedValue(true);
    (useSession as jest.Mock).mockReturnValue({
      signIn
    });

    const email = "test@example.com";
    const password = "password123";

    let getByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<SignInForm />, {});
      getByTestId = result.getByTestId;
    });

    const emailInput = getByTestId("Email-input");
    const passwordInput = getByTestId("Password-input");
    const signInButton = getByTestId("sign-in-button");

    fireEvent.changeText(emailInput, email);
    fireEvent.changeText(passwordInput, password);

    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });
  it("shows an error message when login credentials are wrong", async () => {
    const signIn = jest
      .fn()
      .mockRejectedValue(new Error("user doesn't exist or similar"));
    (useSession as jest.Mock).mockReturnValue({
      signIn
    });

    const email = "test@email.com";
    const password = "password123";

    let getByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<SignInForm />, {});
      getByTestId = result.getByTestId;
    });

    const emailInput = getByTestId("Email-input");
    const passwordInput = getByTestId("Password-input");
    const signInButton = getByTestId("sign-in-button");

    fireEvent.changeText(emailInput, email);
    fireEvent.changeText(passwordInput, password);

    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
    });
    await waitFor(() =>
      expect(getByTestId("Email-error-message")).toHaveTextContent(
        "Invalid login credentials"
      )
    );
  });

  it("shows an error message when the email is invalid", async () => {
    const signIn = jest.fn();
    (useSession as jest.Mock).mockReturnValue({
      signIn
    });

    const email = "test";
    const password = "password123";

    let getByTestId;
    await waitFor(() => {
      const result = renderWithAuth(<SignInForm />, {});
      getByTestId = result.getByTestId;
    });

    const emailInput = getByTestId("Email-input");
    const passwordInput = getByTestId("Password-input");
    const signInButton = getByTestId("sign-in-button");

    fireEvent.changeText(emailInput, email);
    fireEvent.changeText(passwordInput, password);

    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(signIn).not.toHaveBeenCalled();
    });
    await waitFor(() =>
      expect(getByTestId("Email-error-message")).toHaveTextContent(
        "Invalid login credentials"
      )
    );
  });

  // TODO - figure out how to get this setup properly. Struggling to find expo-router/testing-library
  // it seems like it appears in Expo router v3 but we use v2

  // it('navigates to the password reset page when "Forgot password" is clicked', async () => {
  //   const MockSignInForm = jest.fn(() => <SignInForm />);

  //   renderRouter(
  //     {
  //       signIn: MockSignInForm,
  //       resetPassword: jest.fn(() => <View testID="reset-password-page" />)
  //     },
  //     {
  //       initialUrl: "/signIn"
  //     }
  //   );

  //   const forgotPasswordLink = screen.getByTestId("forgot-password-link");

  //   fireEvent.press(forgotPasswordLink);

  //   await waitFor(() => {
  //     expect(screen).toHavePathname("/resetPassword");
  //   });
  // });
});
