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

-- Create essential indexes for optimal query performance
CREATE INDEX idx_trips_route_id ON trips(route_id);                           
CREATE INDEX idx_trip_stops_trip_id ON trip_stops(trip_id);                  
CREATE INDEX idx_stops_name_lower ON stops(LOWER(name));           
CREATE INDEX idx_routes_type_active ON routes(type, active);                 
CREATE INDEX idx_trip_stops_stop_arrival ON trip_stops(stop_id, arrival_time);  

-- Create function to get next trips for a stop
CREATE OR REPLACE FUNCTION get_next_trips(stop_id INT, from_time TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
    trip_id INT,
    route_id INT,
    route_name TEXT,
    route_type TEXT,
    arrival_time TIMESTAMP WITH TIME ZONE,
    departure_time TIMESTAMP WITH TIME ZONE,
    stop_sequence INT,
    trip_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as trip_id,
        r.id as route_id,
        r.name as route_name,
        r.type as route_type,
        ts.arrival_time,
        ts.departure_time,
        ts.stop_sequence,
        t.notes as trip_notes
    FROM trip_stops ts
    JOIN trips t ON t.id = ts.trip_id
    JOIN routes r ON r.id = t.route_id
    WHERE 
        ts.stop_id = get_next_trips.stop_id
        AND ts.arrival_time > get_next_trips.from_time
        AND r.active = true 
    ORDER BY ts.arrival_time ASC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;