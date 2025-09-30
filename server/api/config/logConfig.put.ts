import config from "winston/lib/winston/config/index.js";
import { canReadWrite, pathExists } from "~/server/utils/file";
import { LogConfig, updateConsoleLogging, updateFileLogging } from "~/server/utils/logger";

function testLogConfigType(body: any, varName: string, type: string) {
  // eslint-disable-next-line valid-typeof
  if (typeof body[varName] !== type) {
    logger.warning({
      service: "logger",
      message: `Attempt to set ${varName} to a datatype other than ${type}: ${body[varName]}`,
    });
    throw createError({
      statusCode: 400,
      statusMessage: `${varName} must be a ${type}`,
    });
  }
}

function testLogLevels(body: any, levelTarget: string) {
  const varName = `${levelTarget}LogLevel`;

  if (typeof body[varName] !== "string") {
    logger.warning({
      service: "logger",
      message: `Attempt to set ${levelTarget} log level a datatype other than string: ${body[varName]}`,
    });
    throw createError({
      statusCode: 400,
      statusMessage: `${levelTarget} log level must be a string.`,
    });
  }

  if (!(body[varName] in config.syslog.levels)) {
    logger.notice({
      service: "logger",
      message: `Attempt to set ${levelTarget} log level to an invalid syslog level: ${body[varName]}`,
    });
    throw createError({
      statusCode: 400,
      statusMessage: `${body[varName]} is not a valid syslog level.`,
    });
  }
}

function settingsUpdated(
  oldSettings: LogConfig,
  newSettings: LogConfig,
  settingsToCheck: (keyof LogConfig)[],
) {
  for (const setting of settingsToCheck) {
    if (oldSettings[setting] !== newSettings[setting]) {
      return true;
    }
  }

  return false;
}

async function processLogBodyParam<K extends keyof LogConfig>(
  body: LogConfig,
  currentSettings: LogConfig,
  newSettings: LogConfig,
  name: K,
  type: string,
) {
  testLogConfigType(body, name, type);
  const value = body[name];
  if (value != null) {
    if (value !== currentSettings[name]) {
      await setLogValue(name, value);
      newSettings[name] = value;
    }
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult.UserRoleId === 1) {
    const currentSettings = await getLogConfig();
    const newSettings = { ...currentSettings };

    if (body.logPath) {
      testLogConfigType(body, "logPath", "string");
      if (!pathExists(body.logPath)) {
        logger.notice({
          service: "logger",
          message: `Attempt to set Log Path to ${body.LogPath} but path does not exist.`,
        });
        throw createError({
          statusCode: 400,
          statusMessage: "Log Path does not exist.",
        });
      }
      if (!canReadWrite(body.logPath)) {
        logger.notice({
          service: "logger",
          message: `Attempt to set Log Path to ${body.LogPath} but had insufficient permissions (RW)`,
        });
        throw createError({
          statusCode: 400,
          statusMessage: `Insufficient Permissions to Log Path: ${body.logPath}.`,
        });
      }
      if (body.logPath !== currentSettings.logPath) {
        await setLogValue("logPath", body.logPath);
        newSettings.logPath = body.logPath;
      }
    }

    if (body.fileLogEnabled != null) {
      await processLogBodyParam(body, currentSettings, newSettings, "fileLogEnabled", "boolean");
      // testLogConfigType(body, "fileLogEnabled", "boolean");
      // if (body.fileLogEnabled !== currentSettings.fileLogEnabled) {
      //   await setLogValue("fileLogEnabled", body.fileLogEnabled);
      //   newSettings.fileLogEnabled = body.fileLogEnabled;
      // }
    }

    if (body.maxSize) {
      await processLogBodyParam(body, currentSettings, newSettings, "maxSize", "number");
    }

    if (body.maxDays) {
      await processLogBodyParam(body, currentSettings, newSettings, "maxDays", "number");
    }

    if (body.zipArchive != null) {
      await processLogBodyParam(body, currentSettings, newSettings, "zipArchive", "boolean");
    }

    if (body.syslogLogEnabled != null) {
      await processLogBodyParam(body, currentSettings, newSettings, "syslogLogEnabled", "boolean");
    }
    const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;

    if (body.syslogTarget) {
      testLogConfigType(body, "syslogTarget", "string");
      if (!ipv4Regex.test(body.syslogTarget)) {
        logger.notice({
          service: "logger",
          message: `Attempt to set Syslog Target to and invalid IP: ${body.syslogTarget}`,
        });
        throw createError({
          statusCode: 400,
          statusMessage: `Syslog Target IP is not a valid format. ${body.syslogTarget}`,
        });
      }
      if (body.syslogTarget !== currentSettings.syslogTarget) {
        await setLogValue("syslogTarget", body.syslogTarget);
        newSettings.syslogTarget = body.syslogTarget;
      }
    }

    if (body.syslogPort) {
      testLogConfigType(body, "syslogPort", "number");
      if (!(body.syslogPort >= 1 && body.syslogPort <= 65535)) {
        logger.notice({
          service: "logger",
          message: `Attempt to set Syslog Port to and invalid port number: ${body.syslogPort}`,
        });
        throw createError({
          statusCode: 400,
          statusMessage: "Port is not a valid port number.",
        });
      }
      if (body.syslogPort !== currentSettings.syslogPort) {
        await setLogValue("syslogPort", body.syslogPort);
        newSettings.syslogPort = body.syslogPort;
      }
    }

    if (body.consoleLogLevel) {
      testLogLevels(body, "console");
      if (body.consoleLogLevel !== currentSettings.consoleLogLevel) {
        await setLogValue("consoleLogLevel", body.consoleLogLevel);
        newSettings.consoleLogLevel = body.consoleLogLevel;
      }
    }
    if (body.fileLogLevel) {
      testLogLevels(body, "file");
      if (body.fileLogLevel !== currentSettings.fileLogLevel) {
        await setLogValue("fileLogLevel", body.fileLogLevel);
        newSettings.fileLogLevel = body.fileLogLevel;
      }
    }
    if (body.syslogLogLevel) {
      testLogLevels(body, "syslog");
      if (body.syslogLogLevel !== currentSettings.syslogLogLevel) {
        await setLogValue("syslogLogLevel", body.syslogLogLevel);
        newSettings.syslogLogLevel = body.syslogLogLevel;
      }
    }

    const fileLoggSettings: (keyof LogConfig)[] = [
      "fileLogEnabled",
      "fileLogLevel",
      "logPath",
      "maxDays",
      "maxSize",
      "zipArchive",
    ];

    if (settingsUpdated(currentSettings, newSettings, fileLoggSettings)) {
      updateFileLogging(newSettings);
    }

    if (newSettings.syslogLogEnabled) {
      const syslogSettings: (keyof LogConfig)[] = [
        "syslogLogEnabled",
        "syslogLogLevel",
        "syslogPort",
        "syslogTarget",
      ];
      if (settingsUpdated(currentSettings, newSettings, syslogSettings)) {
        updateSyslogLogging(newSettings);
      }
    }

    const consolLogSettings: (keyof LogConfig)[] = ["consoleLogLevel"];
    if (settingsUpdated(currentSettings, newSettings, consolLogSettings)) {
      updateConsoleLogging(newSettings);
    }

    return newSettings;
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
