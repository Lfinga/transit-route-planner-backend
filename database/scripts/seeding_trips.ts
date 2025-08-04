import { Pool } from "pg";
import { config } from "../../src/config";

const pool = new Pool(config.db);

async function seedTrips() {
  try {
    const routesResult = await pool.query("SELECT id FROM routes ORDER BY id");
    const routes = routesResult.rows;

    for (const route of routes) {
      const tripsQuery = `
                INSERT INTO trips (route_id, departure_time, arrival_time, notes) VALUES 
                ($1, NOW() + interval '1 hour', NOW() + interval '2 hours', 'Morning trip ${route.id}'),
                ($1, NOW() + interval '3 hours', NOW() + interval '4 hours', 'Afternoon trip ${route.id}')
                ;
            `;

      const result = await pool.query(tripsQuery, [route.id]);
      console.log(
        `Trips seeded successfully for route ${route.id}:`,
        result.rows,
      );
    }
  } catch (error) {
    console.error("Error seeding trips:", error);
    throw error;
  }
}

seedTrips()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed trips:", error);
    process.exit(1);
  });
