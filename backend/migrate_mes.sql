-- Create operators table
CREATE TABLE IF NOT EXISTS operators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT 1
);

-- Add columns to production_runs
ALTER TABLE production_runs ADD COLUMN operator_id INTEGER;
ALTER TABLE production_runs ADD COLUMN date VARCHAR(10);
ALTER TABLE production_runs ADD COLUMN total_change_minutes REAL DEFAULT 0.0;

-- Seed operators
INSERT INTO operators (name, employee_id, department, is_active) VALUES
('Ahmed Hassan', 'EMP001', 'Production', 1),
('Mohamed Ali', 'EMP002', 'Production', 1),
('Said Mohamed', 'EMP003', 'Production', 1),
('Youssef Ahmed', 'EMP004', 'Production', 1),
('Ali Salem', 'EMP005', 'Quality', 1);