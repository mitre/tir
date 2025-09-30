export type ProgressMessage =
  | { type: "status"; value: string }
  | { type: "progress"; value: number }
  | { type: "saved"; value: number }
  | { type: "error"; value: string }
  | { type: "complete" };
