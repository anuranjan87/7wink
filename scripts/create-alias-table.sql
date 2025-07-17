-- Drop the alias table if it exists (cleanup)
DROP TABLE IF EXISTS alias;

-- Create the alias table
CREATE TABLE alias (
    id SERIAL PRIMARY KEY,
    name VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the name column for better performance
CREATE INDEX idx_alias_name ON alias(name);

-- Note: When a name is inserted into this table, 
-- a corresponding [name]_website table will be automatically created
-- to store HTML content for that name's website

-- Insert some sample names for testing (optional)
INSERT INTO alias (name) VALUES 
    ('John'),
    ('Alice'),
    ('Bob'),
    ('Sarah'),
    ('Mike');
