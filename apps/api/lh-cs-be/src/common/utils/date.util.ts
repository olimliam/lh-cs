const pad = (value: number, width = 2): string => {
  return String(value).padStart(width, '0');
};

export const formatTimestamp = (date: Date): string => {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(
    date.getHours()
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};
