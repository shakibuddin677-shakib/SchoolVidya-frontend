// Marksheet har exam ke liye SAME attendance % dikha raha tha, kyunki StudentResultsView/MarksheetView student ki POORI lifetime attendance fetch kar rahe the
export function calculateAttendancePercentageForRange(records = [], startDate, endDate) {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const inRange = records.filter((r) => {
    const d = new Date(r.date);
    return d >= start && d <= end;
  });

  if (inRange.length === 0) return null; // is period mein koi record hi nahi mila

  const presentEquivalent = inRange.reduce((sum, r) => {
    if (r.status === "present" || r.status === "late") return sum + 1;
    if (r.status === "halfday") return sum + 0.5;
    return sum;
  }, 0);

  return Number(((presentEquivalent / inRange.length) * 100).toFixed(2));
}
