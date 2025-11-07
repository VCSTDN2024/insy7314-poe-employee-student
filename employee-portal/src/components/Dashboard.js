import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        const res = await axios.get('https://localhost:5000/api/employee/transactions', {
          headers: { 'x-auth-token': token }
        });
        setTransactions(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('employeeToken');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    navigate('/');
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pending Transactions</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {transactions.length === 0 ? (
        <p className="text-center text-gray-600">No pending transactions.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SWIFT Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{t.userId?.username || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.amount} {t.currency}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{t.swiftCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/verify/${t._id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Verify
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;