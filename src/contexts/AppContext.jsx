import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { generateCrowdData, getVacantClassrooms } from '../data/campusData';
import { sendBrowserNotification, requestNotificationPermission } from '../utils/notifications';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);

  const [crowdData, setCrowdData] = useState(generateCrowdData());
  const [vacantRooms, setVacantRooms] = useState(getVacantClassrooms());
  const [seenAnnouncements, setSeenAnnouncements] = useState(() => {
    const saved = localStorage.getItem('smartcampus_seen_notices');
    return saved ? JSON.parse(saved) : [];
  });

  const prevAnnouncementCount = useRef(0);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const unsubComplaints = onSnapshot(collection(db, 'complaints'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setComplaints(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, (e) => console.warn("Complaints error:", e));

    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAnnouncements(sorted);

      if (prevAnnouncementCount.current > 0 && sorted.length > prevAnnouncementCount.current) {
        const newest = sorted[0];
        sendBrowserNotification('📢 ' + (newest.title || 'New Announcement'), newest.content?.substring(0, 100), { tag: 'announcement-' + newest.id });
      }
      prevAnnouncementCount.current = sorted.length;
    }, (e) => console.warn("Announcements error:", e));

    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAssignments(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }, (e) => console.warn("Assignments error:", e));

    const unsubSubmissions = onSnapshot(collection(db, 'submissions'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSubmissions(data);
    }, (e) => console.warn("Submissions error:", e));

    const unsubTimetables = onSnapshot(collection(db, 'timetables'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTimetables(data.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)));
    }, (e) => console.warn("Timetables error:", e));

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAttendanceRecords(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, (e) => console.warn("Attendance error:", e));

    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRegisteredStudents(data);
    }, (e) => console.warn("Students error:", e));

    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeachers(data);
    }, (e) => console.warn("Teachers error:", e));

    const unsubMaterials = onSnapshot(collection(db, 'studyMaterials'), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudyMaterials(data.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)));
    }, (e) => console.warn("Materials error:", e));

    return () => {
      unsubComplaints(); unsubAnnouncements(); unsubAssignments(); unsubSubmissions();
      unsubTimetables(); unsubAttendance(); unsubStudents(); unsubTeachers(); unsubMaterials();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCrowdData(generateCrowdData());
      setVacantRooms(getVacantClassrooms());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsSeen = (id) => {
    if (!seenAnnouncements.includes(id)) {
      const updated = [...seenAnnouncements, id];
      setSeenAnnouncements(updated);
      localStorage.setItem('smartcampus_seen_notices', JSON.stringify(updated));
    }
  };

  const markAllAsSeen = () => {
    const allIds = announcements.map(a => a.id);
    setSeenAnnouncements(allIds);
    localStorage.setItem('smartcampus_seen_notices', JSON.stringify(allIds));
  };

  const refreshCrowdData = () => {
    setCrowdData(generateCrowdData());
    setVacantRooms(getVacantClassrooms());
  };

  const addComplaint = async (c) => { await addDoc(collection(db, 'complaints'), { ...c, status: 'pending', date: new Date().toISOString().split('T')[0] }); };
  const updateComplaintStatus = async (id, status, remarks) => { await updateDoc(doc(db, 'complaints', id), { status, ...(remarks && { remarks }) }); };
  
  const addAnnouncement = async (a) => { await addDoc(collection(db, 'announcements'), { ...a, date: new Date().toISOString().split('T')[0] }); };
  const deleteAnnouncement = async (id) => { await deleteDoc(doc(db, 'announcements', id)); };

  const addAssignment = async (a) => { 
    await addDoc(collection(db, 'assignments'), { ...a, createdAt: new Date().toISOString() }); 
    sendBrowserNotification('📝 New Assignment', a.title, { tag: 'assignment' });
  };
  const deleteAssignment = async (id) => { await deleteDoc(doc(db, 'assignments', id)); };

  const addSubmission = async (s) => { await addDoc(collection(db, 'submissions'), { ...s, submittedAt: new Date().toISOString() }); };

  const addTimetable = async (t) => {
    await addDoc(collection(db, 'timetables'), { ...t, uploadedAt: new Date().toISOString() });
    sendBrowserNotification('📅 Timetable Updated', t.label, { tag: 'timetable' });
  };
  const deleteTimetable = async (id) => { await deleteDoc(doc(db, 'timetables', id)); };

  const addAttendanceRecord = async (r) => { await addDoc(collection(db, 'attendance'), { ...r, createdAt: new Date().toISOString() }); };

  const addTeacher = async (t) => { await addDoc(collection(db, 'teachers'), { ...t, addedAt: new Date().toISOString() }); };
  const deleteTeacher = async (id) => { await deleteDoc(doc(db, 'teachers', id)); };

  const addStudyMaterial = async (m) => { 
    await addDoc(collection(db, 'studyMaterials'), { ...m, uploadedAt: new Date().toISOString() }); 
    sendBrowserNotification('📚 New Study Material', m.title, { tag: 'material' });
  };
  const deleteStudyMaterial = async (id) => { await deleteDoc(doc(db, 'studyMaterials', id)); };

  return (
    <AppContext.Provider value={{
      complaints, announcements, assignments, submissions, timetables, attendanceRecords, registeredStudents, teachers, studyMaterials,
      crowdData, vacantRooms,
      addComplaint, updateComplaintStatus,
      addAnnouncement, deleteAnnouncement,
      addAssignment, deleteAssignment, addSubmission,
      addTimetable, deleteTimetable,
      addAttendanceRecord,
      addTeacher, deleteTeacher,
      addStudyMaterial, deleteStudyMaterial,
      refreshCrowdData,
      seenAnnouncements, markAsSeen, markAllAsSeen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
