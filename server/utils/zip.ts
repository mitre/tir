import * as fs from "fs";
import * as path from "path";
import {ZipFile} from "yazl";

export function zipDirectoryContents(sourceDir: string, outputFile: string): Promise<void> {
  const zip = new ZipFile();
  const writeStream= fs.createWriteStream(outputFile);

  fs.readdirSync(sourceDir).forEach((file) => {
    const filePath = path.join(sourceDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      addFolderToZip(zip, filePath, file);
    } else {
      zip.addFile(filePath, file);
    }
    });

    return new Promise((resolve,reject) => {
      zip.outputStream.pipe(writeStream);
      zip.outputStream.on("error", reject);
      writeStream.on("error", reject);
      writeStream.on("close",resolve);

      zip.end();
    });
}

const addFolderToZip = (zip: ZipFile, folderPath: string, zipPath: string) => {
  fs.readdirSync(folderPath).forEach((file) => {
    const fullPath = path.join(folderPath, file);
    const stat = fs.statSync(fullPath);
    const entryPath = path.posix.join(zipPath.replace(/\\/g, "/"), file);
    if (stat.isDirectory()) {
      addFolderToZip(zip, fullPath, entryPath);
    }
    else {
      zip.addFile(fullPath, entryPath);
    }
    });
}
