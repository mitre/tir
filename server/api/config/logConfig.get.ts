import * as fs from 'fs';

export default defineEventHandler(async (event) => {
 
  const filePath = 'logConfig.json';

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const jsonObject = JSON.parse(fileContent);

    return jsonObject;

  } catch (err) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Configuration Not Found',
    })
  }

})
