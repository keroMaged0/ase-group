/* eslint-disable indent */
type Units = 'minutes' | 'hours' | 'days' | 'months' | 'weeks' | 'years';

const addToDate = (initialDate: Date, unit: Units, value: number) => {
  const temp = new Date(initialDate);
  switch (unit) {
    case 'hours':
      temp.setHours(temp.getHours() + value);
      break;
    case 'days':
      temp.setDate(temp.getDate() + value);
      break;
    case 'months':
      temp.setMonth(temp.getMonth() + value);
      break;
    case 'weeks':
      temp.setDate(temp.getDate() + value * 7);
      break;
    case 'minutes':
      temp.setMinutes(temp.getMinutes() + value);
      break;
    case 'years':
      temp.setFullYear(temp.getFullYear() + value);
      break;
    default:
      break;
  }
  return temp;
};

export const DateHelper = { addToDate };
