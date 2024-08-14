import * as crypto from "crypto";
import * as fs from "fs";

export const hashObj = (objToHash: any, algorithhm: string = "sha256"): string => {
  const jsonString = JSON.stringify(objToHash, Object.keys(objToHash).sort());

  const hash = crypto.createHash(algorithhm);
  hash.update(jsonString);

  return hash.digest("hex");
};

export const hashFile = async (
  filePath: string,
  algorithhm: string = "sha256",
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithhm);
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk: Buffer) => {
      hash.update(chunk);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
};

export function hashPassword(password: string, salt: string, secretKey: string): string {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(password);
  const hmacResult = hmac.digest();

  return crypto.pbkdf2Sync(hmacResult, salt, 600000, 64, "sha256").toString("hex");
}

export function verifyPassword(
  inputPassword: string,
  storedHash: string,
  salt: string,
  secretKey: string,
): boolean {
  const inputHash = hashPassword(inputPassword, salt, secretKey);
  return storedHash === inputHash;
}

export function generateSalt(length: number = 16): string {
  return crypto.randomBytes(length).toString("hex");
}
