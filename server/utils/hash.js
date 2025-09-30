import * as crypto from "crypto";
import * as fs from "fs";

export const hashObj = (objToHash, algorithhm = "sha256") => {
  const jsonString = JSON.stringify(objToHash, Object.keys(objToHash).sort());

  const hash = crypto.createHash(algorithhm);
  hash.update(jsonString);

  return hash.digest("hex");
};

export const hashFile = async (filePath, algorithhm = "sha256") => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithhm);
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => {
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

export function hashPassword(password, salt, secretKey) {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(password);
  const hmacResult = hmac.digest();

  return crypto.pbkdf2Sync(hmacResult, salt, 600000, 64, "sha256").toString("hex");
}

export function verifyPassword(inputPassword, storedHash, salt, secretKey) {
  const inputHash = hashPassword(inputPassword, salt, secretKey);
  return storedHash === inputHash;
}

export function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString("hex");
}
