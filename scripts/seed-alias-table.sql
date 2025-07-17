-- Insert some sample characters (optional)
INSERT INTO alias (character) VALUES 
    ('A'),
    ('B'),
    ('1'),
    ('@')
ON CONFLICT DO NOTHING;
