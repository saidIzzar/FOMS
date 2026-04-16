export const users = [
  {
    id: 1,
    username: "yassin",
    first_name: "Yassin",
    last_name: "Al-Haj",
    email: "yassin.alhaj@foms.com",
    role: "operator",
    department: "Production",
    position: "Machine Operator",
    is_active: true,
    phone: "+966501234567",
    hire_date: "2024-01-15",
    shifts: ["morning", "evening"]
  },
  {
    id: 2,
    username: "ossama",
    first_name: "Ossama",
    last_name: "Khalil",
    email: "ossama.khalil@foms.com",
    role: "operator",
    department: "Production",
    position: "Senior Operator",
    is_active: true,
    phone: "+966501234568",
    hire_date: "2023-06-10",
    shifts: ["morning", "night"]
  },
  {
    id: 3,
    username: "admin",
    first_name: "System",
    last_name: "Administrator",
    email: "admin@foms.com",
    role: "admin",
    department: "IT",
    position: "System Administrator",
    is_active: true,
    phone: "+966501234569",
    hire_date: "2023-01-01",
    shifts: ["morning"]
  },
  {
    id: 4,
    username: "engineer",
    first_name: "Ahmed",
    last_name: "Hassan",
    email: "ahmed.hassan@foms.com",
    role: "engineer",
    department: "Engineering",
    position: "Process Engineer",
    is_active: true,
    phone: "+966501234570",
    hire_date: "2023-03-20",
    shifts: ["morning"]
  },
  {
    id: 5,
    username: "manager",
    first_name: "Mohammed",
    last_name: "Al-Salem",
    email: "mohammed.salem@foms.com",
    role: "admin",
    department: "Management",
    position: "Production Manager",
    is_active: true,
    phone: "+966501234571",
    hire_date: "2022-08-01",
    shifts: ["morning"]
  },
  {
    id: 6,
    username: "operator2",
    first_name: "Ali",
    last_name: "Mahmoud",
    email: "ali.mahmoud@foms.com",
    role: "operator",
    department: "Production",
    position: "Machine Operator",
    is_active: true,
    phone: "+966501234572",
    hire_date: "2024-03-10",
    shifts: ["evening", "night"]
  },
  {
    id: 7,
    username: "maintenance",
    first_name: "Ibrahim",
    last_name: "Nasser",
    email: "ibrahim.nasser@foms.com",
    role: "engineer",
    department: "Maintenance",
    position: "Maintenance Technician",
    is_active: true,
    phone: "+966501234573",
    hire_date: "2023-09-15",
    shifts: ["morning", "evening"]
  },
  {
    id: 8,
    username: "quality",
    first_name: "Fatima",
    last_name: "Ahmed",
    email: "fatima.ahmed@foms.com",
    role: "operator",
    department: "Quality",
    position: "Quality Inspector",
    is_active: true,
    phone: "+966501234574",
    hire_date: "2024-02-01",
    shifts: ["morning"]
  },
  {
    id: 9,
    username: "inactive",
    first_name: "Khaled",
    last_name: "Rashid",
    email: "khaled.rashid@foms.com",
    role: "operator",
    department: "Production",
    position: "Machine Operator",
    is_active: false,
    phone: "+966501234575",
    hire_date: "2023-05-01",
    shifts: ["night"]
  }
];

export const getUserById = (id) => users.find(u => u.id === parseInt(id));
export const getUsersByRole = (role) => users.filter(u => u.role === role);
export const getActiveUsers = () => users.filter(u => u.is_active);

export const createUser = (user) => {
  const newUser = { 
    ...user, 
    id: Math.max(...users.map(u => u.id)) + 1,
    is_active: true 
  };
  users.push(newUser);
  return newUser;
};

export const updateUser = (id, data) => {
  const index = users.findIndex(u => u.id === parseInt(id));
  if (index !== -1) {
    users[index] = { ...users[index], ...data };
    return users[index];
  }
  return null;
};

export const deleteUser = (id) => {
  const index = users.findIndex(u => u.id === parseInt(id));
  if (index !== -1) {
    users.splice(index, 1);
    return true;
  }
  return false;
};

export default users;