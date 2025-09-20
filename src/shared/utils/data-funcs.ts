export function getFutureDate(minutes = 15) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
