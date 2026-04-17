// Chatbot knowledge base for Techno Main Saltlake
const chatKnowledge = {
  greetings: [
    "Hey there! 👋 I'm SmartCampus AI, your campus assistant for Techno Main Saltlake. How can I help you today?",
    "Hello! Welcome to SmartCampus. I can help you with navigation, campus info, notices, and more. What do you need?",
    "Hi! 🎓 I'm here to make your campus life easier. Ask me anything about Techno Main Saltlake!",
  ],

  navigation: {
    'main building': "The Main Building is at the center of campus. Enter through the main gate and walk straight. It has rooms 101-305 across 3 floors. 🏢",
    'library': "The Central Library is located to the east side of campus, near the CS/IT Block. It's a 3-floor building with a capacity of 200. Open from 8 AM to 8 PM. 📚",
    'canteen': "The Main Canteen is towards the south-west of campus. Head from the main building towards the sports ground, and you'll find it on your left. 🍽️",
    'cs block': "The CS/IT Block is in the north-east area. It houses all CS & IT labs and classrooms (CS-101 to CS-302, LAB-1 to LAB-3). 💻",
    'it block': "The IT department shares the CS/IT Block in the north-east area. Labs and classrooms are on all 3 floors. 💻",
    'ece block': "The ECE/EE Block is on the east side of campus. It has classrooms ECE-101 to ECE-202 and two dedicated labs. ⚡",
    'ee block': "The EE department shares the ECE/EE Block on the east side of campus. ⚡",
    'auditorium': "The Auditorium is located to the south-west, near the main entrance. It seats 500 people and hosts all major events. 🎭",
    'sports ground': "The Sports Ground is at the southern end of campus. It has cricket, football, and basketball facilities. 🏟️",
    'parking': "The Parking Area is near the main gate on the south-west side. Both two-wheeler and four-wheeler sections available. 🅿️",
    'admin block': "The Admin Block is in the north-west area. It houses the Principal's office, HOD offices, and administrative departments. 🏛️",
    'principal office': "The Principal's Office is in the Admin Block (north-west), Room: PRINCIPAL. Take the elevator to the 2nd floor. 🏛️",
    'gate': "The Main Gate is on the south side of campus, facing the EM Bypass road. 🚪",
  },

  facilities: {
    'wifi': "Free Wi-Fi is available across campus. Connect to 'TMSL-WiFi'. Contact the IT department if you face connectivity issues. 📶",
    'parking': "Parking is available near the main gate. Two-wheeler and four-wheeler sections are separate. Get a parking pass from the admin office. 🅿️",
    'medical': "The medical room is on the ground floor of the Main Building, Room 102. A nurse is available from 9 AM to 5 PM. 🏥",
    'water': "Water coolers are available on every floor of each building, usually near the staircase. 💧",
    'atm': "There's an SBI ATM near the main gate and a Canara Bank ATM near the canteen. 🏧",
    'transport': "College buses run from major locations. Check the notice board or ask the admin office for the latest schedule. 🚌",
  },

  academic: {
    'departments': "Techno Main Saltlake offers B.Tech in CSE, IT, ECE, EE, ME, CE, and more. Each department has its own block. 📋",
    'exam': "For exam schedules, check the notice board on the Student Dashboard or visit the admin office. 📝",
    'attendance': "Your attendance details will be available in your profile section once your department uploads the data. 📊",
    'schedule': "Class schedules will be shown on your dashboard once your department configures them. Check back soon! 📅",
    'results': "Results are published on the university website (makautwb.ac.in). You'll also be notified here. 📊",
  },

  campus: {
    'crowd': "Check the Campus Live section for real-time crowd status! It uses GPS data to show you how crowded each area is. 📡",
    'vacant': "Vacant classrooms are shown in the Campus Live section — look for green markers on the map. 🟢",
    'complaint': "You can file a complaint through the Complaint Portal. We support ragging reports, lost & found, and infrastructure issues. 📋",
    'notice': "Recent notices are shown on your dashboard. Admins post important announcements that appear there. 📢",
  },

  fallback: [
    "I'm not sure about that. Try asking about navigation (e.g., 'Where is the library?'), campus facilities, or crowd status! 🤔",
    "Hmm, I don't have that info yet. My knowledge about Techno Main Saltlake is growing! Try asking something else. 💡",
    "I couldn't find an answer for that. You can ask me about buildings, facilities, vacant rooms, or campus navigation! 🗺️",
  ],
};

export function getChatResponse(message) {
  const msg = message.toLowerCase().trim();

  // Greetings
  if (['hi', 'hello', 'hey', 'hola', 'sup', 'yo', 'namaste', 'good morning', 'good afternoon', 'good evening'].some(g => msg.includes(g))) {
    return chatKnowledge.greetings[Math.floor(Math.random() * chatKnowledge.greetings.length)];
  }

  // Thank you
  if (['thank', 'thanks', 'thx', 'ty'].some(t => msg.includes(t))) {
    return "You're welcome! 😊 Feel free to ask me anything else about Techno Main Saltlake!";
  }

  // Navigation queries
  if (msg.includes('where') || msg.includes('find') || msg.includes('locate') || msg.includes('how to go') || msg.includes('direction') || msg.includes('navigate')) {
    for (const [key, response] of Object.entries(chatKnowledge.navigation)) {
      if (msg.includes(key)) return response;
    }
    // Check for room numbers
    const roomMatch = msg.match(/room\s*(\w+-?\d+)/i);
    if (roomMatch) {
      const roomNum = roomMatch[1].toUpperCase();
      if (roomNum.startsWith('CS') || roomNum.startsWith('LAB')) {
        return `Room ${roomNum} is in the CS/IT Block (north-east area of campus). Check the floor directory at the entrance. 💻`;
      } else if (roomNum.startsWith('ECE')) {
        return `Room ${roomNum} is in the ECE/EE Block (east side of campus). Check the floor directory at the entrance. ⚡`;
      } else {
        const floor = parseInt(roomNum[0]);
        return `Room ${roomNum} is likely on Floor ${floor || 'G'} of the Main Building. Head to the central building and check the directory. 🏢`;
      }
    }
  }

  // Direct location mentions
  for (const [key, response] of Object.entries(chatKnowledge.navigation)) {
    if (msg.includes(key)) return response;
  }

  // Facility queries
  for (const [key, response] of Object.entries(chatKnowledge.facilities)) {
    if (msg.includes(key)) return response;
  }

  // Academic queries
  for (const [key, response] of Object.entries(chatKnowledge.academic)) {
    if (msg.includes(key)) return response;
  }

  // Campus info queries
  for (const [key, response] of Object.entries(chatKnowledge.campus)) {
    if (msg.includes(key)) return response;
  }

  // Crowd specific
  if (msg.includes('crowded') || msg.includes('busy') || msg.includes('people') || msg.includes('rush')) {
    return "Check the Campus Live section for real-time crowd data! Areas with 20+ people are marked as crowded (red), 10-20 as moderate (yellow), and under 10 as empty (green). 📡";
  }

  // Empty/vacant rooms
  if (msg.includes('empty') || msg.includes('vacant') || msg.includes('free room') || msg.includes('available room')) {
    return "Head to the Campus Live section — vacant classrooms are marked with green markers on the map! You'll also see when the next class is scheduled. 🟢";
  }

  // Help
  if (msg.includes('help') || msg.includes('what can you do') || msg.includes('features')) {
    return "I can help you with:\n🗺️ **Navigation** — 'Where is the library?'\n📡 **Crowd Status** — 'Is the canteen crowded?'\n🟢 **Vacant Rooms** — 'Any empty classrooms?'\n📋 **Complaints** — 'How to file a complaint?'\n📢 **Notices** — 'Any recent notices?'\n🏫 **Campus Info** — 'Tell me about departments'\n\nJust ask away! 🎓";
  }

  // Fallback
  return chatKnowledge.fallback[Math.floor(Math.random() * chatKnowledge.fallback.length)];
}
