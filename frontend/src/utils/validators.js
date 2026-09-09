export function validateName(value) {
  if (!value || value.trim().length < 1 || value.trim().length > 60) {
    return 'Name must be between 1 and 60 characters.';
  }
  return null;
}

export function validateEmail(value) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value || !pattern.test(value)) {
    return 'Enter a valid email address.';
  }
  return null;
}

export function validateAddress(value) {
  if (value && value.length > 400) {
    return 'Address must be at most 400 characters.';
  }
  return null;
}

export function validatePassword(value) {
  if (!value || value.length < 8 || value.length > 16) {
    return 'Password must be 8-16 characters long.';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(value)) {
    return 'Password must include at least one special character.';
  }
  return null;
}

// Runs a { field: validatorFn } map against a values object and returns an error map.
export function runValidators(values, rules) {
  const errors = {};
  Object.entries(rules).forEach(([field, fn]) => {
    const message = fn(values[field]);
    if (message) errors[field] = message;
  });
  return errors;
}
