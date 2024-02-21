
import * as fs from 'fs';

export default defineEventHandler(async (event) => {

  const filePath = 'config/alertTest.json';

  const query = getQuery(event);
  const desiredId = query.userId;

try{
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const alertArray = JSON.parse(fileContent);
  const filteredAlerts = alertArray.filter(obj => obj.userId === parseInt(desiredId, 10));
  
  return filteredAlerts;
  
}catch{
  return [];
}

})
