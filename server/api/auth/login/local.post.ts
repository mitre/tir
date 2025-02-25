import { defineEventHandler, readBody, H3Error } from "h3";
import { AuthService } from "../../../auth/authService";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const authService = new AuthService();

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
