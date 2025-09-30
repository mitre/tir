import { parseStringPromise } from "xml2js";

export async function processChecklist(xmlContent: any, systemView: any[]) {
  const jsonObj = await parseStringPromise(xmlContent, { explicitArray: false });
  const AssetFromCkl = jsonObj;

  const hostName = jsonObj.CHECKLIST.ASSET.HOST_NAME;
  const hostIp = jsonObj.CHECKLIST.ASSET.HOST_IP;
  const hostMAC = jsonObj.CHECKLIST.ASSET.HOST_MAC;
  const hostFqdn = jsonObj.CHECKLIST.ASSET.HOST_FQDN;

  let systemId = null;
  let systemName = null;
  const totalSystemIDs: any[] = [];
  const hostArray = [];

  let match = false;

  if (hostName && !match) {
    const nameSystems = systemView.find((o) => o.hostName === hostName);
    if (nameSystems) {
      totalSystemIDs.push(nameSystems.id);
      systemId = nameSystems.id;
      systemName = nameSystems.name;
      match = true;
    }
  }
  if (hostIp && !match) {
    const nameSystems = systemView.find((o) => o.hostIP === hostIp);
    if (nameSystems) {
      totalSystemIDs.push(nameSystems.id);
      systemId = nameSystems.id;
      systemName = nameSystems.name;
      match = true;
    }
  }
  if (hostMAC && !match) {
    const nameSystems = systemView.find((o) => o.hostMAC === hostMAC);
    if (nameSystems) {
      totalSystemIDs.push(nameSystems.id);
      systemId = nameSystems.id;
      systemName = nameSystems.name;
      match = true;
    }
  }
  if (hostFqdn && !match) {
    const nameSystems = systemView.find((o) => o.hostFQDN === hostFqdn);
    if (nameSystems) {
      totalSystemIDs.push(nameSystems.id);
      systemId = nameSystems.id;
      systemName = nameSystems.name;
      match = true;
    }
  }

  hostArray.push({
    systemMatch: match,
    arrayPosition: null,
    systemId,
    systemName,
  });

  return {
    systemId,
    systemName,
    systemMatch: match,
  };
}
