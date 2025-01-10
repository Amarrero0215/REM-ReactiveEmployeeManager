-- Create the 'department' table
CREATE TABLE IF NOT EXISTS department (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) UNIQUE NOT NULL
);

-- Create the 'role' table
CREATE TABLE IF NOT EXISTS role (
  id SERIAL PRIMARY KEY,
  title VARCHAR(30) UNIQUE NOT NULL,
  salary DECIMAL NOT NULL,
  department_id INTEGER NOT NULL,
  CONSTRAINT fk_department
    FOREIGN KEY(department_id) 
    REFERENCES department(id)
    ON DELETE CASCADE
);

-- Create the 'employee' table
CREATE TABLE IF NOT EXISTS employee (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INTEGER NOT NULL,
  manager_id INTEGER,
  CONSTRAINT fk_role
    FOREIGN KEY(role_id) 
    REFERENCES role(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_manager
    FOREIGN KEY(manager_id) 
    REFERENCES employee(id)
    ON DELETE SET NULL
);