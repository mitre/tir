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
  const idToSetToDelete = body.id;

  const updatedAlerts = alertArray.filter(obj => obj.id !== parseInt(idToSetToDelete,10));


  const jsonString = JSON.stringify(updatedAlerts, null, 2);
  
  if(alertArray.length - 1 === updatedAlerts.length){
    try{
      const fileWriteResult = fs.writeFileSync(filePath, jsonString, 'utf8');
    
      return {success: true}
    }catch{
      return {success: false}
    }  
  }else{
    throw createError({
      statusCode: 404,
      statusMessage: 'Alert id not found',
    })
  }
  
});
