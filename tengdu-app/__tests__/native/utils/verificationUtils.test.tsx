import { isValidEmail, verifyName } from "../../../utils/verificationUtils";

describe("isValidEmail", () => {
  it("returns true for valid email addresses", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("john.doe@example.co.uk")).toBe(true);
    expect(isValidEmail("john.doe@subdomain.example.com")).toBe(true);
    expect(isValidEmail("a@example.com")).toBe(true);
    expect(isValidEmail("john-doe_123@example.com")).toBe(true);
    expect(isValidEmail("john.doe@a.co")).toBe(true);
    expect(isValidEmail("john.doe@example.info")).toBe(true);
  });

  it("returns false for invalid email addresses", () => {
    expect(isValidEmail("test@example")).toBe(false);
    expect(isValidEmail("test@.com")).toBe(false);
    expect(isValidEmail("test")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("john.doe@")).toBe(false);
    expect(isValidEmail("john.doe.example.ca")).toBe(false);
    expect(isValidEmail("john doe@example.com")).toBe(false);
    expect(isValidEmail("john.doe@exa$mple.com")).toBe(false);
    expect(isValidEmail("john.doe(comment)@example.com")).toBe(false);
    expect(isValidEmail("john.doe\\@example.com@example.com")).toBe(false);
    expect(isValidEmail('"john.doe"@example.com')).toBe(false);
  });
});

describe("verifyName", () => {
  it("returns true for valid names", () => {
    expect(verifyName("John")).toBe(true);
    expect(verifyName("Jane")).toBe(true);
    expect(verifyName("John-Doe")).toBe(true);
    expect(verifyName("John Doe")).toBe(true);
    expect(verifyName("John-Doe-Bellamyadoor-witharealllllllylongname")).toBe(
      true
    );
  });

  it("returns false for invalid names", () => {
    expect(verifyName("")).toBe(false);
    expect(verifyName("123")).toBe(false);
    expect(verifyName("John123")).toBe(false);
    expect(verifyName("John Doe 123")).toBe(false);
    expect(verifyName("John-Doe-123")).toBe(false);
    expect(verifyName("John Doe 123")).toBe(false);
  });
});
