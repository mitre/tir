import { parseStringPromise } from "xml2js";
import type { ChecklistV3 } from "../server/utils/checklist_v3";

export async function processChecklistV3(xmlContent: any, systemView: any[]) {
  // const jsonObj = await parseStringPromise(xmlContent, { explicitArray: false });

  const jsonObj: ChecklistV3 = await JSON.parse(xmlContent);
  const AssetFromCkl = jsonObj;

  const hostName = jsonObj.target_data.host_name;
  const hostIp = jsonObj.target_data.ip_address;
  const hostMAC = jsonObj.target_data.mac_address;
  const hostFqdn = jsonObj.target_data.fqdn;
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
