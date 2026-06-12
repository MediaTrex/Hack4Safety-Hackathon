import { useState } from "react";
import { FaDownload, FaFileDownload } from "react-icons/fa";

function Reports() {
  const [category, setCategory] = useState("Incident Reports");

  const categories = [
    "Incident Reports",
    "SOS Alerts Report",
    "Rescue Operations Report",
    "Resource Utilization Report",
    "Team Performance Report",
    "AI Prediction Report",
    "Traffic Report",
    "Crowd Report",
    "Custom Report",
  ];

  const reports = [
    {
      date: "May 23, 2025",
      incidents: 24,
      resolved: 18,
      progress: 4,
      pending: 2,
    },
    {
      date: "May 22, 2025",
      incidents: 28,
      resolved: 22,
      progress: 4,
      pending: 2,
    },
  ];

  const downloadReport = () => {
    const content = "SAJAG AI REPORT\nGenerated Successfully";

    const blob = new Blob([content], {
      type: "text/plain",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "report.txt";
    a.click();
  };

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <h2 className="text-3xl font-bold">Reports</h2>
          <p>Generate and manage reports</p>
        </div>

        <button
          onClick={downloadReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaDownload />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4 my-6">
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-3xl font-bold text-blue-600">124</h3>
          <p>Total Incidents</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-3xl font-bold text-green-600">98</h3>
          <p>Resolved</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-3xl font-bold text-orange-500">18</h3>
          <p>In Progress</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-3xl font-bold text-red-500">8</h3>
          <p>Pending</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-5 shadow">
          <h3 className="font-bold mb-4">REPORT CATEGORIES</h3>

          {categories.map((cat) => (
            <div
              key={cat}
              onClick={() => setCategory(cat)}
              className={`p-3 rounded cursor-pointer mb-2 ${
                category === cat ? "bg-blue-100 text-blue-600" : ""
              }`}
            >
              {cat}
            </div>
          ))}
        </div>

        <div className="col-span-3 bg-white p-5 rounded-xl shadow">
          <h3 className="font-bold mb-4">{category}</h3>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th>Date</th>
                <th>Total</th>
                <th>Resolved</th>
                <th>Progress</th>
                <th>Pending</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r, i) => (
                <tr key={i} className="border-b">
                  <td>{r.date}</td>
                  <td>{r.incidents}</td>
                  <td>{r.resolved}</td>
                  <td>{r.progress}</td>
                  <td>{r.pending}</td>

                  <td>
                    <button onClick={downloadReport}>
                      <FaFileDownload />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

export default Reports;
>>>>>>> origin/master
