import JSZip from "jszip";
import { processNessus } from "~/utils/nessus";

export async function unZip(source: any, systemList: any[]) {
  let isNessus = false;
  const nessusResults: { systemID: any[]; systemName: string }[] = [];
  const nessusFile: JSZip.JSZipObject[] = [];

  const zip = new JSZip();
  await zip.loadAsync(source);
  for (let i = 0; i < Object.keys(zip.files).length; i++) {
    if (Object.keys(zip.files)[i].includes(".nessus")) {
      isNessus = true;
      const file = zip.files[Object.keys(zip.files)[i]];

      await file.async("string").then(async function (blob) {
        const nessusResult = await processNessus(blob, systemList);

        nessusResults.push(nessusResult);
        nessusFile.push(file);
      });
    }
  }

  await Promise.all(nessusResults);

  return { nessus: isNessus, results: nessusResults, files: nessusFile };
}
