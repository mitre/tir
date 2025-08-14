type LogMessage = string | { service?: string; message: string };

export const clientLogger = {
  debug: false,
  log(msg: LogMessage) {
    if (!this.debug) return;
    this._output("log", msg);
  },
  warn(msg: LogMessage) {
    if (!this.debug) return;
    this._output("warn", msg);
  },
  error(msg: LogMessage) {
    this._output("error", msg); // Errors always log
  },
  setDebug(value: boolean) {
    this.debug = value;
  },
  _output(type: "log" | "warn" | "error", msg: LogMessage) {
    let prefix = "[tir]";
    let message = "";

    if (typeof msg === "string") {
      message = msg;
    } else if (typeof msg === "object" && msg.message) {
      prefix = msg.service ? `[tir-${msg.service}]` : "[tir]";
      message = msg.message;
    } else {
      message = "Invalid log format";
    }

    console[type](`${prefix} ${message}`);
  },
};
