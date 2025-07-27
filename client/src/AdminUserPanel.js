import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminUserPanel = () => {
  const [users, setUsers] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/admin/users `)
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, [reload]);

  const handleDelete = async (email) => {
    if (!window.confirm(`Delete user ${email}?`)) return;
    await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/auth/admin/users/${email}`);
    setReload(!reload);
  };

  const toggleRole = async (email, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/auth/admin/users/role`, {
      email,
      newRole
    });
    setReload(!reload);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Admin User Management Panel</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => toggleRole(u.email, u.role)}>
                  Make {u.role === "admin" ? "User" : "Admin"}
                </button>
                &nbsp;
                <button onClick={() => handleDelete(u.email)} style={{ color: "red" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserPanel;
