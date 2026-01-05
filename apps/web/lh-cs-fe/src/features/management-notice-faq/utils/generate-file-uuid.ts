export const generateFileUuid = () => {
  return Math.random().toString(36).substring(2, 11);
};
