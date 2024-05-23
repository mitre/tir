import * as fs from "fs";
import { SyslogTransportOptions, Syslog } from "winston-syslog";

export default defineEventHandler(async (event) => {
  const logConfigPath = "config/logConfig.json";
  const body = await readBody(event);

  let currentSettings;

  try {
    if (fs.existsSync(logConfigPath)) {
      fs.accessSync(logConfigPath, fs.constants.R_OK);
      const fileContent = fs.readFileSync(logConfigPath, "utf-8");
      currentSettings = JSON.parse(fileContent);
    }
  } catch (err) {
    logger.error("Unable to read log configuration");
    throw createError({
      statusCode: 404,
      statusMessage: "Erorr reading log configuration",
    });
  }

  const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  let logPath, syslogTarget, syslogPort, logLevel;

  try {
    logPath = body.logPath;
    syslogTarget = body.syslogTarget;
    syslogPort = body.syslogPort;
    logLevel = body.logLevel;
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing Parameters",
    });
  }

  if (!fs.existsSync(logPath)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Log Path does not exist.",
    });
  }

  let portNumber;
  try {
    if (typeof syslogPort === "string") {
      portNumber = parseInt(syslogPort, 10);
    } else {
      portNumber = syslogPort;
    }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: "Port is not a valid number.",
    });
  }

  if (syslogTarget) {
    if (!(portNumber >= 1 && portNumber <= 65535)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Port is not a valid port number.",
      });
    }

    if (!ipv4Regex.test(syslogTarget)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Syslog Target IP is not a valid format. ${syslogTarget}`,
      });
    }
  }

  const logObject = {
    logPath,
    syslogTarget,
    syslogPort: portNumber,
    logLevel,
  };

  if (
    syslogTarget &&
    (currentSettings?.syslogTarget !== logObject.syslogTarget ||
      currentSettings?.syslogPort !== logObject.syslogPort)
  ) {
    const opt: SyslogTransportOptions = {
      host: logObject.syslogTarget,
      port: logObject.syslogPort,
      protocol: "udp4",
      // facility: 'local0',
      app_name: "TIR",
      // eol: '\n'
    };

    const oldSyslogTransport = logger.transports.find((transport) => transport instanceof Syslog);

    if (oldSyslogTransport) {
      logger.remove(oldSyslogTransport);
    }

    logger.add(new Syslog(opt));
    logger.info(`New Logger Transport Configured: Syslog to ${logObject.syslogTarget}`);
  }

  fs.writeFile(logConfigPath, JSON.stringify(logObject), (err) => {
    if (err) throw err;
  });

  return logObject;
});
