// src/utils/formatDate.js
import dayjs from 'dayjs';

/**
 * Formats a date string into a readable format.
 * @param {string | Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return dayjs(date).format('MMM D, YYYY h:mm:ss A');
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  return dayjs(date).format('h:mm:ss A');
};

export const formatShortDate = (date) => {
  if (!date) return 'N/A';
  return dayjs(date).format('MMM D, YYYY');
};