import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool(config.db);

async function seedStops() {
    try {
        const stopsQuery = `
            INSERT INTO stops (name, location) VALUES 
            ('Central Station', '40.7128,-74.0060'),
            ('Downtown', '40.7139,-74.0070'),
            ('Airport Terminal', '40.6413,-73.7781'),
            ('University Station', '40.7282,-73.9942'),
            ('Brooklyn Station', '40.6901,-73.9907'),
            ('Queens Station', '40.7681,-73.8726'),
            ('Staten Island Station', '40.5795,-74.1502'),
            ('Manhattan Station', '40.785051,-73.968285'),
            ('Bronx Station', '40.8312,-73.8654'),
            ('Williamsburg Station', '40.7198,-73.9550')
            `;

        const result = await pool.query(stopsQuery);
        console.log('Stops seeded successfully:', result.rows);
        return result.rows;
    } catch (error) {
        console.error('Error seeding stops:', error);
        throw error;
    }
}

seedStops()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed to seed stops:', error);
        process.exit(1);
    });
