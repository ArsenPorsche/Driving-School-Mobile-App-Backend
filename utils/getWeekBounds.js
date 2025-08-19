// Get the start and the end of the week
const getWeekBounds = (date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();// Sunday = 0
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);// Monday is the start of the week
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

module.exports = getWeekBounds