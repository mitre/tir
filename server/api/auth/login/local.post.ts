import { H3Error } from "h3";
import { getAuthServiceManager } from "~/server/auth/authServiceManager";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const authService = getAuthServiceManager();

  try {
    const result = await authService.authenticate("local", event, body);
    return { success: true, data: result };
  } catch (error) {
    let errorMessage = "An unknown error occurred";

    // Handle H3Error (errors created using createError)
    if (error instanceof H3Error) {
      errorMessage = error.message;
    }
    // Handle standard Error objects
    else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, message: errorMessage };
  }
});
