export const getCurrentTime = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = String(now.getMinutes()).padStart(2, "0");
  const period = hour < 12 ? "오전" : "오후";
  const displayHour = hour > 12 ? hour - 12 : hour || 12;

  return `${period} ${displayHour}:${minute}`;
};
