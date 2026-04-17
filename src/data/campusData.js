// Campus data for Techno Main Saltlake (Real coordinates ref)
export const CAMPUS_CENTER = [22.5735, 88.4365]; 
export const CAMPUS_ZOOM = 19; 

export const campusZones = [
  {
    id: 'main-building',
    name: 'Block A (Main Building)',
    coords: [22.5735, 88.4365],
    type: 'building',
    rooms: ['101', '102', '103', '201', '202', '301', '302'],
    details: 'Houses the main reception, admin office, and senior classrooms.'
  },
  {
    id: 'library',
    name: 'Central Library',
    coords: [22.5738, 88.4368],
    type: 'facility',
    capacity: 200,
    details: 'Quiet study zones and digital repository accessible.'
  },
  {
    id: 'canteen',
    name: 'Main Canteen',
    coords: [22.5731, 88.4362],
    type: 'facility',
    capacity: 150,
    details: 'Popular hangout spot with diverse food options.'
  },
  {
    id: 'stationery',
    name: 'Stationery & Xerox Shop',
    coords: [22.5732, 88.4363],
    type: 'facility',
    details: 'All academic supplies and printing services available.'
  },
  {
    id: 'cs-block',
    name: 'CS / IT Block',
    coords: [22.5738, 88.4370],
    type: 'building',
    rooms: ['CS-101', 'CS-201', 'LAB-1', 'LAB-2'],
    details: 'Hi-tech labs and computer science department.'
  },
  {
    id: 'parking',
    name: 'Campus Parking',
    coords: [22.5728, 88.4365],
    type: 'outdoor',
    details: 'Safe parking for students and staff.'
  },
];

// Simulate GPS-based crowd data
// Returns a number for each zone representing people count
export function generateCrowdData() {
  const hour = new Date().getHours();
  const isClassTime = (hour >= 9 && hour <= 12) || (hour >= 14 && hour <= 16);
  const isLunchTime = hour >= 12 && hour < 14;
  const isEvening = hour >= 16 && hour <= 19;

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
    } else if (zone.id === 'sports-ground') {
      baseCrowd = isEvening ? Math.floor(Math.random() * 40) + 15 : Math.floor(Math.random() * 10);
    } else {
      baseCrowd = Math.floor(Math.random() * 15);
    }

    return {
      ...zone,
      crowd: baseCrowd,
      status: baseCrowd >= 20 ? 'crowded' : baseCrowd >= 10 ? 'moderate' : 'empty',
    };
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

// Mock student data
export const mockStudents = [
  { roll: '001', name: 'Rahul Sharma', dept: 'CSE', year: 3, password: 'student@123' },
  { roll: '002', name: 'Priya Das', dept: 'ECE', year: 2, password: 'student@123' },
  { roll: '003', name: 'Amit Roy', dept: 'IT', year: 4, password: 'student@123' },
];

// Mock admin data
export const mockAdmins = [
  { id: 'T001', name: 'Dr. Sanjay Mukherjee', dept: 'CSE', role: 'HOD', password: 'teacher@123' },
  { id: 'T002', name: 'Prof. Anita Banerjee', dept: 'ECE', role: 'Professor', password: 'teacher@123' },
];

export const complaintCategories = [
  { id: 'ragging', label: 'Ragging', icon: '🚨', color: '#ef4444' },
  { id: 'lost-found', label: 'Lost & Found', icon: '📦', color: '#f59e0b' },
  { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️', color: '#3b82f6' },
  { id: 'other', label: 'Other', icon: '📝', color: '#8b5cf6' },
];
