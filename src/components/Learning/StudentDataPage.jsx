import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";

function StudentDataPage({ fileUrl, trainingId, onBack }) {
  const [studentData, setStudentData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonDataRaw = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headersRow = jsonDataRaw[0];
        const formattedData = jsonDataRaw.slice(1).map((row) => {
          const obj = {};
          headersRow.forEach((header, idx) => {
            obj[header] = row[idx] || "";
          });
          return obj;
        });

        setHeaders(headersRow);
        setStudentData(formattedData);
      };
      reader.readAsArrayBuffer(blob);
    } catch (err) {
      console.error("Error fetching student data:", err);
      alert("Failed to load student data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="bg-white p-6 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto relative shadow-xl flex flex-col gap-4">
        
        {/* Back Button */}
        <div className="flex justify-between items-center sticky top-0 bg-white z-10">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ← Back
          </button>
          <h2 className="text-xl font-semibold text-blue-800">Student Data</h2>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading student data...</p>
        ) : studentData.length > 0 ? (
          <>
            {/* Card view for small screens */}
            <div className="grid gap-4 sm:hidden">
              {studentData.map((row, rowIndex) => (
                <div key={rowIndex} className="border p-3 rounded shadow bg-white">
                  {headers.map((header, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b">
                      <span className="font-medium text-gray-700">{header}:</span>
                      <span className="text-gray-800">{row[header]}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Table view for medium & large screens */}
            <div className="overflow-x-auto ">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr>
                    {headers.map((header, idx) => (
                      <th key={idx} className="p-3 border text-gray-700 font-medium whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition">
                      {headers.map((header, idx) => (
                        <td key={idx} className="p-2 border whitespace-nowrap">
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-500">No student data available.</p>
        )}
      </div>
    </div>
  );
}

export default StudentDataPage;
