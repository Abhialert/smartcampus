import { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { mockAdmins } from '../data/campusData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('smartcampus_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [role, setRole] = useState(() => localStorage.getItem('smartcampus_role'));

  const login = async (identifier, password, loginRole) => {
    if (loginRole === 'student') {
      try {
        // Check Firestore students collection
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('roll', '==', identifier.trim()));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          return { success: false, error: 'Roll number not found. Please contact admin to register.' };
        }

        const studentDoc = snapshot.docs[0];
        const studentData = { id: studentDoc.id, ...studentDoc.data() };

        if (studentData.password !== password) {
          return { success: false, error: 'Invalid password. Default password is your rollNo_St' };
        }

        const userData = {
          firestoreId: studentDoc.id,
          roll: studentData.roll,
          name: studentData.name,
          dept: studentData.dept || 'General',
          year: studentData.year || 1,
          section: studentData.section || '',
        };

        setUser(userData);
        setRole('student');
        localStorage.setItem('smartcampus_user', JSON.stringify(userData));
        localStorage.setItem('smartcampus_role', 'student');
        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        // Fallback for demo: allow any roll with rollNo_St password
        if (password === identifier.trim() + '_St') {
          const fallbackUser = { roll: identifier.trim(), name: 'Student ' + identifier.trim(), dept: 'CSE', year: 2 };
          setUser(fallbackUser);
          setRole('student');
          localStorage.setItem('smartcampus_user', JSON.stringify(fallbackUser));
          localStorage.setItem('smartcampus_role', 'student');
          return { success: true };
        }
        return { success: false, error: 'Login failed. Check your connection or contact admin.' };
      }
    } else {
      // Admin / Teacher login
      const admin = mockAdmins.find(a => a.id === identifier.trim());
      if (admin && admin.password === password) {
        const userData = { id: admin.id, name: admin.name, dept: admin.dept, adminRole: admin.adminRole };
        setUser(userData);
        setRole('admin');
        localStorage.setItem('smartcampus_user', JSON.stringify(userData));
        localStorage.setItem('smartcampus_role', 'admin');
        return { success: true };
      }
      // Default teacher password
      if (password === 'teacher@123' || password === 'admin@123') {
        const newAdmin = { id: identifier.trim(), name: 'Admin ' + identifier.trim(), dept: 'General', adminRole: 'Faculty' };
        setUser(newAdmin);
        setRole('admin');
        localStorage.setItem('smartcampus_user', JSON.stringify(newAdmin));
        localStorage.setItem('smartcampus_role', 'admin');
        return { success: true };
      }
      return { success: false, error: 'Invalid teacher/admin ID or password' };
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('smartcampus_user');
    localStorage.removeItem('smartcampus_role');
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'Not logged in' };

    if (role === 'student' && user.firestoreId) {
      try {
        // Verify current password from Firestore
        const studentRef = doc(db, 'students', user.firestoreId);
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('roll', '==', user.roll));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const studentData = snapshot.docs[0].data();
          if (studentData.password !== currentPassword) {
            return { success: false, error: 'Current password is incorrect' };
          }
          await updateDoc(studentRef, { password: newPassword });
          return { success: true };
        }
        return { success: false, error: 'Student record not found' };
      } catch (error) {
        console.error('Password change error:', error);
        return { success: false, error: 'Failed to change password. Try again.' };
      }
    }
    return { success: false, error: 'Password change not supported for this role' };
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, changePassword, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
