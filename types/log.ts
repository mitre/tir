export type LogConfig = {
  fileLogEnabled: boolean;
  syslogLogEnabled: boolean;
  logPath: string;
  syslogTarget: string;
  syslogPort: number;
  consoleLogLevel: string;
  fileLogLevel: string;
  syslogLogLevel: string;
  zipArchive: boolean;
  maxSize: number;
  maxDays: number;
  levels?: string[];
};

export const LOG_SCHEMA = {
  fileLogEnabled: { type: "bool", default: true },
  syslogLogEnabled: { type: "bool", default: false },

  logPath: { type: "str", default: "tmp" },

  syslogTarget: { type: "str", default: "" },
  syslogPort: { type: "num", default: 514 },

  consoleLogLevel: { type: "str", default: "info" },
  fileLogLevel: { type: "str", default: "info" },
  syslogLogLevel: { type: "str", default: "info" },

  zipArchive: { type: "bool", default: false },
  maxSize: { type: "num", default: 10 },
  maxDays: { type: "num", default: 7 },
} as const;
