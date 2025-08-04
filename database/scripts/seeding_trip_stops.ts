import { Pool } from "pg";
import { config } from "../../src/config";

const pool = new Pool(config.db);

async function seedTripStops() {
  try {
    const tripsResult = await pool.query("SELECT id FROM trips ORDER BY id");
    const trips = tripsResult.rows;

    const stopsResult = await pool.query("SELECT id FROM stops ORDER BY id");
    const stops = stopsResult.rows;

    for (const trip of trips) {
      const selectedStops = shuffleArray(stops).slice(0, 3);

      for (let i = 0; i < selectedStops.length; i++) {
        const tripStopQuery = `
                    INSERT INTO trip_stops 
                    (trip_id, stop_id, stop_sequence, arrival_time, departure_time) 
                    VALUES 
                    ($1, $2, $3, 
                     NOW() + interval '1 hour' + interval '${i * 20} minutes',
                     NOW() + interval '1 hour' + interval '${i * 20 + 5} minutes')
                `;

        await pool.query(tripStopQuery, [trip.id, selectedStops[i].id, i + 1]);
      }
      console.log(`Trip stops seeded successfully for trip ${trip.id}`);
    }
  } catch (error) {
    console.error("Error seeding trip stops:", error);
    throw error;
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

seedTripStops()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed trip stops:", error);
    process.exit(1);
  });
