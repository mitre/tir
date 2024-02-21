export default defineEventHandler(async (event) => {
  const title = [
    { title: "NIST SP 800-53", version: 3 },
    { title: "NIST SP 800-53 Revision 4", version: 4 },
    { title: "NIST SP 800-53 Revision 5", version: 5 },
    { title: "NIST SP 800-53A", version: 1 },
  ];
  return title;
});
