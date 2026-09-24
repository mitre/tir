import { handleTusUpload } from "~/server/utils/tusServer";

export default defineEventHandler((event) => handleTusUpload(event));
