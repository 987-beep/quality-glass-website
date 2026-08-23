/** ₹1,499 Indian-style grouping, no decimals for whole amounts. */
export function formatINR(value: number): string {
  const whole = Math.round(value);
  return "₹" + whole.toLocaleString("en-IN");
}
