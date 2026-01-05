export const dateGenerator = (date: string) => {
  if (!date) return null;
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return null;
  const newDate = parsedDate.toISOString();
  return newDate.split('T')[0].replace(/-/g, '.');
};
