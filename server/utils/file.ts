import * as fs from "fs";

export function canReadWrite(path: string): boolean {
  try {
    if (fs.existsSync(path)) {
      fs.accessSync(path, fs.constants.R_OK);
      fs.accessSync(path, fs.constants.W_OK);
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

export function pathExists(path: string): boolean {
  return fs.existsSync(path);
}
