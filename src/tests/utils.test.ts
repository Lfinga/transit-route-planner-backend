import { StopFilters } from "../repository/stops";
import { buildStopsQuery } from "../utils";

// Helper function to normalize SQL whitespace
function normalizeSQL(sql: string): string {
    return sql.replace(/\s+/g, ' ').trim();
}

describe("buildStopsQuery", () => {
    it("should return base query when no filters are provided", () => {
        const filters: StopFilters = {};
        const result = buildStopsQuery(filters);

        expect(normalizeSQL(result.query)).toBe(
            normalizeSQL("SELECT id, name, location, created_at FROM stops")
        );
        expect(result.params).toEqual([]);
    });

    it("should add name filter when name is provided", () => {
        const filters: StopFilters = {
            name: "Central"
        };
        const result = buildStopsQuery(filters);

        expect(normalizeSQL(result.query)).toBe(
            normalizeSQL("SELECT id, name, location, created_at FROM stops WHERE LOWER(name) LIKE LOWER($1)")
        );
        expect(result.params).toEqual(["%Central%"]);
    });

    it("should properly escape special characters in name filter", () => {
        const filters: StopFilters = {
            name: "Station%_"
        };
        const result = buildStopsQuery(filters);

        expect(result.params).toEqual(["%Station%_%"]);
    });

    it("should return base query when no filters are provided", () => {
        const filters: StopFilters = {};
        const result = buildStopsQuery(filters);

        expect(normalizeSQL(result.query)).toBe(
            normalizeSQL("SELECT id, name, location, created_at FROM stops")
        );
    });

}); 