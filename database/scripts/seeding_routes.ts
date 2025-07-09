import { Pool } from 'pg';
import { config } from '../../src/config';

const pool = new Pool(config.db);

async function seedRoutes() {
    try {
        const routesQuery = `
            INSERT INTO routes (name, type, active) VALUES 
            ('Red Line', 'train', true),
            ('Blue Line', 'train', true),
            ('Green Path', 'bus', true),
            ('Yellow Path', 'bus', true);
        `;

        const result = await pool.query(routesQuery);
        console.log('Routes seeded successfully:', result.rows);
        return result.rows;
    } catch (error) {
        console.error('Error seeding routes:', error);
        throw error;
    }
}

seedRoutes()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed to seed routes:', error);
        process.exit(1);
    });
