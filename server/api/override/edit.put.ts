import { Override } from "../../../db/models";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  body.lastUpdate = Date.now();
  const override = await Override.findByPk(body.id);
  override?.setDataValue("status", body.name);
  override?.save();
  return override;
});
