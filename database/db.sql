-- Create database
CREATE DATABASE route_planner_db;

-- Create routes table
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true
);

-- Create stops table
CREATE TABLE stops (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trips table
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Add constraint to ensure arrival time is after departure time
    CONSTRAINT valid_trip_times CHECK (arrival_time > departure_time)
);

-- Create trip_stops junction table
CREATE TABLE trip_stops (
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    stop_id INTEGER REFERENCES stops(id) ON DELETE CASCADE,
    stop_sequence INTEGER NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Composite primary key
    PRIMARY KEY (trip_id, stop_id),
    -- Ensure departure time is after arrival time
    CONSTRAINT valid_stop_times CHECK (departure_time >= arrival_time),
    -- Ensure stop_sequence is positive
    CONSTRAINT valid_sequence CHECK (stop_sequence > 0)
);

-- Create indexes for better query performance
CREATE INDEX idx_routes_active ON routes(active);
CREATE INDEX idx_trips_route_id ON trips(route_id);
CREATE INDEX idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX idx_trip_stops_stop_id ON trip_stops(stop_id);
CREATE INDEX idx_trip_stops_sequence ON trip_stops(trip_id, stop_sequence);