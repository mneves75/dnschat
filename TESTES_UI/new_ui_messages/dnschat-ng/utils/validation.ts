const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;

export const MAX_MESSAGE_LENGTH = 200;

export type MessageValidationError = 'empty' | 'length';

export type MessageValidationResult =
  | { valid: true; sanitized: string; normalized: string }
  | {
      valid: false;
      sanitized: string;
      normalized: string;
      reason: string;
      reasonCode: MessageValidationError;
    };

export const validateMessageInput = (value: string): MessageValidationResult => {
  const sanitized = stripControlCharacters(value);
  const normalized = sanitized.trim();
  if (normalized.length === 0) {
    return {
      valid: false,
      sanitized,
      normalized,
      reason: 'Message cannot be empty.',
      reasonCode: 'empty'
    };
  }
  if (normalized.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      sanitized,
      normalized,
      reason: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
      reasonCode: 'length'
    };
  }
  return { valid: true, sanitized, normalized };
};

export const stripControlCharacters = (value: string) => value.replace(CONTROL_CHAR_REGEX, '');
