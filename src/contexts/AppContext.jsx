import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateCrowdData, getVacantClassrooms } from '../data/campusData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [crowdData, setCrowdData] = useState(generateCrowdData());
  const [vacantRooms, setVacantRooms] = useState(getVacantClassrooms());

  // Listen to Firestore for changes
  useEffect(() => {
    // Listen to Complaints
    const unsubscribeComplaints = onSnapshot(collection(db, 'complaints'), (snapshot) => {
      const complaintsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by date descending (optional, depending on your needs format)
      setComplaints(complaintsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, (error) => {
      console.warn("Error fetching complaints (might need configuration):", error);
    });

    // Listen to Announcements
    const unsubscribeAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(announcementsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }, (error) => {
      console.warn("Error fetching announcements (might need configuration):", error);
    });

    return () => {
      unsubscribeComplaints();
      unsubscribeAnnouncements();
    };
  }, []);

  // Refresh crowd data every 30 seconds to simulate real-time GPS
  useEffect(() => {
    const interval = setInterval(() => {
      setCrowdData(generateCrowdData());
      setVacantRooms(getVacantClassrooms());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const refreshCrowdData = () => {
    setCrowdData(generateCrowdData());
    setVacantRooms(getVacantClassrooms());
  };

  const addComplaint = async (complaint) => {
    try {
      const newComplaint = {
        ...complaint,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      };
      await addDoc(collection(db, 'complaints'), newComplaint);
      return newComplaint;
    } catch (error) {
      console.error("Error adding complaint: ", error);
    }
  };

  const updateComplaintStatus = async (id, status, remarks) => {
    try {
      const complaintRef = doc(db, 'complaints', id);
      await updateDoc(complaintRef, {
        status,
        ...(remarks && { remarks })
      });
    } catch (error) {
      console.error("Error updating complaint: ", error);
    }
  };

  const addAnnouncement = async (announcement) => {
    try {
      const newAnnouncement = {
        ...announcement,
        date: new Date().toISOString().split('T')[0],
      };
      await addDoc(collection(db, 'announcements'), newAnnouncement);
      return newAnnouncement;
    } catch (error) {
      console.error("Error adding announcement: ", error);
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      console.error("Error deleting announcement: ", error);
    }
  };

  return (
    <AppContext.Provider value={{
      complaints,
      announcements,
      crowdData,
      vacantRooms,
      addComplaint,
      updateComplaintStatus,
      addAnnouncement,
      deleteAnnouncement,
      refreshCrowdData,
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
