import { parseStringPromise } from "xml2js";
import { DateTime } from "luxon";
import { PerfTimer } from "./perfTimer";
import { NessusReport } from "~/db/models/nessusReport";
import { NessusPluginFamily } from "~/db/models/nessusPluginFamily";
import { NessusServiceName } from "~/db/models/nessusServiceName";
import { NessusPlugin } from "~/db/models/nessusPlugin";
import { Cve } from "~/db/models/cve";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { Boundary } from "~/db/models/boundary";
import { Protocol } from "~/db/models/protocols";
import { System } from "~/db/models/system";
import { EvaluationItem } from "~/db/models/evaluationItem";
import { NessusPlugin_Boundary } from "~/db/models";
import { NessusOverride } from "~/db/models/nessusOverride";

export type NessusMatch = {
  SystemId: number;
  NessusHostName: string;
};

export async function importNessus(xmlContent: string, nessusMatches: NessusMatch[]) {
  const perfTimer = new PerfTimer();

  perfTimer.enable();
  // const hash = hashObj(xmlContent);

  const boundaryId = (await System.findByPk(nessusMatches[0].SystemId))?.BoundaryId;

  const jsonObj = await parseStringPromise(xmlContent, { explicitArray: true });

  const currentProtocols = await Protocol.findAll();
  const currentNessusPluginFamily = await NessusPluginFamily.findAll();
  const currentNessusServiceNames = await NessusServiceName.findAll();
  const currentNessusPlugins = await NessusPlugin.findAll();
  const currentCves = await Cve.findAll();
  const currentNessusReports = await NessusReport.findAll({
    include: [
      {
        model: System,
        attributes: ["id"],
        include: [
          { model: Boundary, attributes: ["id"], required: true, where: { id: boundaryId } },
        ],
      },
      { model: NessusReportItem, attributes: ["id", "NessusPluginId"] },
    ],
  });
  const currentNessusPluginBoundary = await NessusPlugin_Boundary.findAll({
    where: { BoundaryId: boundaryId },
  });
  const currentNessusOverrides = await NessusOverride.findAll({
    include: {
      model: System,
      required: true,
      attributes: [],
      include: [
        {
          model: Boundary,
          where: { id: boundaryId },
          required: true,
          attributes: [],
        },
      ],
    },
  });

  for (const host of jsonObj.NessusClientData_v2.Report[0].ReportHost) {
    console.log(host.$.name);
    const nessusName = host.$.name;
    perfTimer.start("systemDBSearch");
    const systemMatch = nessusMatches.find((item) => item.NessusHostName === nessusName);
    perfTimer.stop("systemDBSearch");

    if (!systemMatch) {
      continue;
    }
    const hash = hashObj(host);

    const identicalReport = await currentNessusReports.find(
      (report) =>
        report.hash === hash &&
        report.reportHostName === systemMatch.NessusHostName &&
        report.SystemId === systemMatch.SystemId,
    );

    if (identicalReport) {
      continue;
    }

    const misAssignedReport = await currentNessusReports.find(
      (report) => report.hash === hash && report.reportHostName === systemMatch.NessusHostName,
    );

    misAssignedReport?.destroy();

    const oldReport = await currentNessusReports.find(
      (report) => report.SystemId === systemMatch.SystemId,
    );

    const nessusReport = await NessusReport.create({
      name:
        jsonObj.NessusClientData_v2.Report[0].$?.name || `${host.$.name}_${DateTime.now().toISO()}`,
      hash,
      SystemId: systemMatch.SystemId,
      reportHostName: systemMatch.NessusHostName,
    });

    for (const item of host.ReportItem) {
      console.log(item.$.pluginName);

      const existingProtocol = currentProtocols.find(
        (protocol) => `${protocol.name}` === item.$.protocol,
      );

      const protocol: Protocol =
        existingProtocol ?? (await Protocol.create({ name: item.$.protocol }));

      if (!existingProtocol) {
        currentProtocols.push(protocol);
      }
      const existingPluginFamily = currentNessusPluginFamily.find(
        (npf) => `${npf.name}` === item.$.pluginFamily,
      );
      const nessusPluginFamily: NessusPluginFamily =
        existingPluginFamily ?? (await NessusPluginFamily.create({ name: item.$.pluginFamily }));

      if (!existingPluginFamily) {
        currentNessusPluginFamily.push(nessusPluginFamily);
      }
      const existingNessusServiceName = currentNessusServiceNames.find(
        (nsn) => `${nsn.name}` === item.$.svc_name,
      );
      const nessusServiceName: NessusServiceName =
        existingNessusServiceName ?? (await NessusServiceName.create({ name: item.$.svc_name }));

      if (!existingNessusServiceName) {
        currentNessusServiceNames.push(nessusServiceName);
      }
      const existingNessusPlugin = currentNessusPlugins.find(
        (np) =>
          `${np.pluginId}-${DateTime.fromISO(np.pluginPublicationDate).toFormat("yyyy/MM/dd")}-${
            DateTime.fromISO(np.pluginModificationDate).toFormat("yyyy/MM/dd") || "NULL"
          }` ===
          `${item.$.pluginID}-${item.plugin_publication_date[0]}-${
            item.plugin_modification_date[0] || "NULL"
          }`,
      );
      const nessusPlugin: NessusPlugin =
        existingNessusPlugin ??
        (await NessusPlugin.create({
          pluginId: item.$.pluginID,
          pluginPublicationDate: DateTime.fromFormat(
            item.plugin_publication_date[0],
            "yyyy/MM/dd",
          ).toISO()!, // previously validated by xsd,
          pluginModificationDate: DateTime.fromFormat(
            item.plugin_modification_date[0],
            "yyyy/MM/dd",
          ).toISO()!, // previously validated by xsd
          pluginName: item.$.pluginName,
          fname: item.fname[0],
          scriptVersion: item.script_version[0],
          severity: parseInt(item.$.severity, 10),
          pluginType: item.plugin_type[0],
          riskFactor: item.risk_factor[0],
          description: item.description[0],
          synopsis: item.synopsis[0],
          solution: item.solution[0],
          NessusPluginFamilyId: nessusPluginFamily.id,
        }));
      if (!existingNessusPlugin) {
        currentNessusPlugins.push(nessusPlugin);
      }
      const filteredOverrides = currentNessusOverrides.filter(
        (element) =>
          element.SystemId === systemMatch.SystemId && element.NessusPluginId === item.$.pluginID,
      );

      const severityOverrideString = filteredOverrides.find(
        (overrideLock) => overrideLock.type === "severity",
      )?.value;
      const severityOverride = severityOverrideString ? Number(severityOverrideString) : null;
      const statusOverride =
        filteredOverrides.find((overrideLock) => overrideLock.type === "status")?.value ?? null;

      const newNessusReportItem = await NessusReportItem.create({
        port: item.$.port,
        ageOfVuln: item.age_of_vuln?.[0] || null,
        cisaKnownExploited: item["cisa-known-exploited"]?.[0] || null,
        agent: item.agent?.[0] || null,
        alwaysRun: item.alwaysRun?.[0] || null,
        assetCategories: item.asset_categories?.[0] || null,
        assetInventory: item.asset_inventory?.[0] || null,
        assetInventoryCategory: item.asset_inventory_category?.[0] || null,
        bid: item.bid?.[0] || null,
        cvss3TemporalVector: item.cvss3_temporal_vector?.[0] || null,
        cvss3TemporalScore: item.cvss3_temporal_score?.[0] || null,
        cvssTemporalScore: item.cvss3_temporal_score?.[0] || null,
        cvssTemporalVector: item.cvss_temporal_vector?.[0] || null,
        cert: item.cert?.[0] || null,
        canvasPackage: item.canvas_package?.[0] || null,
        ceaId: item["cea-id"]?.[0] || null,
        NessusPluginId: nessusPlugin.id,
        NessusServiceNameId: nessusServiceName.id,
        ProtocolId: protocol.id,
        NessusReportId: nessusReport.id,
        pluginOutput: item.plugin_output?.[0],
        severityOverride,
        severityOverrideJustification: "",
        statusOverride,
        statusOverrideJustification: "",
      });

      const existingNessusPluginBoundary = currentNessusPluginBoundary.find(
        (npb) => npb.NessusPluginId === nessusPlugin.id,
      );

      if (!existingNessusPluginBoundary) {
        const newEvaluationItem = await EvaluationItem.create();
        const newNessusPluginBoundary = await NessusPlugin_Boundary.create({
          BoundaryId: boundaryId,
          NessusPluginId: nessusPlugin.id,
          EvaluationItemId: newEvaluationItem.id,
        });

        currentNessusPluginBoundary.push(newNessusPluginBoundary);
      }
      // if (oldReport && oldReport.NessusReportItems) {
      //   const oldEvalId = oldReport.NessusReportItems.find(
      //     (item) => item.NessusPluginId === nessusPlugin.id,
      //   )?.EvaluationItemId;
      //   if (oldEvalId) {
      //     newNessusReportItem.EvaluationItemId = oldEvalId;
      //   }
      // } else {
      //   const newEvaluationItem = await EvaluationItem.create();
      //   newNessusReportItem.EvaluationItemId = newEvaluationItem.id;
      // }

      // newNessusReportItem.save();

      for (const cveInNessusFile of item.cve ?? []) {
        perfTimer.start("cveSearch");
        const existingCve = currentCves.find((c) => `${c.cveId}` === cveInNessusFile);
        perfTimer.stop("cveSearch");
        let cve: Cve;
        perfTimer.start("cveCreate");
        if (!existingCve) {
          cve = Cve.build();
          cve.cveId = cveInNessusFile;

          if (item.cvss_score_source?.[0] === cveInNessusFile) {
            cve.updateByCvss3Vector(item.cvss3_vector[0]);
          }
          await cve.save();
          currentCves.push(cve);
        } else {
          cve = existingCve;
        }
        cve.addSystem(systemMatch.SystemId);
        cve.addNessusPlugin(nessusPlugin);
      }

      oldReport?.destroy();
    }
  }

  return true;
}
