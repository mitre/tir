import ExcelJS from "exceljs";
import { Readable } from "node:stream";
import { sendStream } from "h3";
import { NessusPlugin } from "~/db/models/nessusPlugin";
import { NessusReport } from "~/db/models/nessusReport";
import { NessusReportItem } from "~/db/models/nessusReportItem";
import { Boundary, Classification, System } from "~/db/models";

// Type that stores a string, port, and affected hosts
type NessusPort = {
  protocol: string;
  port: number;
  hosts: NessusHost[];
};

// Nessus host information ip and hostname (for ppsm columns)
type NessusHost = {
  ipAddress: string;
  deviceName: string;
};

// Flattens a list of Nessus Host IP Addresses
function getIPs(hosts: NessusHost[]): string {
  var retValue = "";
  var myCtr = 0;
  for (const host of hosts) {
    retValue += host.ipAddress;
    myCtr++;
    if (myCtr != hosts.length) {
      retValue += "\n";
    }
  }
  return retValue;
}

// Flattens a list of Nessus Host names
function getNames(hosts: NessusHost[]): string {
  var retValue = "";
  var myCtr = 0;
  for (const host of hosts) {
    retValue += host.deviceName;
    myCtr++;
    if (myCtr != hosts.length) {
      retValue += "\n";
    }
  }
  return retValue;
}

// Populates the additional notes in the PPSM
function setPPSSheetNotes(sheet: ExcelJS.Worksheet) {
  sheet.getCell("A4").note =
    "State the name of the software and function (when using the same software for multiple puposes) using this PPS (Mandatory)\n\nNOTE: Directly relates to DIACAP IA Control DCSW-1 or NIST 800-53 Security Controls CM-2, CM-7, and CM-8d.";
  sheet.getCell("B4").note =
    'Select Protocol name from drop-down menu. Refer to DISA IASE PPSM web page (http://iase.disa.mil/ppsm/Pages/index.aspx) for VA reports with guidance on accepted protocols for identified Data Service.\n\nDO NOT confuse Protocol "number" with port number and vice versa. For example, Protocol "50" (ESP) should not be confused with service operating over TCP/UDP port 50.\n\nFor those protocols without a port number (ICMP, ESP, AH, etc.), place a "-" in Low and High Port columns and leave "Data Service" column blank.\n\nNOTE: Follow DoD PPS guidance (DoD PPS CAL & PPS VA Reports) for standardized port numbers and data services. Using non-standardized PPS violates DoDI 8551.01.';
  sheet.getCell("C4").note =
    'Select Data Service from drop-down list provided in each cell.\n\nOnly Data Services with formal DoD PPS Vulnerability Assessments (https://disa.deps.mil/ext/cop/iase/ppsm/va-reports/Pages/vulnerability-assessment.aspx) appear in the drop-down list. Please note the VA Reports contain Data Service name variations.\n\nIf your Data Service does not appear in drop-down list, select "NOT LISTED" from drop-down options. Please ensure you\'ve exhausted all name variations before selecting NOT LISTED. Ensure you enter Data Service name in "Data Service NOT LISTED" column.\n\n\nNOTES:\n1. Follow DoD PPS guidance (DoD PPS CAL & PPS VA Reports) for standardized port numbers and data services.\n2. Using non-standardized PPS violates DoDI 8551.01.\n3. A&A process will validate port/service combinations to ensure service being reviewed, approved and registered corresponds with known port for data service specified.\n4. If port/service does not match existing DoD technical guidance, IA Control DCPP-1 or NIST 800-53 Security Control CM-7 remains non-compliant with requirement for POA&M.';
  sheet.getCell("D4").note =
    'Enter name of Data Service used if "NOT LISTED" selected in drop-down list for "Data Service" column. Ensure correct identification of actual Data Service name since DoD will identify this Data Service for a formal vulnerability assessment (see DoDI 8551.01).\n\nIf your Data Service appears in "Data Service" column drop-down list, leave this column blank.\n\nSee "DoD PPS Guidance Compliance" columns for required actions on Data Services "NOT LISTED" in drop-down menu.\n\nNOTES:\n* DO NOT enter Data Service name if system does not use that actual service (i.e., if system uses port 102 for "Cubemate", do not list DoD PPS CAL/VA assigned service of “X.400” or IANA assigned service of "ISO-TSAP")\n* DO NOT enter name of software, suite or manufacturer as Data Service (i.e., GoldenGate Software reflects COTS name, not Data Service name)\n* DO NOT use system name as Data Service name\n\nIncorrect identification of Data Service will impede review, approval and registration processes.';
  sheet.getCell("E4").note =
    'Enter the authorized "Low Port Number" for the Data Service identified in "Data Service" field.\n\nFor those protocols without a port number (ICMP, ESP, AH, etc.), place a "-" in Low and High Port columns.\n\nNOTE: Follow DoD PPS guidance (DoD PPS CAL & PPS VA Reports) for standardized port numbers and data services. Using non-standardized PPS violates DoDI 8551.01.';
  sheet.getCell("F4").note =
    'Enter the authorized "High Port Number" for the Data Service identified in "Data Service" field.\n\nIf not using range of ports, place same port number as Low Port.\n\nNOTE: Follow DoD PPS guidance (DoD PPS CAL & PPS VA Reports) for standardized port numbers and data services. Using non-standardized PPS violates DoDI 8551.01.';
  sheet.getCell("G4").note =
    'If the port or port range is not listed on the DoD PPS VA Report or the Data Service is NOT LISTED, then use this field to "Enter Other Port(s)". Use a dash to indicate a port range, use a comma to separate port numbers, but do not use spaces (for example: 80,8002-8004,8888).';
  sheet.getCell("H4").note =
    'Select "Yes" or "No" to specify whether or not your Port Number and Service combination matches standards from DoD PPS VA report.\n\n- Yes - Port Numbers used match authorized port numbers on applicable DoD PPS VA Report.\n- No - Port Numbers used DO NOT match authorized port numbers on applicable DoD PPS VA Report. Non-compliant with DIACAP IA Control DCPP-1 or NIST 800-53 Security Control CM-7. POA&M entry required. Advise AF PPS to obtain exception with DoD PPSM based upon an operational need.\n- N/A - no DoD PPS VA report exists for your Data Service.\n\nNOTE:\n1. Follow DoD PPS guidance (DoD PPS CAL & PPS VA Reports) for standardized port numbers and data services. Using non-standardized PPS conflicts with DoDI 8551.01.\n2. If you require changes to DoD PPS VA reports based upon supporting documentation (technical, commercial, etc.), please contact AF PPS (af.pps@us.af.mil)';
  sheet.getCell("I4").note =
    'Select "Yes" or "No" to specify whether or not your use of the PPS complies with the authorized network boundaries specified in the applicable DoD PPS VA report.\n\n- Yes - Use of PPS matches authorized network boundaries specified in applicable DoD PPS VA Report.\n- No (POA&M Entry Required) - Use of PPS DOES NOT comply with authorized network boundaries specified in applicable DoD PPS VA Report. Non-compliant with DIACAP IA Control DCPP-1 or NIST 800-53 Security Control CM-7. POA&M entry required. Coordinate with AF PPS to obtain exception with DoD PPSM based upon an operational need.\n- N/A - no DoD PPS VA report exists for your Data Service.\n\nNOTE:\n1. Follow DoD PPS guidance (DoD PPS CAL & PPS VA Reports) for authorized network boundaries. Use across unauthorized network boundaries conflicts with DoDI 8551.01.\n2. If you require changes to DoD PPS VA reports based upon supporting documentation (technical, commercial, etc.), please contact AF PPS (af.pps@us.af.mil)';
  sheet.getCell("J4").note =
    'Identify physical information about PPS connection origin point. Be as specific as possible and ensure consistency with the network topology diagram.\n\n1. Device name - specify name of server or workstation. If multiple devices originate the traffic, specify the devices by group. For example, "Wolf Workstations at multiple AFBs" or "Denmother servers at multiple AFBs" as approrpiate.\n\n2. Location - identify city, base, etc. where PPS connection originates.  Be as specific as possible using "lowest common denominator" principle. For example, "Offutt AFB" for a single location. For multiple locations, you may specify “All AFBs”, "DoD-wide", "public Internet users".\n\nNOTE 1: At a minimum, either the Source or Destination must be explicitly identified to enable implementation of rules for network boundary controls.\n\nNOTE 2: Ensure source information identified remains consistent with System Architecture Documentation, Interconnection Documentation, and network topology diagram (DIACAP IA Controls EBCR, EBPW [for Public WAN or Internet interface], DCFA [External Interfaces] and DCID; or RMF NIST 800-53 Security Controls CA-3, SC-7, PL-2, and CA-3).';
  sheet.getCell("K4").note =
    'Identify IP address (or subnet) where PPS connection originates. Be as specific as possible using the "lowest common denominator" principle when identifying IP address (or subnet if more than one IP).';
  sheet.getCell("L4").note =
    'Identify domain name(s) where PPS connection originates. Be as specific as possible using the "lowest common denominator" principle when identifying domain name. Example: If connection originates from AF Bases, specify "af.mil" as domain name instead of just ".mil" address.';
  sheet.getCell("M4").note =
    'Identify source\'s logical origination point based on DoD Network Connections cited in DoD PPS Vulnerability Assessment reports.\n\nNOTE: Select "Internal Use Only" for traffic that does not leave a single enclave and does not cross any network boundary. If you select this option, the Connection Logical Destination Point must also reflect  "Internal Use Only".';
  sheet.getCell("N4").note =
    'Identify physical information about PPS connection termination point. Be as specific as possible and ensure consistency with the network topology diagram.\n\n1. Device name - specify name of server or workstation. If multiple devices receive the traffic, specify the devices by group. For example, "Wolf Workstations at multiple AFBs" or "Denmother servers at multiple AFBs" as approrpiate.\n\n2. Location - identify city, base, etc. where PPS connection terminates.  Be as specific as possible using "lowest common denominator" principle. For example, "Offutt AFB" for a single location. For multiple locations, you may specify “All AFBs”, "DoD-wide", "public Internet users".\n\nNOTE 1: At a minimum, either the Source or Destination must be explicitly identified to enable implementation of rules for network boundary controls.\n\nNOTE 2: Ensure destination information identified remains consistent with System Architecture Documentation, Interconnection Documentation, and network topology diagram (DIACAP IA Controls EBCR, EBPW [for Public WAN or Internet interface], DCFA [External Interfaces] and DCID; or RMF NIST 800-53 Security Controls CA-3, SC-7, PL-2, and CA-3).';
  sheet.getCell("O4").note =
    'Identify IP address (or subnet) where PPS connection terminates. Be as specific as possible using the "lowest common denominator" principle when identifying IP address (or subnet if more than one IP).';
  sheet.getCell("P4").note =
    'Identify domain name(s) where PPS connection terminates. Be as specific as possible using the "lowest common denominator" principle when identifying domain name. Example: If connection terminates at AF Bases, specify "af.mil" as domain name instead of just .mil" address.';
  sheet.getCell("Q4").note =
    'Identify destination\'s logical termination point based on DoD Network Connections cited in DoD PPS Vulnerability Assessment reports.\n\nNOTE: Select "Internal Use Only" for traffic that does not leave a single enclave and does not cross any network boundary. If you selected "Internal Use Only" for Connection Logical Source Point, this column must also reflect "Internal Use Only".';
  sheet.getCell("R4").note =
    'State description and purpose of PPS.\n\nInclude justification, if applicable. Justification not required for PPS configured according to DoD PPS PPS VA Reports.\n\nPPS without corresponding DoD PPS VA reports require additional information (source and reference documents) citing recommended PPS usage (see AFSSI 8551, para 3.1.3). Incomplete information may delay PPS review, validation, approval and registration.\n\nIf your VPN/Tunnel type did not appear in the drop-down box for "VPN/Tunnel Type" column,  specify VPN/Tunnel information here.\n\nNOTE: Ensure you specify paragraph classification.';
  sheet.getCell("S4").note =
    'The POCs responsible for the information system reviewed the specified PPS and deemed it necessary for functions and services and, therefore, not a candidate for disabling under "least function" according to DIACAP IA Control DCPP-1 or NIST Security Control CM-7(1).\n\n- YES - PPS necessary for essential operations\n- NO (See POA&M) - PPS not necessary; see POA&M for mitigations and/or migration plans';
  sheet.getCell("T4").note =
    '1. Enter name and date ("Last Updated Date") of applicable DoD PPS VA report for use of this PPS. Ensure you check for all possible variations to the service name.\n\n2. If no DoD PPS VA report exists for PPS used (Data Service NOT LISTED), state:\n   a. DoD PPS VA Report Name: Not Listed\n   b. You must complete a PPS Risk Assessment and POA&M.';
  sheet.getCell("U4").note =
    'Select the corresponding Assurance Category from the DoD PPS CAL or VA Report for this PPS. Select "N/A" if no DoD PPS VA report exists for your Data Service.\n\n- GREEN\n- YELLOW\n- RED (BANNED)\n- ORANGE (Exception)\n- GRAY (DAA Approval) - PPS must operate within enclave\'s accreditation boundary; DAA acceptance of risk required; prohibited from traversing DISN\n- Multiple Boundaries (PPS crosses multiple boundaries at different Assurance Levels)\n- Boundary Restriction (PPS not authorized to cross the DISN in the direction indicated)\n- Not Assessed (PPS not assessed for the specified classification of network environment)\n- N/A - No VA Report\n\nUse of RED (BANNED) PPS will require an approved exception from AO/DAA and/or DSAWG. Corresponding POA&M entry required.';
  sheet.getCell("V4").note =
    'Select "Compliant" to indicate use of PPS complies with standards and mitigations from applicable DoD PPS VA Report.\n\nSelect "Non-Compliant (POA&M Required)" to indicate use of PPS does not comply with one or more of standards and/or mitigations from applicable DoD PPS VA Report. If non-compliant, you must create a POA&M entry for non-compliance with applicable controls.\n\nSelect "N/A" if no DoD PPS VA report exists for this PPS.';
  sheet.getCell("W4").note =
    'Select "Yes" or "No" to indicate whether or not POA&M entry necessary for any non-compliance.\n\nPOA&Ms required for:\n* Non-compliance with DoD PPS VA report or\n* When no DoD PPS VA Report exists';
  sheet.getCell("X4").note =
    '1. If no DoD PPS VA report exists for this PPS, complete a PPS Risk Assessment.\n\na. Reference the PPS Risk Assessment name, date and Assurance Level recommendation in this field (see AFSSI 8551, Attachment 3, and AF PPS Wiki page).\n\nb. Submit the PPS Risk Assessment to AF PPS office via appropriate means of transmission based upon sensitivity/classification of information.\n\nc. Create POA&M entry for applicable security control.\n\n2. Your "NOT LISTED" PPS will enter the formal vulnerability assessment and adjudication process as required by DoDI 8551.01.';
  sheet.getCell("Y4").note =
    "Enter date (YYYY-MM-DD) PPS Risk Assessment submitted to AF PPS Office.\n\nLeave blank if no PPS Risk Assessment required.";
}

// Sets PPS Worksheet's Styles (Merges, Sizes, Alignment, Border, )
function setPPSSheetStyle(sheet: ExcelJS.Worksheet, myRow: number) {
  // Merges
  const mergeCells: string[] = [
    "A1:H1",
    "I1:P1",
    "Q1:S1",
    "T1:V1",
    "W1:Y1",
    "A3:I3",
    "J3:M3",
    "N3:Q3",
    "S3:Y3",
    "A" + myRow + ":H" + myRow,
    "I" + myRow + ":P" + myRow,
    "Q" + myRow + ":Y" + myRow,
  ];
  mergeCells.forEach((cell) => {
    sheet.mergeCells(cell);
  });

  // Fonts
  const fontCells: number[] = [1, 3, 4, 5, myRow];
  fontCells.forEach((cell) => {
    sheet.getRow(cell).font = { name: "Calibri", size: 11, bold: true };
  });
  sheet.getRow(2).font = { name: "Calibri", size: 11, bold: true, color: { argb: "00FF0000" } };

  // Alignment
  sheet.getRow(1).alignment = { horizontal: "center", vertical: "top", wrapText: true };
  sheet.getRow(2).alignment = { horizontal: "left", vertical: "top", wrapText: true };
  sheet.getRow(3).alignment = { horizontal: "center", vertical: "top", wrapText: true };
  sheet.getRow(4).alignment = { horizontal: "center", vertical: "top", wrapText: true };
  sheet.getRow(5).alignment = { horizontal: "left", vertical: "top", wrapText: false };
  sheet.getRow(myRow).alignment = { horizontal: "center", vertical: "top", wrapText: false };

  // Height
  const heightCells: [number, number][] = [
    [1, 15.75],
    [2, 30.75],
    [3, 16.5],
    [4, 49.5],
    [5, 15],
    [myRow, 15.75],
  ];
  heightCells.forEach(([cellK, cellV]) => {
    sheet.getRow(cellK).height = cellV;
  });

  // Width
  const widthCells: [number, number][] = [
    [1, 98],
    [2, 9.5],
    [3, 24],
    [4, 7.15],
    [5, 11],
    [6, 11],
    [7, 8],
    [8, 9],
    [9, 11],
    [10, 15],
    [11, 11],
    [12, 7.55],
    [13, 11],
    [14, 15],
    [15, 8],
    [16, 7.15],
    [17, 11],
    [18, 30],
    [19, 12],
    [20, 11],
    [21, 14],
    [22, 10.15],
    [23, 7.15],
    [24, 11],
    [25, 11],
  ];
  widthCells.forEach(([cellK, cellV]) => {
    sheet.getColumn(cellK).width = cellV;
  });

  // Fill
  const fillCells: [string, string][] = [
    ["A1", "caffca"],
    ["I1", "caffca"],
    ["Q1", "caffca"],
    ["T1", "caffca"],
    ["W1", "caffca"],
    ["A3", "e7b7b8"],
    ["J3", "c4d89c"],
    ["N3", "90d152"],
    ["R3", "ccbfda"],
    ["S3", "b4e0e8"],
    ["A4", "f2dcdb"],
    ["B4", "f2dcdb"],
    ["C4", "f2dcdb"],
    ["D4", "f2dcdb"],
    ["E4", "f2dcdb"],
    ["F4", "f2dcdb"],
    ["G4", "f2dcdb"],
    ["H4", "f2dcdb"],
    ["I4", "f2dcdb"],
    ["J4", "bacbe4"],
    ["K4", "bacbe4"],
    ["L4", "bacbe4"],
    ["M4", "bacbe4"],
    ["N4", "90d152"],
    ["O4", "90d152"],
    ["P4", "90d152"],
    ["Q4", "90d152"],
    ["R4", "ccbfda"],
    ["S4", "b4e0e8"],
    ["T4", "b4e0e8"],
    ["U4", "b4e0e8"],
    ["V4", "b4e0e8"],
    ["W4", "b4e0e8"],
    ["X4", "b4e0e8"],
    ["Y4", "b4e0e8"],
    ["A5", "bacbe4"],
    ["A" + myRow, "caffca"],
    ["I" + myRow, "caffca"],
    ["Q" + myRow, "caffca"],
  ];
  fillCells.forEach(([cellK, cellV]) => {
    sheet.getCell(cellK).fill = { type: "pattern", pattern: "solid", fgColor: { argb: cellV } };
  });

  const bottomBorderCells: string[] = [
    "A1",
    "I1",
    "Q1",
    "T1",
    "W1",
    "A" + myRow,
    "I" + myRow,
    "Q" + myRow,
  ];
  bottomBorderCells.forEach((cell) => {
    sheet.getCell(cell).border = { bottom: { style: "medium" } };
  });

  const bottomTopBorderCells: string[] = ["A3", "J3", "N3", "R3", "S3"];
  bottomTopBorderCells.forEach((cell) => {
    sheet.getCell(cell).border = { bottom: { style: "double" }, top: { style: "double" } };
  });

  sheet.getCell("A4").border = {
    bottom: { style: "medium" },
    right: { style: "thin" },
    left: { style: "thin" },
  };

  const bottomRightBorderCells: string[] = [
    "B4",
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "H4",
    "I4",
    "J4",
    "K4",
    "L4",
    "M4",
    "N4",
    "O4",
    "P4",
    "Q4",
    "R4",
    "S4",
    "T4",
    "U4",
    "V4",
    "W4",
    "X4",
    "Y4",
  ];
  bottomRightBorderCells.forEach((cell) => {
    sheet.getCell(cell).border = { bottom: { style: "medium" }, right: { style: "thin" } };
  });
}

// Sets Cover Sheet Styles
export function SetCoverSheetStyle(sheet: ExcelJS.Worksheet, font: string) {
  // Merges
  const mergeCells: string[] = ["B2:C2", "B4:C4", "B8:C8", "B9:C9", "B11:C11", "B13:C13"];
  mergeCells.forEach((cell) => {
    sheet.mergeCells(cell);
  });

  // Fonts
  const fontCells: [number, number, boolean][] = [
    [2, 22, true],
    [4, 12, true],
    [6, 11, false],
    [8, 11, true],
    [9, 11, true],
    [11, 11, true],
  ];
  fontCells.forEach(([cellRow, cellSize, cellBold]) => {
    sheet.getRow(cellRow).font = { name: font, size: cellSize, bold: cellBold };
  });

  // Alignment
  sheet.getRow(2).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getRow(4).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getRow(6).alignment = { horizontal: "left", vertical: "top", wrapText: true };
  sheet.getRow(8).alignment = { horizontal: "center", vertical: "top", wrapText: true };
  sheet.getRow(9).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getRow(11).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

  // Height
  const heightCells: [number, number][] = [
    [1, 38],
    [2, 130],
    [3, 5.25],
    [4, 78],
    [5, 11.25],
    [6, 80.25],
    [7, 11.25],
    [8, 11.25],
    [9, 90.75],
    [10, 11.25],
    [11, 81.75],
    [12, 9],
    [13, 45.75],
    [14, 9],
  ];
  heightCells.forEach(([cellK, cellV]) => {
    sheet.getRow(cellK).height = cellV;
  });

  // Width
  const widthCells: [number, number][] = [
    [1, 6],
    [2, 44],
    [3, 44],
    [4, 6],
  ];
  widthCells.forEach(([cellK, cellV]) => {
    sheet.getColumn(cellK).width = cellV;
  });

  // Borders (theres no elegant way to condense this)
  sheet.getCell("B2").border = {
    bottom: { style: "thin" },
    top: { style: "medium" },
    right: { style: "medium" },
    left: { style: "medium" },
  };
  sheet.getCell("B4").border = {
    bottom: { style: "thin" },
    top: { style: "thin" },
    right: { style: "medium" },
    left: { style: "medium" },
  };
  sheet.getCell("B6").border = {
    bottom: { style: "thin" },
    top: { style: "thin" },
    right: { style: "thin" },
    left: { style: "medium" },
  };
  sheet.getCell("C6").border = {
    bottom: { style: "thin" },
    top: { style: "thin" },
    right: { style: "medium" },
  };
  sheet.getCell("B13").border = {
    bottom: { style: "medium" },
    right: { style: "medium" },
    left: { style: "medium" },
  };
  sheet.getCell("B8").border = {
    top: { style: "thin" },
    right: { style: "medium" },
    left: { style: "medium" },
  };
  sheet.getCell("B9").border = { right: { style: "medium" }, left: { style: "medium" } };
  sheet.getCell("B11").border = { right: { style: "medium" }, left: { style: "medium" } };
  sheet.getCell("B3").border = { left: { style: "medium" } };
  sheet.getCell("B5").border = { left: { style: "medium" } };
  sheet.getCell("B7").border = { left: { style: "medium" } };
  sheet.getCell("B10").border = { left: { style: "medium" } };
  sheet.getCell("B12").border = { left: { style: "medium" } };
  sheet.getCell("C3").border = { right: { style: "medium" } };
  sheet.getCell("C5").border = { right: { style: "medium" } };
  sheet.getCell("C7").border = { right: { style: "medium" } };
  sheet.getCell("C10").border = { right: { style: "medium" } };
  sheet.getCell("C12").border = { right: { style: "medium" } };
}

// Sets Revision Sheet Styles
function setRevSheetStyle(row: number, endNumber: number, sheet: ExcelJS.Worksheet) {
  for (let i = row; i <= endNumber; i++) {
    sheet.getRow(i).font = { name: "Times New Roman", size: 11, bold: false };
    sheet.getRow(i).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    sheet.getCell("A" + i).border = {
      bottom: { style: "thin" },
      left: { style: "medium" },
      right: { style: "thin" },
    };
    sheet.getCell("B" + i).border = { bottom: { style: "thin" }, right: { style: "thin" } };
    sheet.getCell("C" + i).border = { bottom: { style: "thin" }, right: { style: "thin" } };
    sheet.getCell("D" + i).border = { bottom: { style: "thin" }, right: { style: "thin" } };
    sheet.getCell("E" + i).border = { bottom: { style: "thin" }, right: { style: "medium" } };
  }

  for (let i = 3; i < 19; i++) {
    sheet.getRow(i).height = 15;
  }

  // Width
  const widthCells: [number, number][] = [
    [1, 17],
    [2, 17],
    [3, 17],
    [4, 17],
    [5, 24],
  ];
  widthCells.forEach(([cellK, cellV]) => {
    sheet.getColumn(cellK).width = cellV;
  });

  sheet.getRow(3).font = { name: "Arial", size: 12, bold: true };
  sheet.getRow(4).font = { name: "Arial", size: 10, bold: true };

  sheet.getRow(3).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  sheet.getRow(4).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

  // Fill
  const fillCells: [string, string][] = [
    ["A3", "cdfec9"],
    ["A4", "c0c0c0"],
    ["B4", "c0c0c0"],
    ["C4", "c0c0c0"],
    ["D4", "c0c0c0"],
    ["E4", "c0c0c0"],
  ];
  fillCells.forEach(([cellK, cellV]) => {
    sheet.getCell(cellK).fill = { type: "pattern", pattern: "solid", fgColor: { argb: cellV } };
  });

  sheet.getCell("A3").border = {
    top: { style: "medium" },
    bottom: { style: "medium" },
    left: { style: "medium" },
    right: { style: "medium" },
  };
  sheet.getCell("A4").border = {
    bottom: { style: "thin" },
    left: { style: "medium" },
    right: { style: "thin" },
  };
  sheet.getCell("A18").border = {
    bottom: { style: "medium" },
    left: { style: "medium" },
    right: { style: "thin" },
  };

  const bottomRightBorderCells: [string, string, string][] = [
    ["B4", "thin", "thin"],
    ["C4", "thin", "thin"],
    ["D4", "thin", "thin"],
    ["E4", "thin", "medium"],
    ["B18", "medium", "thin"],
    ["C18", "medium", "thin"],
    ["D18", "medium", "thin"],
    ["E18", "medium", "medium"],
  ];
  bottomRightBorderCells.forEach(([cell, bottom, right]) => {
    sheet.getCell(cell).border = { bottom: { style: bottom }, right: { style: right } };
  });
}

// Returns a specific system by SystemID
function getSystem(systems: System[], systemID: number): System | null {
  for (const sys of systems) {
    if (sys.id == systemID) {
      return sys;
    }
  }

  return null;
}

// Adds a nessus port object to the Nessus Port array, checks for matching ports/protocols and updates hosts
function addNessusPort(newPort: NessusPort, ports: NessusPort[]): NessusPort[] {
  var foundPort = false;
  for (const port of ports) {
    if (port.protocol == newPort.protocol && port.port == newPort.port) {
      port.hosts.push(newPort.hosts[0]);
      foundPort = true;
    }
  }
  if (!foundPort) {
    ports.push(newPort);
  }

  return ports;
}

export default defineEventHandler(async (event) => {
  const body = await getQuery(event);
  const checkResult = await userCheck(event, undefined, body.BoundaryId, undefined);
  if (checkResult.BoundaryRoleId) {
    const boundary = await Boundary.findOne({ where: { id: body.BoundaryId } });
    if (!boundary) {
      throw createError({
        statusCode: 400,
        statusMessage: `No Existing Boundary with specified ID found: \n` + body.BoundaryId,
      });
    }
    const systems = await System.findAll({ where: { BoundaryId: body.BoundaryId } });
    var reports: NessusReport[] = [];
    for (const system of systems) {
      const report = await NessusReport.findOne({
        where: { SystemId: system.id },
        include: [
          {
            model: NessusReportItem,
            include: [
              {
                model: NessusPlugin,
              },
            ],
          },
        ],
      });
      if (report != null) {
        reports.push(report);
      } else {
        console.log("No report data for system", system.id);
      }
    }

    var portList: NessusPort[] = [];

    for (const report of reports) {
      if (report) {
        if (report.NessusReportItems) {
          for (const nri of report.NessusReportItems) {
            if (nri.NessusPlugin) {
              if (nri.NessusPlugin.NessusPluginFamilyId == 9) {
                if (nri.pluginOutput.includes("was found to be open")) {
                  console.log(nri.dataValues.NessusPlugin.description);
                  var myPortNumber: number = +nri.pluginOutput.split("/", -1)[0].split(" ")[1];
                  var myProtocol = nri.pluginOutput.split("/", -1)[1].split(" ")[0];
                  const mySystem = getSystem(systems, report.SystemId);
                  if (mySystem) {
                    const myHost: NessusHost = {
                      deviceName: mySystem.dataValues.name,
                      ipAddress: report.reportHostName,
                    };
                    const myPort: NessusPort = {
                      protocol: myProtocol,
                      port: myPortNumber,
                      hosts: [myHost],
                    };
                    portList = addNessusPort(myPort, portList);
                  }
                }
              }
            }
          }
        }
      }
    }

    const workbook = new ExcelJS.Workbook();

    const coverSheet = workbook.addWorksheet("Cover Page");
    coverSheet.insertRow(2, ["", "Environment PORTS, PROTOCOLS & SERVICES MATRIX", "", ""]);
    coverSheet.insertRow(4, [
      "",
      "Document No:\nDate:\nDocument Type: Design\nData Maturity: Initial",
      "",
      "",
    ]);
    coverSheet.insertRow(6, [
      "",
      "Prepared by:\nOrganization\n\nAddress\nCity, STATE Z1PC0",
      "Authorized by:",
      "",
    ]);
    coverSheet.insertRow(8, ["", "<Insert copyright>", "", ""]);
    coverSheet.insertRow(9, ["", "<Insert INFORMATION DISCLOSURE WARNING>", "", ""]);
    coverSheet.insertRow(11, ["", "<Insert EXPORT CONTROLLED INFORMATION NOTICE>", "", ""]);
    SetCoverSheetStyle(coverSheet, "Times New Roman");

    const revSheet = workbook.addWorksheet("Revision History");
    revSheet.insertRow(3, ["Revision Log"]);
    revSheet.insertRow(4, ["Revision", "Date", "ERB #", "Change Author", "Change Summary"]);
    revSheet.mergeCells("A3:E3");
    setRevSheetStyle(5, 17, revSheet);

    const sheet = workbook.addWorksheet("Environment - PPS");
    sheet.views = [{ zoomScale: 100 }];
    sheet.columns = [
      {
        width: 12,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "center", vertical: "top", wrapText: true },
        },
      },
      {
        width: 22,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 25,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 30,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 17,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 34,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 28,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 14,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 10,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 51,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 16,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 52,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 52,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 52,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 30,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 52,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
      {
        width: 52,
        style: {
          font: { name: "Calibri", size: 10 },
          alignment: { horizontal: "left", vertical: "top", wrapText: true },
        },
      },
    ];

    const header_footer: string[] = [
      "Table 2: PPS Information",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "FOR OFFICIAL USE ONLY",
    ];

    const general_headers: string[] = [
      "PPS Details",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Source Information",
      "",
      "",
      "",
      "Destination Information",
      "",
      "",
      "",
      "PPS Information",
      "Compliance with DoD PPS Guidance",
    ];

    const headers: string[] = [
      "Software Name and Function",
      "Protocol",
      "Data Service",
      'Data Service\nNOT LISTED\nin Column "C"\n(Risk Assessment & POA&M Required)',
      "Authorized Low Port",
      "Authorized High Port",
      "Other Port(s)",
      "Port Number & Data Service Match DoD PPS VA Report?",
      "Used Across Authorized Network Boundaries?",
      "Source Physical Information\n1. Device Name\n2. City, base, etc.",
      "Source IP Address*",
      "Source Domain Name",
      "Connection Logical Source Point",
      "Destination Physical Information\n1. Device Name\n2. City, base, etc.",
      "Destination IP Address*",
      "Destination Domain Name",
      "Connection Logical Destination Point",
      "PPS\nDescription and Purpose",
      "Necessary PPS?",
      'Applicable DoD PPS VA Report\n(Name and "Last Updated" Date)',
      "Assurance Category",
      "Compliant or\nNon-Compliant\nwith DoD PPS VA Report?",
      "POA&M Entry?",
      "PPS Risk Assessment (RA)\n(Name, Date, & Level)",
      "Date PPS RA Submitted\n(YYYY-MM-DD)",
    ];

    sheet.insertRow(1, header_footer);
    sheet.insertRow(2, [
      "***There are notes that explain the information needed for each required entry below.  Put your cursor over the column name to see the note.",
    ]);
    sheet.insertRow(3, general_headers);
    sheet.insertRow(4, headers);
    sheet.insertRow(5, ["1. Environment Name"]);

    setPPSSheetNotes(sheet);

    const poamArray: string[][] = [];
    var myRow = 6;
    for (const np of portList) {
      const newRow = [
        "",
        np.protocol,
        "",
        "",
        np.port,
        np.port,
        "",
        "",
        "",
        getNames(np.hosts),
        getIPs(np.hosts),
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ];
      poamArray.push(newRow);
      sheet.getRow(myRow).height = 30.75;
      myRow++;
    }
    interface BoundaryWithClassification extends Boundary {
      Classification?: Classification;
    }

    const thisBoundary = (await Boundary.findOne({
      where: { id: body.BoundaryId },
      include: { model: Classification },
    })) as BoundaryWithClassification;

    //export color in per classification, header, and fotter
    let classificationString = `${thisBoundary?.Classification?.dataValues.name}`;
    if (thisBoundary?.caveats) {
      classificationString += `// ${thisBoundary?.caveats}`;
    }

    sheet.headerFooter.oddHeader = classificationString;
    sheet.headerFooter.oddFooter = classificationString;
    sheet.mergeCells("A5:Y5");
    sheet.insertRows(6, poamArray, "o");

    const myRows = sheet.getRows(6, portList.length);
    for (let i = 0; i < portList.length; i++) {
      const row = sheet.getRow(i + 6);

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { name: "Calibri", size: 11, bold: false };
        cell.alignment = { horizontal: "center", vertical: "top", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          right: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
        };
      });
    }

    sheet.autoFilter = "A4:Y" + (portList.length + 4);
    sheet.insertRow(portList.length + 6, header_footer);
    setPPSSheetStyle(sheet, myRow);

    const buffer = await workbook.xlsx.writeBuffer();
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    setResponseHeader(event, "Content-Disposition", 'attachment; filename="ppsm.xlsx"');
    setResponseHeader(event, "Content-Type", "application/octet-stream");
    logger.info({
      service: "Boundary",
      message: `${body.userEmail} Generated PPSM for: ${boundary.name}`,
    });
    return sendStream(event, stream);
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
