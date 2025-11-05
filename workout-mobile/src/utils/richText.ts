export const stripHtml = (input: string): string => {
  if (!input) {
    return '';
  }
  return input.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim();
};

export const sanitizeHtml = (input: string): string => {
  if (!input) {
    return '';
  }

  let sanitized = input;

  sanitized = sanitized.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
  sanitized = sanitized.replace(/\son\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/\son\w+='[^']*'/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized.trim();
};

