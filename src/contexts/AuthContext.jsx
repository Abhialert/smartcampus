import { createContext, useContext, useState } from 'react';
import { mockStudents, mockAdmins } from '../data/campusData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'student' or 'admin'

  const login = (identifier, password, loginRole) => {
    if (loginRole === 'student') {
      const student = mockStudents.find(s => s.roll === identifier);
      if (student && student.password === password) {
        setUser(student);
        setRole('student');
        return { success: true };
      }
      // Allow any roll number with default password
      if (password === 'student@123') {
        const newStudent = { roll: identifier, name: `Student ${identifier}`, dept: 'CSE', year: 2, password };
        setUser(newStudent);
        setRole('student');
        return { success: true };
      }
      return { success: false, error: 'Invalid roll number or password' };
    } else {
      const admin = mockAdmins.find(a => a.id === identifier);
      if (admin && admin.password === password) {
        setUser(admin);
        setRole('admin');
        return { success: true };
      }
      // Allow any teacher ID with default password
      if (password === 'teacher@123') {
        const newAdmin = { id: identifier, name: `Admin ${identifier}`, dept: 'General', role: 'Faculty', password };
        setUser(newAdmin);
        setRole('admin');
        return { success: true };
      }
      return { success: false, error: 'Invalid teacher ID or password' };
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  const changePassword = (newPassword) => {
    if (user) {
      setUser({ ...user, password: newPassword });
      return true;
    }
    return false;
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
