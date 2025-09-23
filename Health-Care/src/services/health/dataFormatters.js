export const formatHealthData = {
  steps: records => records.reduce((sum, r) => sum + r.count, 0),
  heartRate: records => {
    if (!records.length) return 0;
    const avg = records.reduce((s, r) => s + r.beatsPerMinute, 0) / records.length;
    return Math.round(avg);
  },
  distance: records => records.reduce((sum, r) => sum + r.distance.inMeters, 0),
  activeCalories: records =>
    records.reduce((sum, r) => sum + r.energy.inKilocalories, 0),
  sleep: records =>
    records.reduce((sum, r) => {
      const d = new Date(r.endTime) - new Date(r.startTime);
      return sum + d / 36e5;
    }, 0),
  bloodOxygen: records => {
    if (!records.length) return 0;
    const avg = records.reduce((s, r) => s + r.percentage, 0) / records.length;
    return Math.round(avg);
  },
};

export const formatDisplay = {
  steps: v => v.toLocaleString(),
  heartRate: v => (v ? `${v} bpm` : '--'),
  distance: m => (m >= 1000 ? `${(m/1000).toFixed(2)} km` : `${Math.round(m)} m`),
  activeCalories: v => `${Math.round(v)} kcal`,
  sleep: h => `${h.toFixed(1)} hrs`,
  bloodOxygen: v => (v ? `${v}%` : '--'),
};
