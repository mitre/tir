import * as fs from 'fs';

export default defineEventHandler(async (event) => {

  const filePath = 'logConfig.json';
  const body = await readBody(event);
  const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  let logPath, syslogTarget, syslogPort, logLevel;

  try{
    logPath = body.logPath;
    syslogTarget = body.syslogTarget;
    syslogPort = body.syslogPort;
    logLevel = body.logLevel;
  }catch(error){
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing Parameters',
    })
  }

  if(!fs.existsSync(logPath)){
    throw createError({
      statusCode: 400,
      statusMessage: 'Log Path does not exist.',
    })
  }

  if(!ipv4Regex.test(syslogTarget)){
    throw createError({
      statusCode: 400,
      statusMessage: `Syslog Target IP is not a valid format. ${syslogTarget}`,
    })
  }

  let portNumber;
  try{
    if(typeof syslogPort === 'string'){
      portNumber = parseInt(syslogPort,10);
    }else{
      portNumber = syslogPort;
    }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Port is not a valid number.',
    })
  }
  
  if(!(portNumber >= 1 && portNumber <= 65535)){
    throw createError({
      statusCode: 400,
      statusMessage: 'Port is not a valid port number.',
    })
  }

  const logObject = {
    logPath: logPath,
    syslogTarget: syslogTarget,
    syslogPort: portNumber,
    logLevel: logLevel
  }
  
  fs.writeFile(filePath, JSON.stringify(logObject), (err) => {
    if (err) throw err;
  });

  return logObject;
})
