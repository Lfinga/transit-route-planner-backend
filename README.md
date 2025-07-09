# Transit Route Planner Backend

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)

## Dependencies

To install all required dependencies:
```bash
npm install
```


## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=3000
DEBUG=false

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=****** (put your own postgres DB_PASSWORD)
DB_NAME=route_planner_db
```

## Database Setup

1. Create the database and tables:
   ```bash
   npm run create:db
   ```

2. Seed the database with sample data:
   ```bash
   npm run seed:db
   ```

3. To reset the database (delete and recreate):
   ```bash
   npm run reset:db
   ```

4. To create and seed the database in one command:
   ```bash
   npm run create:seed:db
   ```

## Running the Application

Development mode with hot reload:
```bash
npm run dev
```

## Testing

The project uses Jest for testing. Tests are located in the `src/tests` directory.

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```
