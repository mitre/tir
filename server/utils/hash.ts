import * as crypto from 'crypto';
import * as fs from "fs";

export const hashObj = (objToHash: any, algorithhm: string = 'sha256'): string =>{
    const jsonString = JSON.stringify(objToHash, Object.keys(objToHash).sort());
    
    const hash = crypto.createHash(algorithhm);
    hash.update(jsonString);
    
    return hash.digest('hex');
}

export const hashFile = async (filePath: string, algorithhm: string = 'sha256'): Promise<string> => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(algorithhm);
        const stream = fs.createReadStream(filePath);
        
        stream.on('data', (chunk: Buffer) => {
            hash.update(chunk);
        });

        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });

        stream.on('error', (error) => {
            reject(error);
        });
    });
}
