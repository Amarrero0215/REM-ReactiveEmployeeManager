import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
import inquirer from 'inquirer';
import consoleTable from 'console.table';
import figlet from 'figlet';
import boxen from 'boxen';

// Initialize dotenv
dotenv.config();

// PostgreSQL connection setup
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test the connection
pool.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      figlet.text(
        'Employee\nManager', // ASCII art title with stacked words
        { font: 'Slant', horizontalLayout: 'default', verticalLayout: 'full' },
        (err, data) => {
          if (err) {
            console.error('Error generating ASCII art:', err);
            return;
          }
          // Wrap the ASCII art in a box
          const boxedTitle = boxen(data, {
            padding: 1, // Space between the text and the box
            margin: 1, // Space around the box
            borderStyle: 'round',
            borderColor: 'cyan',
          });
  
          console.log(boxedTitle); // Display the boxed ASCII art
          console.log('Connected to the database.');
          mainMenu(); // Start the main menu
        }
      );
    }
});

// Main menu using Inquirer
const mainMenu = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'View Employees by Manager',
        'View Employees by Department',
        'View Department Budget',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee Role',
        'Update Employee Manager',
        'Delete Department',
        'Delete Role',
        'Delete Employee',
        'Exit',
      ],
    },
  ]);

  switch (action) {
    case 'View All Departments':
      viewDepartments();
      break;

    case 'View All Roles':
      viewRoles();
      break;

    case 'View All Employees':
      viewEmployees();
      break;

    case 'View Employees by Manager':
      viewEmployeesByManager();  
      break;
      
    case 'View Employees by Department':
      viewEmployeesByDepartment();
      break;

    case 'View Department Budget':  
      viewDepartmentBudget();  
      break;  

    case 'Add Department':
      addDepartment();
      break;

    case 'Add Role':
      addRole();
      break;

    case 'Add Employee':
      addEmployee();
      break;

    case 'Update Employee Role':
      updateEmployeeRole();
      break;
    
    case 'Update Employee Manager':
      updateEmployeeManager();
      break;

    case 'Delete Department':  
      deleteDepartment();  
      break;  
      
    case 'Delete Role':  
      deleteRole();  
      break;  
      
    case 'Delete Employee':  
      deleteEmployee();  
      break;  

    case 'Exit':
      console.log('Goodbye!');
      pool.end(); // Close the database connection
      process.exit();
  }
};

// Placeholder functions for menu options
const viewDepartments = async () => {
  try {
    const result = await pool.query('SELECT * FROM department');
    console.table(result.rows);
    mainMenu(); // Return to main menu
  } catch (err) {
    console.error(err);
  }
};

const viewRoles = async () => {
  try {
    const result = await pool.query(`
      SELECT role.id, role.title, role.salary, department.name AS department
      FROM role
      JOIN department ON role.department_id = department.id
    `);
    console.table(result.rows);
    mainMenu(); // Return to main menu
  } catch (err) {
    console.error(err);
  }
};

const viewEmployees = async () => {
  try {
    const result = await pool.query(`
      SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department,
             role.salary, employee.manager_id
      FROM employee
      JOIN role ON employee.role_id = role.id
      JOIN department ON role.department_id = department.id
    `);
    console.table(result.rows);
    mainMenu(); // Return to main menu
  } catch (err) {
    console.error(err);
  }
};

const viewEmployeesByManager = async () => {
    try {
      const result = await pool.query(`
        SELECT e.id, e.first_name, e.last_name, 
               m.first_name AS manager_first_name, 
               m.last_name AS manager_last_name
        FROM employee e
        LEFT JOIN employee m ON e.manager_id = m.id
        ORDER BY manager_first_name, manager_last_name;
      `);
      console.table(result.rows);
      mainMenu(); // Return to the main menu
    } catch (err) {
      console.error(err);
      mainMenu();
    }
};

const viewEmployeesByDepartment = async () => {
    try {
      const result = await pool.query(`
        SELECT e.id, e.first_name, e.last_name, d.name AS department_name
        FROM employee e
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id
        ORDER BY d.name;
      `);
      console.table(result.rows);
      mainMenu(); // Return to the main menu
    } catch (err) {
      console.error(err);
      mainMenu();
    }
};

const viewDepartmentBudget = async () => {
    try {
      const departments = (await pool.query('SELECT id, name FROM department')).rows;
  
      const { departmentId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'departmentId',
          message: 'Select a department to view its total budget:',
          choices: departments.map((dept) => ({
            name: dept.name,
            value: dept.id,
          })),
        },
      ]);
  
      const result = await pool.query(`
        SELECT d.name AS department_name, SUM(r.salary) AS total_budget
        FROM employee e
        JOIN role r ON e.role_id = r.id
        JOIN department d ON r.department_id = d.id
        WHERE d.id = $1
        GROUP BY d.name;
      `, [departmentId]);
  
      console.table(result.rows);
      mainMenu(); // Return to the main menu
    } catch (err) {
      console.error(err);
      mainMenu();
    }
};

const addDepartment = async () => {
  const { name } = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Enter the name of the department:' },
  ]);
  try {
    await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log(`Added department: ${name}`);
    mainMenu();
  } catch (err) {
    console.error(err);
  }
};

const addRole = async () => {
  const { title, salary, department_id } = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Enter the role title:' },
    { type: 'input', name: 'salary', message: 'Enter the role salary:' },
    { type: 'input', name: 'department_id', message: 'Enter the department ID:' },
  ]);
  try {
    await pool.query(
      'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)',
      [title, salary, department_id]
    );
    console.log(`Added role: ${title}`);
    mainMenu();
  } catch (err) {
    console.error(err);
  }
};

const addEmployee = async () => {
  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    { type: 'input', name: 'first_name', message: 'Enter the employee first name:' },
    { type: 'input', name: 'last_name', message: 'Enter the employee last name:' },
    { type: 'input', name: 'role_id', message: 'Enter the role ID:' },
    { type: 'input', name: 'manager_id', message: 'Enter the manager ID (or leave blank):' },
  ]);
  try {
    await pool.query(
      'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
      [first_name, last_name, role_id, manager_id || null]
    );
    console.log(`Added employee: ${first_name} ${last_name}`);
    mainMenu();
  } catch (err) {
    console.error(err);
  }
};

const updateEmployeeRole = async () => {
  const { employee_id, new_role_id } = await inquirer.prompt([
    { type: 'input', name: 'employee_id', message: 'Enter the employee ID to update:' },
    { type: 'input', name: 'new_role_id', message: 'Enter the new role ID:' },
  ]);
  try {
    await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [new_role_id, employee_id]);
    console.log(`Updated employee ID ${employee_id} to role ID ${new_role_id}`);
    mainMenu();
  } catch (err) {
    console.error(err);
  }
};

const updateEmployeeManager = async () => {
    try {
      const employees = (await pool.query('SELECT id, first_name, last_name FROM employee')).rows;
  
      const { employeeId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'employeeId',
          message: 'Select an employee to update their manager:',
          choices: employees.map((emp) => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id,
          })),
        },
      ]);
  
      const { managerId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'managerId',
          message: 'Select the new manager:',
          choices: employees.map((emp) => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id,
          })),
        },
      ]);
  
      await pool.query('UPDATE employee SET manager_id = $1 WHERE id = $2', [managerId, employeeId]);
      console.log('Employee manager updated successfully!');
      mainMenu(); // Return to the main menu
    } catch (err) {
      console.error(err);
      mainMenu();
    }
};

const deleteDepartment = async () => {
    try {
      const departments = (await pool.query('SELECT id, name FROM department')).rows;
  
      const { departmentId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'departmentId',
          message: 'Select the department to delete:',
          choices: departments.map((dept) => ({
            name: dept.name,
            value: dept.id,
          })),
        },
      ]);
  
      await pool.query('DELETE FROM department WHERE id = $1', [departmentId]);
      console.log('Department deleted successfully!');
      mainMenu(); // Return to the main menu
    } catch (err) {
      console.error(err);
      mainMenu();
    }
};

const deleteRole = async () => {
    try {
      const roles = (await pool.query('SELECT id, title FROM role')).rows;
  
      const { roleId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'roleId',
          message: 'Select the role to delete:',
          choices: roles.map((role) => ({
            name: role.title,
            value: role.id,
          })),
        },
      ]);
  
      await pool.query('DELETE FROM role WHERE id = $1', [roleId]);
      console.log('Role deleted successfully!');
      mainMenu(); // Return to the main menu
    } catch (err) {
      console.error(err);
      mainMenu();
    }
};

const deleteEmployee = async () => {
    try {
      const employees = (await pool.query('SELECT id, first_name, last_name FROM employee')).rows;
  
      const { employeeId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'employeeId',
          message: 'Select the employee to delete:',
          choices: employees.map((emp) => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id,
          })),
        },
      ]);
  
      await pool.query('DELETE FROM employee WHERE id = $1', [employeeId]);
      console.log('Employee deleted successfully!');
      mainMenu(); // Return to the main menu
    } catch (err) {
      console.error(err);
      mainMenu();
    }
};