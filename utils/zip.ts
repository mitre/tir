import JSZip from "jszip";
import { processNessus } from "~/utils/nessus";

export async function unZip(source: any, systemList: any[]) {
  let isNessus = false;
  let isCkl = false;
  let isCklb = false;
  const results: any[] = [];
  const resultFile: JSZip.JSZipObject[] = [];

  const zip = new JSZip();
  await zip.loadAsync(source);
  for (let i = 0; i < Object.keys(zip.files).length; i++) {
    if (Object.keys(zip.files)[i].includes(".nessus")) {
      isNessus = true;
      const file = zip.files[Object.keys(zip.files)[i]];

      await file.async("string").then(async function (blob) {
        const nessusResult = await processNessus(blob, systemList);

        results.push(nessusResult);
        resultFile.push(file);
      });
    } else if (Object.keys(zip.files)[i].includes(".cklb")) {
      isCklb = true;
      const file = zip.files[Object.keys(zip.files)[i]];

      await file.async("string").then(async function (blob) {
        const cklResult = await processChecklistV3(blob, systemList);

        results.push(cklResult);
        resultFile.push(file);
      });
    } else if (Object.keys(zip.files)[i].includes(".ckl")) {
      isCkl = true;
      const file = zip.files[Object.keys(zip.files)[i]];

      await file.async("string").then(async function (blob) {
        const cklResult = await processChecklist(blob, systemList);

        results.push(cklResult);
        resultFile.push(file);
      });
    }
  }

  await Promise.all(results);

  return { nessus: isNessus, ckl: isCkl, cklb: isCklb, results, files: resultFile };
}
