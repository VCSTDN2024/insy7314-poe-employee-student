import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const VerifyTransaction = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem('employeeToken');
        const res = await axios.get(`https://localhost:5000/api/employee/transactions`, {
          headers: { 'x-auth-token': token }
        });
        const tx = res.data.find(t => t._id === id);
        setTransaction(tx);
      } catch (err) {
        alert('Error loading transaction');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id]);

  const handleVerify = async () => {
    if (!window.confirm('Submit this transaction to SWIFT?')) return;

    try {
      const token = localStorage.getItem('employeeToken');
      await axios.put(`https://localhost:5000/api/employee/transactions/${id}/verify`, {}, {
        headers: { 'x-auth-token': token }
      });
      alert('Transaction verified and submitted to SWIFT!');
      navigate('/dashboard');
    } catch (err) {
      alert('Verification failed');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!transaction) return <p className="text-center mt-10">Transaction not found</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6">Verify Transaction</h2>
      <div className="space-y-4">
        <p><strong>Customer:</strong> {transaction.userId?.username}</p>
        <p><strong>Amount:</strong> {transaction.amount} {transaction.currency}</p>
        <p><strong>Payee Account:</strong> {transaction.payeeAccount}</p>
        <p><strong>SWIFT Code:</strong> {transaction.swiftCode}</p>
        <p><strong>Provider:</strong> {transaction.provider}</p>
      </div>
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleVerify}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Verify & Submit to SWIFT
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VerifyTransaction;