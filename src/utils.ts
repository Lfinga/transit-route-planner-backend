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

export function buildStopsQuery(filters: StopFilters) {
  let query = "SELECT id, name, location, created_at FROM stops";
  const params: string[] = [];

  if (filters.name) {
    query += " WHERE LOWER(name) LIKE LOWER($1)";
    params.push(`%${filters.name}%`);
  }

  return { query, params };
}
