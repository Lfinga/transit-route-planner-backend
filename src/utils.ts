
import { StopFilters } from "./repository/stops";
import { RouteFilters } from "./repository/routes";


export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (error && typeof error === "object" && "message" in error) {
        return String(error.message);
    }
    if (typeof error === "string") {
        return error;
    }
    return "Unknown error";
}

