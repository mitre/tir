// import { Stig, System, SystemWithStigs, Assessment, Timezone } from "../../models";
import { parseStringPromise } from 'xml2js'
import { parseXmlStig } from '../utils/importStig'


export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // const timeZones = Intl.supportedValuesOf('timeZone')
  // console.log(timeZones[20])

  // for(let i = 0; i < timeZones.length; i++){
  // Timezone.create(
  //   {
  //     id: i+1,
  //     name: timeZones[i]
  //   })

  //   console.log(timeZones[i])
  //   }
  let ruleDescriptionString = "<root><VulnDiscussion>SAML is a standard for exchanging authentication and authorization data between security domains. SAML uses security tokens containing assertions to pass information about a principal (usually an end user) between a SAML authority, (identity provider), and a SAML consumer, (service provider). SAML assertions are usually made about a subject, (user) represented by the <Subject> element. SAML assertion identifiers should be unique across a system implementation. Duplicate SAML assertion identifiers could lead to unauthorized access to a web service.</VulnDiscussion><FalsePositives></FalsePositives><FalseNegatives></FalseNegatives><Documentable>false</Documentable><Mitigations></Mitigations><SeverityOverrideGuidance></SeverityOverrideGuidance><PotentialImpacts></PotentialImpacts><ThirdPartyTools></ThirdPartyTools><MitigationControl></MitigationControl><Responsibility></Responsibility><IAControls></IAControls></root>"
  // let ruleDescriptionString = "<root><VulnDiscussion>Display of the DoD-approved use notification before granting access to the application ensures privacy and security notification verbiage used is consistent with applicable federal laws, Executive Orders, directives, policies, regulations, standards, and guidance.\n\nSystem use notifications are required only for access via logon interfaces with human users and are not required when such human interfaces do not exist.\n\nThe banner must be formatted in accordance with DTM-08-060. Use the following verbiage for applications that can accommodate banners of 1300 characters:\n\n\"You are accessing a U.S. Government (USG) Information System (IS) that is provided for USG-authorized use only.\n\nBy using this IS (which includes any device attached to this IS), you consent to the following conditions:\n\n-The USG routinely intercepts and monitors communications on this IS for purposes including, but not limited to, penetration testing, COMSEC monitoring, network operations and defense, personnel misconduct (PM), law enforcement (LE), and counterintelligence (CI) investigations.\n\n-At any time, the USG may inspect and seize data stored on this IS.\n\n-Communications using, or data stored on, this IS are not private, are subject to routine monitoring, interception, and search, and may be disclosed or used for any USG-authorized purpose.\n\n-This IS includes security measures (e.g., authentication and access controls) to protect USG interests--not for your personal benefit or privacy.\n\n-Notwithstanding the above, using this IS does not constitute consent to PM, LE or CI investigative searching or monitoring of the content of privileged communications, or work product, related to personal representation or services by attorneys, psychotherapists, or clergy, and their assistants. Such communications and work product are private and confidential. See User Agreement for details.\"\n\nUse the following verbiage for operating systems that have severe limitations on the number of characters that can be displayed in the banner:\n\n\"I've read & consent to terms in IS user agreem't.\"</VulnDiscussion><FalsePositives></FalsePositives><FalseNegatives></FalseNegatives><Documentable>false</Documentable><Mitigations></Mitigations><SeverityOverrideGuidance></SeverityOverrideGuidance><PotentialImpacts></PotentialImpacts><ThirdPartyTools></ThirdPartyTools><MitigationControl></MitigationControl><Responsibility></Responsibility><IAControls></IAControls></root>"
  // let ruleDescriptionString = "<root><VulnDiscussion>\"I've read & consent to terms in IS user agreem't.\"</VulnDiscussion><FalsePositives></FalsePositives><FalseNegatives></FalseNegatives><Documentable>false</Documentable><Mitigations></Mitigations><SeverityOverrideGuidance></SeverityOverrideGuidance><PotentialImpacts></PotentialImpacts><ThirdPartyTools></ThirdPartyTools><MitigationControl></MitigationControl><Responsibility></Responsibility><IAControls></IAControls></root>"
  
  function fixBetweenTags(input: string, startTag: string, endTag: string): string {
    const regex = new RegExp(`${startTag}(.*?${endTag})`, 'gs');
    
    return input.replace(regex, (match: string) => {
      const content = match.slice(startTag.length, -endTag.length);
      // const replacedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
      const replacedContent = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return startTag + replacedContent + endTag;
    });
  }

  // const results = fixBetweenTags(ruleDescriptionString, "<VulnDiscussion>","</VulnDiscussion>")
  
  // const ruleDescription = await parseStringPromise(results, { explicitArray: false });
  const xmlFile = body.xmlFile;
  const SLID = body.SLID
  const parseResults = await parseXmlStig(xmlFile, SLID);  
  return parseResults;
})  

