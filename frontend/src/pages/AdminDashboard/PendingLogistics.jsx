import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData, verifyLogistics } from "../../redux/slices/adminSlice";

const PendingLogistics = () => {
  const dispatch = useDispatch();
  const { logisticsPending, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleVerify = (id, action) => {
    dispatch(verifyLogistics({ id, action }));
  };

  if (loading) return <p className="p-4">Loading pending logistics...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending Logistics Companies</h2>

      {logisticsPending.length === 0 ? (
        <p className="text-gray-500">No pending logistics applications.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-4 text-left border-r">#</th>
                <th className="py-2 px-4 text-left border-r">Company Name</th>
                <th className="py-2 px-4 text-left border-r">Email</th>
                <th className="py-2 px-4 text-left border-r">Status</th>
                <th className="py-2 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {logisticsPending.map((company, idx) => (
                <tr key={company._id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 border-r">{idx + 1}</td>
                  <td className="py-2 px-4 border-r">{company.name}</td>
                  <td className="py-2 px-4 border-r">{company.email}</td>
                  <td className="py-2 px-4 border-r text-yellow-600 font-medium">
                    Pending
                  </td>
                  <td className="py-2 px-4 flex space-x-2">
                    <button
                      onClick={() => handleVerify(company._id, "approve")}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerify(company._id, "reject")}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
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

export default PendingLogistics;
