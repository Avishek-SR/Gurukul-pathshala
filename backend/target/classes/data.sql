-- Create default admin user (password: admin123)
INSERT INTO users (user_id, name, email, password, role, is_active, is_locked, failed_attempts, created_at)
VALUES (
    'ADMIN001',
    'System Administrator',
    'admin@gurukul.edu',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lOBslK6P/bYz3O', -- bcrypt hash of 'admin123'
    'ADMIN',
    true,
    false,
    0,
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Create sample faculty
-- INSERT INTO users (user_id, name, email, password, role, is_active, is_locked, failed_attempts, created_at)
-- VALUES (
--     'FAC001',
--     'Dr. Smith',
--     'smith@gurukul.edu',
--     '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lOBslK6P/bYz3O',
--     'FACULTY',
--     true,
--     false,
--     0,
--     NOW()
-- ) ON CONFLICT (user_id) DO NOTHING;

-- Create sample student
-- INSERT INTO users (user_id, name, email, password, role, is_active, is_locked, failed_attempts, created_at)
-- VALUES (
--     'S123456',
--     'Alex Johnson',
--     'alex@gurukul.edu',
--     '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lOBslK6P/bYz3O',
--     'STUDENT',
--     true,
--     false,
--     0,
--     NOW()
-- ) ON CONFLICT (user_id) DO NOTHING;