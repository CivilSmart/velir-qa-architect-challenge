const addDays = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const testDates = {
  checkin: addDays(21),
  checkout: addDays(23)
};

export const invalidBookingPayload = {};
