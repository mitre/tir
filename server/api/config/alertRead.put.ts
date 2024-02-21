import * as fs from 'fs';

export default defineEventHandler(async (event) => {

  const filePath = 'config/alertTest.json';
  
  let alertArray: any[] = [];

  if (fs.existsSync(filePath)) {
    // Read the existing JSON file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    alertArray = JSON.parse(fileContent);
  }
  
  const body = await readBody(event);
  const desiredIdToRead = body.id;
  let alertFound  = false;

  const updatedAlerts = alertArray.map(obj => {
    if (obj.id === desiredIdToRead) {
      alertFound = true;
      return { ...obj, read: true };
    }
    return obj;
  });

  const jsonString = JSON.stringify(updatedAlerts, null, 2);

 
    if(alertFound){
    try{
      const fileWriteResult = fs.writeFileSync(filePath, jsonString, 'utf8');  
      return {success: true}  
    }catch (error){
      throw error;
    }
  
    }else{
      throw createError({
        statusCode: 404,
        statusMessage: 'Alert id not found',
      })
    }
  
  });
