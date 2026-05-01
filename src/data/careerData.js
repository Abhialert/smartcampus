// Career data — auto-matched to student dept, zero manual entry
export const internships = [
  { id: 'i1', title: 'SDE Intern', company: 'Google', location: 'Bangalore', stipend: '₹80,000/mo', type: 'Summer', depts: ['CSE', 'IT'], tags: ['DSA', 'System Design'], applyUrl: 'https://careers.google.com', deadline: '2026-05-20', logo: '🔵' },
  { id: 'i2', title: 'Frontend Intern', company: 'Flipkart', location: 'Bangalore', stipend: '₹50,000/mo', type: 'Summer', depts: ['CSE', 'IT'], tags: ['React', 'JavaScript'], applyUrl: 'https://flipkart.com/careers', deadline: '2026-05-25', logo: '🟡' },
  { id: 'i3', title: 'ML Research Intern', company: 'Microsoft', location: 'Hyderabad', stipend: '₹70,000/mo', type: 'Summer', depts: ['CSE', 'IT', 'ECE'], tags: ['ML', 'Python', 'Research'], applyUrl: 'https://careers.microsoft.com', deadline: '2026-06-01', logo: '🟢' },
  { id: 'i4', title: 'Data Analyst Intern', company: 'Deloitte', location: 'Kolkata', stipend: '₹35,000/mo', type: 'Summer', depts: ['CSE', 'IT', 'ECE', 'EE'], tags: ['SQL', 'Excel', 'Tableau'], applyUrl: 'https://deloitte.com/careers', deadline: '2026-06-10', logo: '🟣' },
  { id: 'i5', title: 'Embedded Systems Intern', company: 'Texas Instruments', location: 'Bangalore', stipend: '₹45,000/mo', type: 'Summer', depts: ['ECE', 'EE'], tags: ['Embedded C', 'VLSI', 'IoT'], applyUrl: 'https://ti.com/careers', deadline: '2026-05-30', logo: '🔴' },
  { id: 'i6', title: 'Power Systems Intern', company: 'Siemens', location: 'Gurgaon', stipend: '₹40,000/mo', type: 'Summer', depts: ['EE'], tags: ['Power Systems', 'MATLAB', 'Smart Grid'], applyUrl: 'https://siemens.com/careers', deadline: '2026-06-05', logo: '🟤' },
  { id: 'i7', title: 'Cloud Engineer Intern', company: 'AWS', location: 'Remote', stipend: '₹60,000/mo', type: 'Part-time', depts: ['CSE', 'IT'], tags: ['AWS', 'Docker', 'DevOps'], applyUrl: 'https://aws.amazon.com/careers', deadline: '2026-06-15', logo: '🟠' },
  { id: 'i8', title: 'UI/UX Design Intern', company: 'Swiggy', location: 'Bangalore', stipend: '₹30,000/mo', type: 'Summer', depts: ['CSE', 'IT'], tags: ['Figma', 'Design Thinking'], applyUrl: 'https://swiggy.com/careers', deadline: '2026-05-28', logo: '🟧' },
  { id: 'i9', title: 'Cybersecurity Intern', company: 'Tata AIG', location: 'Mumbai', stipend: '₹35,000/mo', type: 'Summer', depts: ['CSE', 'IT', 'ECE'], tags: ['Security', 'Pentesting', 'SIEM'], applyUrl: '#', deadline: '2026-06-20', logo: '🛡️' },
  { id: 'i10', title: 'Backend Developer Intern', company: 'Razorpay', location: 'Bangalore', stipend: '₹55,000/mo', type: 'Summer', depts: ['CSE', 'IT'], tags: ['Go', 'Microservices', 'APIs'], applyUrl: '#', deadline: '2026-06-08', logo: '💙' },
];

// Skills auto-assigned per department — student doesn't pick, they just rate
export const skillsByDept = {
  CSE: [
    { id: 'dsa', name: 'DSA & Problem Solving', icon: '🧩', maxLevel: 10 },
    { id: 'webdev', name: 'Web Development', icon: '🌐', maxLevel: 10 },
    { id: 'ml', name: 'Machine Learning', icon: '🤖', maxLevel: 10 },
    { id: 'dbms', name: 'Databases & SQL', icon: '🗄️', maxLevel: 10 },
    { id: 'os', name: 'Operating Systems', icon: '💻', maxLevel: 10 },
    { id: 'networking', name: 'Computer Networks', icon: '📡', maxLevel: 10 },
    { id: 'git', name: 'Git & DevOps', icon: '🔧', maxLevel: 10 },
    { id: 'communication', name: 'Communication Skills', icon: '🗣️', maxLevel: 10 },
  ],
  IT: [
    { id: 'dsa', name: 'DSA & Problem Solving', icon: '🧩', maxLevel: 10 },
    { id: 'webdev', name: 'Web Development', icon: '🌐', maxLevel: 10 },
    { id: 'dbms', name: 'Databases & SQL', icon: '🗄️', maxLevel: 10 },
    { id: 'security', name: 'Information Security', icon: '🔐', maxLevel: 10 },
    { id: 'bigdata', name: 'Big Data & Analytics', icon: '📊', maxLevel: 10 },
    { id: 'oop', name: 'OOP & Design Patterns', icon: '🏗️', maxLevel: 10 },
    { id: 'git', name: 'Git & DevOps', icon: '🔧', maxLevel: 10 },
    { id: 'communication', name: 'Communication Skills', icon: '🗣️', maxLevel: 10 },
  ],
  ECE: [
    { id: 'signals', name: 'Signals & Systems', icon: '📈', maxLevel: 10 },
    { id: 'vlsi', name: 'VLSI Design', icon: '🔌', maxLevel: 10 },
    { id: 'embedded', name: 'Embedded Systems', icon: '🤖', maxLevel: 10 },
    { id: 'commsys', name: 'Communication Systems', icon: '📡', maxLevel: 10 },
    { id: 'iot', name: 'IoT & Sensors', icon: '🌐', maxLevel: 10 },
    { id: 'microprocessor', name: 'Microprocessors', icon: '💻', maxLevel: 10 },
    { id: 'matlab', name: 'MATLAB & Simulation', icon: '📊', maxLevel: 10 },
    { id: 'communication', name: 'Communication Skills', icon: '🗣️', maxLevel: 10 },
  ],
  EE: [
    { id: 'powersys', name: 'Power Systems', icon: '⚡', maxLevel: 10 },
    { id: 'machines', name: 'Electrical Machines', icon: '🏭', maxLevel: 10 },
    { id: 'control', name: 'Control Systems', icon: '🎛️', maxLevel: 10 },
    { id: 'powerelec', name: 'Power Electronics', icon: '🔌', maxLevel: 10 },
    { id: 'renewable', name: 'Renewable Energy', icon: '🌞', maxLevel: 10 },
    { id: 'smartgrid', name: 'Smart Grid Tech', icon: '🔋', maxLevel: 10 },
    { id: 'matlab', name: 'MATLAB & Simulation', icon: '📊', maxLevel: 10 },
    { id: 'communication', name: 'Communication Skills', icon: '🗣️', maxLevel: 10 },
  ],
};

// Placement prep resources — curated, no student input
export const placementResources = [
  { id: 'p1', category: 'Aptitude', title: 'Quantitative Aptitude', difficulty: 'Easy', time: '2 weeks', icon: '🔢', url: 'https://www.indiabix.com/', topics: ['Percentages', 'Profit & Loss', 'Time & Work', 'Probability'] },
  { id: 'p2', category: 'Aptitude', title: 'Logical Reasoning', difficulty: 'Medium', time: '2 weeks', icon: '🧠', url: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/', topics: ['Puzzles', 'Seating Arrangement', 'Blood Relations', 'Coding-Decoding'] },
  { id: 'p3', category: 'Aptitude', title: 'Verbal Ability', difficulty: 'Easy', time: '1 week', icon: '📝', url: 'https://www.indiabix.com/verbal-ability/questions-and-answers/', topics: ['Reading Comprehension', 'Grammar', 'Vocabulary', 'Para Jumbles'] },
  { id: 'p4', category: 'DSA', title: 'Arrays & Strings', difficulty: 'Easy', time: '1 week', icon: '📦', url: 'https://leetcode.com/tag/array/', topics: ['Two Pointer', 'Sliding Window', 'Prefix Sum', 'Hashing'] },
  { id: 'p5', category: 'DSA', title: 'Linked Lists & Stacks', difficulty: 'Medium', time: '1 week', icon: '🔗', url: 'https://leetcode.com/tag/linked-list/', topics: ['Reversal', 'Fast-Slow Pointer', 'Stack Applications', 'Queue'] },
  { id: 'p6', category: 'DSA', title: 'Trees & Graphs', difficulty: 'Hard', time: '2 weeks', icon: '🌳', url: 'https://leetcode.com/tag/tree/', topics: ['BFS/DFS', 'BST', 'Dijkstra', 'Topo Sort'] },
  { id: 'p7', category: 'DSA', title: 'Dynamic Programming', difficulty: 'Hard', time: '3 weeks', icon: '🎯', url: 'https://leetcode.com/tag/dynamic-programming/', topics: ['Knapsack', 'LCS', 'Matrix Chain', 'Coin Change'] },
  { id: 'p8', category: 'Core', title: 'DBMS Concepts', difficulty: 'Medium', time: '1 week', icon: '🗄️', url: 'https://www.geeksforgeeks.org/dbms/', topics: ['Normalization', 'SQL Queries', 'Transactions', 'Indexing'] },
  { id: 'p9', category: 'Core', title: 'Operating Systems', difficulty: 'Medium', time: '1 week', icon: '💻', url: 'https://www.geeksforgeeks.org/operating-systems/', topics: ['Process Scheduling', 'Deadlocks', 'Memory Management', 'Paging'] },
  { id: 'p10', category: 'Core', title: 'Computer Networks', difficulty: 'Medium', time: '1 week', icon: '📡', url: 'https://www.geeksforgeeks.org/computer-network-tutorials/', topics: ['OSI Model', 'TCP/IP', 'HTTP/DNS', 'Subnetting'] },
  { id: 'p11', category: 'HR', title: 'HR Interview Prep', difficulty: 'Easy', time: '3 days', icon: '🎤', url: 'https://www.geeksforgeeks.org/hr-interview-questions/', topics: ['Tell me about yourself', 'Strengths/Weaknesses', 'Why this company?', 'Salary negotiation'] },
  { id: 'p12', category: 'HR', title: 'Group Discussion', difficulty: 'Medium', time: '3 days', icon: '👥', url: '#', topics: ['Current Affairs', 'Abstract Topics', 'Case Studies', 'GD Tips'] },
];

export const prepCategories = [
  { id: 'all', label: 'All Topics', emoji: '📚' },
  { id: 'Aptitude', label: 'Aptitude', emoji: '🔢' },
  { id: 'DSA', label: 'DSA & Coding', emoji: '💻' },
  { id: 'Core', label: 'Core Subjects', emoji: '📖' },
  { id: 'HR', label: 'HR & Soft Skills', emoji: '🎤' },
];

// Campus polls — admin pre-creates, students just tap to vote
export const defaultPolls = [
  { id: 'poll1', question: '🍕 What should the canteen add?', options: ['Pizza Corner', 'South Indian', 'Chinese Stall', 'Juice Bar'], votes: [42, 38, 55, 29], active: true, endsAt: '2026-05-10' },
  { id: 'poll2', question: '📅 Best day for club meetups?', options: ['Wednesday', 'Friday', 'Saturday'], votes: [67, 89, 45], active: true, endsAt: '2026-05-08' },
  { id: 'poll3', question: '🎪 Which fest theme do you prefer?', options: ['Retro Arcade', 'Cyberpunk', 'Bollywood Night', 'Cultural Fusion'], votes: [34, 78, 52, 61], active: true, endsAt: '2026-05-15' },
];
