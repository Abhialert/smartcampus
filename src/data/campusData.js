// Campus data for Techno Main Saltlake
// Address: EM-4/1, Sector-V, Salt Lake, Kolkata-700091
// Exact Google Maps coordinates for the campus center
export const CAMPUS_CENTER = [22.5726, 88.4338];
export const CAMPUS_ZOOM = 17;

export const campusZones = [
  {
    id: 'main-building',
    name: 'Main Academic Block',
    coords: [22.5728, 88.4340],
    type: 'building',
    rooms: ['101', '102', '103', '201', '202', '203', '301', '302'],
    details: 'Primary academic block with classrooms and admin offices.'
  },
  {
    id: 'library',
    name: 'Central Library',
    coords: [22.5732, 88.4348],
    type: 'facility',
    capacity: 200,
    details: 'Quiet study zones, digital repository, and reading halls.'
  },
  {
    id: 'canteen',
    name: 'Main Canteen',
    coords: [22.5720, 88.4330],
    type: 'facility',
    capacity: 150,
    details: 'Popular food court with diverse food stalls.'
  },
  {
    id: 'stationery',
    name: 'Stationery & Xerox',
    coords: [22.5724, 88.4335],
    type: 'facility',
    details: 'Academic supplies, printing, and binding services.'
  },
  {
    id: 'cs-block',
    name: 'CS / IT Block',
    coords: [22.5734, 88.4345],
    type: 'building',
    rooms: ['CS-101', 'CS-201', 'CS-301', 'LAB-1', 'LAB-2', 'LAB-3'],
    details: 'Computer Science and IT department with modern labs.'
  },
  {
    id: 'ece-block',
    name: 'ECE / EE Block',
    coords: [22.5730, 88.4328],
    type: 'building',
    rooms: ['ECE-101', 'ECE-201', 'EE-101', 'EE-201'],
    details: 'Electronics and Electrical Engineering department.'
  },
  {
    id: 'parking',
    name: 'Campus Parking',
    coords: [22.5716, 88.4342],
    type: 'outdoor',
    details: 'Two-wheeler and four-wheeler parking area.'
  },
  {
    id: 'auditorium',
    name: 'Seminar Hall',
    coords: [22.5722, 88.4350],
    type: 'facility',
    capacity: 500,
    details: 'Main auditorium for events, seminars, and cultural programs.'
  },
  {
    id: 'admin-block',
    name: 'Admin Block',
    coords: [22.5726, 88.4344],
    type: 'building',
    rooms: ['PRINCIPAL', 'HOD-CSE', 'HOD-ECE', 'ACCOUNTS'],
    details: 'Administrative offices, Principal chamber, HOD offices.'
  },
];

// Subject code mapping — hardcoded so you don't need to upload
export const subjectCodes = {
  CSE: {
    1: [
      { code: 'PH101', name: 'Physics-I', credits: 4 },
      { code: 'M101', name: 'Mathematics-I', credits: 4 },
      { code: 'CS101', name: 'Programming for Problem Solving', credits: 3 },
      { code: 'ME101', name: 'Engineering Mechanics', credits: 3 },
      { code: 'HU101', name: 'English', credits: 2 },
      { code: 'CH101', name: 'Chemistry-I', credits: 4 },
      { code: 'EE101', name: 'Basic Electrical Engineering', credits: 3 },
    ],
    2: [
      { code: 'M201', name: 'Mathematics-III', credits: 4 },
      { code: 'CS201', name: 'Data Structures', credits: 4 },
      { code: 'CS202', name: 'Digital Logic', credits: 3 },
      { code: 'CS203', name: 'Discrete Mathematics', credits: 3 },
      { code: 'CS204', name: 'Computer Organization', credits: 3 },
      { code: 'HU201', name: 'Economics for Engineers', credits: 2 },
    ],
    3: [
      { code: 'CS301', name: 'DBMS', credits: 4 },
      { code: 'CS302', name: 'Operating Systems', credits: 4 },
      { code: 'CS303', name: 'Computer Networks', credits: 3 },
      { code: 'CS304', name: 'Theory of Computation', credits: 3 },
      { code: 'CS305', name: 'Software Engineering', credits: 3 },
      { code: 'CS306', name: 'Design & Analysis of Algorithms', credits: 4 },
    ],
    4: [
      { code: 'CS401', name: 'Compiler Design', credits: 3 },
      { code: 'CS402', name: 'Machine Learning', credits: 4 },
      { code: 'CS403', name: 'Artificial Intelligence', credits: 3 },
      { code: 'CS404', name: 'Cloud Computing', credits: 3 },
      { code: 'CS405', name: 'Cyber Security', credits: 3 },
      { code: 'CS406', name: 'Project Work', credits: 6 },
    ],
  },
  IT: {
    1: [
      { code: 'PH101', name: 'Physics-I', credits: 4 },
      { code: 'M101', name: 'Mathematics-I', credits: 4 },
      { code: 'CS101', name: 'Programming for Problem Solving', credits: 3 },
      { code: 'ME101', name: 'Engineering Mechanics', credits: 3 },
      { code: 'HU101', name: 'English', credits: 2 },
    ],
    2: [
      { code: 'M201', name: 'Mathematics-III', credits: 4 },
      { code: 'IT201', name: 'Data Structures', credits: 4 },
      { code: 'IT202', name: 'Digital Logic', credits: 3 },
      { code: 'IT203', name: 'Object Oriented Programming', credits: 3 },
      { code: 'IT204', name: 'Computer Organization', credits: 3 },
    ],
    3: [
      { code: 'IT301', name: 'DBMS', credits: 4 },
      { code: 'IT302', name: 'Operating Systems', credits: 4 },
      { code: 'IT303', name: 'Computer Networks', credits: 3 },
      { code: 'IT304', name: 'Web Technology', credits: 3 },
      { code: 'IT305', name: 'Software Engineering', credits: 3 },
    ],
    4: [
      { code: 'IT401', name: 'Machine Learning', credits: 4 },
      { code: 'IT402', name: 'Information Security', credits: 3 },
      { code: 'IT403', name: 'Big Data Analytics', credits: 3 },
      { code: 'IT404', name: 'Project Work', credits: 6 },
    ],
  },
  ECE: {
    1: [
      { code: 'PH101', name: 'Physics-I', credits: 4 },
      { code: 'M101', name: 'Mathematics-I', credits: 4 },
      { code: 'CS101', name: 'Programming for Problem Solving', credits: 3 },
    ],
    2: [
      { code: 'EC201', name: 'Signals & Systems', credits: 4 },
      { code: 'EC202', name: 'Analog Circuits', credits: 4 },
      { code: 'EC203', name: 'Digital Electronics', credits: 3 },
    ],
    3: [
      { code: 'EC301', name: 'Communication Systems', credits: 4 },
      { code: 'EC302', name: 'Microprocessors', credits: 3 },
      { code: 'EC303', name: 'VLSI Design', credits: 3 },
    ],
    4: [
      { code: 'EC401', name: 'Embedded Systems', credits: 4 },
      { code: 'EC402', name: 'IoT', credits: 3 },
      { code: 'EC403', name: 'Project Work', credits: 6 },
    ],
  },
  EE: {
    1: [
      { code: 'PH101', name: 'Physics-I', credits: 4 },
      { code: 'M101', name: 'Mathematics-I', credits: 4 },
      { code: 'EE101', name: 'Basic Electrical Engineering', credits: 3 },
    ],
    2: [
      { code: 'EE201', name: 'Circuit Theory', credits: 4 },
      { code: 'EE202', name: 'Electrical Machines', credits: 4 },
      { code: 'EE203', name: 'Measurements', credits: 3 },
    ],
    3: [
      { code: 'EE301', name: 'Power Systems', credits: 4 },
      { code: 'EE302', name: 'Control Systems', credits: 4 },
      { code: 'EE303', name: 'Power Electronics', credits: 3 },
    ],
    4: [
      { code: 'EE401', name: 'Smart Grid', credits: 3 },
      { code: 'EE402', name: 'Renewable Energy', credits: 3 },
      { code: 'EE403', name: 'Project Work', credits: 6 },
    ],
  },
};

// Simulate GPS-based crowd data
export function generateCrowdData() {
  const hour = new Date().getHours();
  const isClassTime = (hour >= 9 && hour <= 12) || (hour >= 14 && hour <= 16);
  const isLunchTime = hour >= 12 && hour < 14;

  return campusZones.map(zone => {
    let baseCrowd = 0;
    if (zone.type === 'building') {
      baseCrowd = isClassTime ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 10) + 2;
    } else if (zone.id === 'canteen') {
      baseCrowd = isLunchTime ? Math.floor(Math.random() * 50) + 80 : Math.floor(Math.random() * 20) + 5;
    } else if (zone.id === 'library') {
      baseCrowd = isClassTime ? Math.floor(Math.random() * 30) + 15 : Math.floor(Math.random() * 50) + 30;
    } else if (zone.id === 'auditorium') {
      baseCrowd = Math.random() > 0.8 ? Math.floor(Math.random() * 200) + 50 : Math.floor(Math.random() * 5);
    } else {
      baseCrowd = Math.floor(Math.random() * 15);
    }
    return { ...zone, crowd: baseCrowd, status: baseCrowd >= 20 ? 'crowded' : baseCrowd >= 10 ? 'moderate' : 'empty' };
  });
}

// Generate vacant classroom data
export function getVacantClassrooms() {
  const allRooms = campusZones
    .filter(z => z.rooms)
    .flatMap(z => z.rooms.map(r => ({ room: r, building: z.name, zoneId: z.id })));
  return allRooms.map(room => ({
    ...room,
    isVacant: Math.random() > 0.4,
    nextClass: Math.random() > 0.5 ? `${Math.floor(Math.random() * 3) + 1}:00 PM` : null,
  }));
}

// Mock admin/teacher data
export const mockAdmins = [
  { id: 'T001', name: 'Dr. Sanjay Mukherjee', dept: 'CSE', adminRole: 'HOD', password: 'teacher@123' },
  { id: 'T002', name: 'Prof. Anita Banerjee', dept: 'ECE', adminRole: 'Professor', password: 'teacher@123' },
  { id: 'T003', name: 'Dr. Rajesh Ghosh', dept: 'IT', adminRole: 'Professor', password: 'teacher@123' },
  { id: 'ADMIN', name: 'Campus Admin', dept: 'Management', adminRole: 'Management', password: 'admin@123' },
];

export const complaintCategories = [
  { id: 'ragging', label: 'Ragging', icon: '🚨', color: '#ef4444' },
  { id: 'lost-found', label: 'Lost & Found', icon: '📦', color: '#f59e0b' },
  { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️', color: '#3b82f6' },
  { id: 'other', label: 'Other', icon: '📝', color: '#8b5cf6' },
];

export const departments = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE'];
export const years = [1, 2, 3, 4];
export const sections = ['A', 'B', 'C'];
