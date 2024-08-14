import * as fs from "fs";
import * as path from "path";
import AdmZip from "adm-zip";

export function zipDirectoryContents(sourceDir: string, outputFile: string) {
  const zip = new AdmZip();

  fs.readdirSync(sourceDir).forEach((file) => {
    const filePath = path.join(sourceDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      zip.addLocalFolder(filePath, file);
    } else {
      zip.addLocalFile(filePath);
    }
  });

  zip.writeZip(outputFile);
}
