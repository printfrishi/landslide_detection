export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns an error message when the value is empty, otherwise null. */
export function validateRequired(value, label = 'This field') {
  return String(value ?? '').trim() ? null : `${label} is required.`;
}

export function validateName(value) {
  return validateRequired(value, 'Full name');
}

export function validateEmail(value) {
  if (!String(value ?? '').trim()) return 'Email is required.';
  return EMAIL_REGEX.test(value.trim()) ? null : 'Enter a valid email address.';
}

export function validatePassword(value) {
  if (!value) return 'Password is required.';
  return value.length >= 6 ? null : 'Password must be at least 6 characters.';
}

export function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password.';
  return password === confirmPassword ? null : 'Passwords do not match.';
}

/** Validates the login form; returns an object of field errors (null when valid). */
export function validateLoginForm({ email, password }) {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
  };
}

/** Validates the registration form; returns an object of field errors (null when valid). */
export function validateRegisterForm({ name, email, password, confirmPassword }) {
  return {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validatePasswordMatch(password, confirmPassword),
  };
}

/** True when a field-error object has at least one message. */
export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
