const PALETTE = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f97316", // orange
  "#14b8a6", // teal
];

let colorIndex = 0;

export function getProjectColor(): string {
  const color = PALETTE[colorIndex % PALETTE.length];
  colorIndex++;
  return color;
}
