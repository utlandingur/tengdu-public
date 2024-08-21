export const isValidEmail = (email: string) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

// returns true if the user is 18 years or older
export const verifyAge = (dateOfBirth): boolean => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const month = today.getMonth() - dateOfBirth.getMonth();
  const day = today.getDate() - dateOfBirth.getDate();
  if (month < 0 || (month == 0 && day < 0)) {
    age--;
  }
  return age >= 18;
};

export const verifyName = (name: string) => {
  return name && /^[a-zA-Z]+([ -][a-zA-Z]+)*$/.test(name) ? true : false;
};
