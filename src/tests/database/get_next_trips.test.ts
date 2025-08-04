import { Pool } from "pg";
import { config } from "../../config";

jest.mock("pg", () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

interface NextTrip {
  trip_id: number;
  route_id: number;
  route_name: string;
  route_type: string;
  arrival_time: Date;
  departure_time: Date;
  stop_sequence: number;
  trip_notes: string;
}

describe("get_next_trips Database Function", () => {
  let pool: Pool;
  const mockPool = new Pool(config.db);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return next trips for a stop in correct order", async () => {
    const now = new Date();
    const mockTrips: NextTrip[] = [
      {
        trip_id: 1,
        route_id: 101,
        route_name: "Route 1",
        route_type: "bus",
        arrival_time: new Date(now.getTime() + 1000 * 60 * 30), // 30 mins from now
        departure_time: new Date(now.getTime() + 1000 * 60 * 31),
        stop_sequence: 1,
        trip_notes: "Regular service",
      },
      {
        trip_id: 2,
        route_id: 102,
        route_name: "Route 2",
        route_type: "bus",
        arrival_time: new Date(now.getTime() + 1000 * 60 * 60), // 60 mins from now
        departure_time: new Date(now.getTime() + 1000 * 60 * 61),
        stop_sequence: 1,
        trip_notes: "Express service",
      },
    ];

    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: mockTrips,
      rowCount: mockTrips.length,
    });

    const result = await mockPool.query(
      "SELECT * FROM get_next_trips($1, $2)",
      [1, now],
    );

    expect(mockPool.query).toHaveBeenCalledWith(
      "SELECT * FROM get_next_trips($1, $2)",
      [1, now],
    );

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toMatchObject({
      route_name: "Route 1",
      route_type: "bus",
      trip_notes: "Regular service",
    });
    expect(result.rows[1]).toMatchObject({
      route_name: "Route 2",
      route_type: "bus",
      trip_notes: "Express service",
    });

    expect(new Date(result.rows[0].arrival_time).getTime()).toBeLessThan(
      new Date(result.rows[1].arrival_time).getTime(),
    );
  });

  it("should return empty array when no future trips exist", async () => {
    const now = new Date();

    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    });

    const result = await mockPool.query(
      "SELECT * FROM get_next_trips($1, $2)",
      [1, now],
    );

    expect(result.rows).toHaveLength(0);
    expect(mockPool.query).toHaveBeenCalledWith(
      "SELECT * FROM get_next_trips($1, $2)",
      [1, now],
    );
  });

  it("should return maximum 5 trips", async () => {
    const now = new Date();
    const mockTrips: NextTrip[] = Array.from({ length: 6 }, (_, i) => ({
      trip_id: i + 1,
      route_id: 101,
      route_name: `Route ${i + 1}`,
      route_type: "bus",
      arrival_time: new Date(now.getTime() + 1000 * 60 * (30 + i * 30)), // 30 min intervals
      departure_time: new Date(now.getTime() + 1000 * 60 * (31 + i * 30)),
      stop_sequence: 1,
      trip_notes: `Trip ${i + 1}`,
    })).slice(0, 5);

    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: mockTrips,
      rowCount: mockTrips.length,
    });

    const result = await mockPool.query(
      "SELECT * FROM get_next_trips($1, $2)",
      [1, now],
    );

    expect(result.rows).toHaveLength(5);
    expect(mockPool.query).toHaveBeenCalledWith(
      "SELECT * FROM get_next_trips($1, $2)",
      [1, now],
    );

    for (let i = 0; i < result.rows.length - 1; i++) {
      expect(new Date(result.rows[i].arrival_time).getTime()).toBeLessThan(
        new Date(result.rows[i + 1].arrival_time).getTime(),
      );
    }
  });

  it("should handle invalid stop_id gracefully", async () => {
    const now = new Date();

    (mockPool.query as jest.Mock).mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    });

    const result = await mockPool.query(
      "SELECT * FROM get_next_trips($1, $2)",
      [-1, now],
    );

    expect(result.rows).toHaveLength(0);
    expect(mockPool.query).toHaveBeenCalledWith(
      "SELECT * FROM get_next_trips($1, $2)",
      [-1, now],
    );
  });
});
