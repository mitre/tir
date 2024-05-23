import * as fs from "fs";
import * as path from "path";
import { IncomingMessage } from "http";
import * as tar from "tar";
import formidable from "formidable";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  console.log("Starting Upload");

  const body = await proccessNodeRequest(event.node.req);

  const uploadedCaCert = body.caCert;
  const uploadedSiteCert = body.siteCert;

  const newCaFileName = path.join(config.temp_folder, "ssl_certificate.crt");
  const newSiteFileName = path.join(config.temp_folder, "ssl_certificate_key.key");
  const certLocation = "/cert_loc";
  try {
    if (!fs.existsSync(config.temp_folder)) {
      fs.mkdirSync(config.temp_folder, { recursive: true });
    }

    fs.renameSync(uploadedCaCert[0].filepath, newCaFileName);
    fs.renameSync(uploadedSiteCert[0].filepath, newSiteFileName);
    await tar.c(
      {
        file: `${certLocation}/${uploadedCaCert[0].newFilename}.tar`,
      },
      [`${newCaFileName}`, `${newSiteFileName}`],
    );
    fs.rmSync(newCaFileName);
    fs.rmSync(newSiteFileName);
  } catch (error) {
    logger.error("Error Staging Cert directories", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error Staging Cert directories",
    });
  }

  let done = false;
  let count = 0;
  await sleep(10000);
  const file = fs.existsSync(`${certLocation}/cert_response.json`);

  // if no file throw error
  if (file) {
    while (!done && count <= 10) {
      const content = fs.readFileSync(`${certLocation}/cert_response.json`, "utf-8");
      const jsonContent = JSON.parse(content);

      if (jsonContent.filename === `${uploadedCaCert[0].newFilename}.tar`) {
        done = true;
      } else if (count === 10) {
        logger.error("Unable to Recieve Cert");
        throw createError({
          statusCode: 500,
          statusMessage: "Unable to Recieve Cert.",
        });
      }
      if (jsonContent.error.toLowerCase() !== "none") {
        logger.error("Error In Cert Response");
        throw createError({
          statusCode: 500,
          statusMessage: "Error In Cert Response.",
        });
      }
      await sleep(1000);
      count++;
    }
  } else {
    logger.error("Error Retrieving File");
    throw createError({
      statusCode: 500,
      statusMessage: "Error Retrieving File",
    });
  }
  logger.info({
    service: "Cert",
    message: `Cert Successfully Imported`,
  });
  return { success: true };
});
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {import('http').IncomingMessage} req
 */
function proccessNodeRequest(req: IncomingMessage): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    /** @see https://github.com/node-formidable/formidable/ */
    const form = formidable({
      multiples: true,
      maxFileSize: 350 * 1024 * 1024,
    });

    form.parse(req, (error, fields: Record<string, any>, files: Record<string, any>) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ ...fields, ...files });
    });
  });
}
