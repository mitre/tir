import { parseStringPromise } from "xml2js";

export async function processNessus(xmlContent: any, systemView: any[]) {
  let netBiosName = "N/A";
  let hostName = "N/A";
  let hostIp = "N/A";
  let hostMAC = "N/A";
  let hostFqdn = "N/A";
  let systemId = null;
  let credentialed = "";
  const totalSystemIDs: any[] = [];
  const hostArray = [];
  const jsonObj = await parseStringPromise(xmlContent, { explicitArray: false });
  const reportHost = jsonObj.NessusClientData_v2.Report.ReportHost;
  if (reportHost.length > 0) {
    console.log("Multiple Hosts");
    for (let i = 0; i < reportHost.length; i++) {
      let netBiosName = "N/A";
      let hostName = "N/A";
      let hostIp = "N/A";
      let hostMAC = "N/A";
      let hostFqdn = "N/A";
      let systemId = null;
      let credentialed = "";

      const credentialedResult = jsonObj.NessusClientData_v2.Report.ReportHost[
        i
      ].HostProperties.tag.filter(
        (tag: { $: { name: string } }) => tag.$.name === "Credentialed_Scan",
      );
      const tagResults = jsonObj.NessusClientData_v2.Report.ReportHost[i].HostProperties.tag.filter(
        (tag: { $: { name: string } }) => tag.$.name === "netbios-name",
      );
      const tagHostResults = jsonObj.NessusClientData_v2.Report.ReportHost[
        i
      ].HostProperties.tag.filter((tag: { $: { name: string } }) => tag.$.name === "hostname");
      const tagIpResults = jsonObj.NessusClientData_v2.Report.ReportHost[
        i
      ].HostProperties.tag.filter((tag: { $: { name: string } }) => tag.$.name === "host-ip");
      const tagMacResults = jsonObj.NessusClientData_v2.Report.ReportHost[
        i
      ].HostProperties.tag.filter((tag: { $: { name: string } }) => tag.$.name === "mac-address");
      const tagFqdnResults = jsonObj.NessusClientData_v2.Report.ReportHost[
        i
      ].HostProperties.tag.filter((tag: { $: { name: string } }) => tag.$.name === "host-fqdn");

      let match = false;

      if (credentialedResult.length > 0 && credentialedResult[0]._ === "true") {
        credentialed = credentialedResult[0]._;
        if (tagResults.length !== 0 && !match) {
          netBiosName = tagResults[0]._;
          const nameSystems = systemView.find((o) => o.hostName === netBiosName);
          if (nameSystems) {
            totalSystemIDs.push(nameSystems.id);
            systemId = nameSystems.id;
            match = true;
          }
        }
        if (tagIpResults.length !== 0 && !match) {
          hostIp = tagIpResults[0]._;
          const IPsystems = systemView.find((o) => o.hostIP === hostIp);
          if (IPsystems) {
            totalSystemIDs.push(IPsystems.id);
            systemId = IPsystems.id;
            match = true;
          }
        }
        if (tagHostResults.length !== 0 && !match) {
          hostName = tagHostResults[0]._;
          const nameSystems = systemView.find((o) => o.hostName === hostName);
          if (nameSystems) {
            totalSystemIDs.push(nameSystems.id);
            systemId = nameSystems.id;
            match = true;
          }
        }
        if (tagMacResults.length !== 0 && !match) {
          hostMAC = tagMacResults[0]._;
          const hostMacArray = hostMAC.split("\n");
          hostMacArray.forEach((mac) => {
            const macSystems = systemView.find((o) => o.hostMAC === mac);
            if (macSystems) {
              totalSystemIDs.push(macSystems.id);
              systemId = macSystems.id;
              match = true;
            }
          });
        }
        if (tagFqdnResults.length !== 0 && !match) {
          hostFqdn = tagFqdnResults[0]._;
          const fqdnSystems = systemView.find((o) => o.hostFQDN === hostFqdn);
          if (fqdnSystems) {
            totalSystemIDs.push(fqdnSystems.id);
            systemId = fqdnSystems.id;
            match = true;
          }
        }
      } else {
        credentialed = "false";
      }

      hostArray.push({
        systemMatch: match,
        name: reportHost[i].$.name,
        arrayPosition: i,
        systemId,
        credentialed,
      });
    }
  } else {
    console.log("One Hosts");
    const credentialedResult =
      jsonObj.NessusClientData_v2.Report.ReportHost.HostProperties.tag.filter(
        (tag: { $: { name: string } }) => tag.$.name === "Credentialed_Scan",
      );
    const tagResults = jsonObj.NessusClientData_v2.Report.ReportHost.HostProperties.tag.filter(
      (tag: { $: { name: string } }) => tag.$.name === "netbios-name",
    );
    const tagHostResults = jsonObj.NessusClientData_v2.Report.ReportHost.HostProperties.tag.filter(
      (tag: { $: { name: string } }) => tag.$.name === "hostname",
    );
    const tagIpResults = jsonObj.NessusClientData_v2.Report.ReportHost.HostProperties.tag.filter(
      (tag: { $: { name: string } }) => tag.$.name === "host-ip",
    );
    const tagMacResults = jsonObj.NessusClientData_v2.Report.ReportHost.HostProperties.tag.filter(
      (tag: { $: { name: string } }) => tag.$.name === "mac-address",
    );
    const tagFqdnResults = jsonObj.NessusClientData_v2.Report.ReportHost.HostProperties.tag.filter(
      (tag: { $: { name: string } }) => tag.$.name === "host-fqdn",
    );

    let match = false;

    if (credentialedResult.length > 0 && credentialedResult[0]._ === "true") {
      credentialed = credentialedResult[0]._;
      if (tagResults.length !== 0 && !match) {
        netBiosName = tagResults[0]._;
        const nameSystems = systemView.find((o) => o.hostName === netBiosName);
        if (nameSystems) {
          totalSystemIDs.push(nameSystems.id);
          systemId = nameSystems.id;
          match = true;
        }
      }
      if (tagHostResults.length !== 0 && !match) {
        hostName = tagHostResults[0]._;
        const nameSystems = systemView.find((o) => o.hostName === hostName);
        if (nameSystems) {
          totalSystemIDs.push(nameSystems.id);
          systemId = nameSystems.id;
          match = true;
        }
      }
      if (tagIpResults.length !== 0 && !match) {
        hostIp = tagIpResults[0]._;
        const IPsystems = systemView.find((o) => o.hostIP === hostIp);
        if (IPsystems) {
          totalSystemIDs.push(IPsystems.id);
          systemId = IPsystems.id;
          match = true;
        }
      }

      if (tagMacResults.length !== 0 && !match) {
        hostMAC = tagMacResults[0]._;
        const hostMacArray = hostMAC.split("\n");
        hostMacArray.forEach((mac) => {
          const macSystems = systemView.find((o) => o.hostMAC === mac);
          if (macSystems) {
            totalSystemIDs.push(macSystems.id);
            systemId = macSystems.id;
            match = true;
          }
        });
      }
      if (tagFqdnResults.length !== 0 && !match) {
        hostFqdn = tagFqdnResults[0]._;
        const fqdnSystems = systemView.find((o) => o.hostFQDN === hostFqdn);
        if (fqdnSystems) {
          totalSystemIDs.push(fqdnSystems.id);
          systemId = fqdnSystems.id;
          match = true;
        }
      }
    } else {
      credentialed = "false";
    }
    hostArray.push({
      systemMatch: match,
      name: reportHost.$.name,
      arrayPosition: null,
      systemId,
      credentialed,
    });
  }

  return {
    systemID: totalSystemIDs,
    systemName: netBiosName,
    hostArray,
  };
}
