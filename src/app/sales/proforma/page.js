"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "redaxios";
import Link from "next/link";
import Header from "@/app/components/header";
import { toast } from "react-toastify";
import useAuth from "@/app/components/useAuth";

export default function ProformaPage() {
  const [piData, setPiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPI, setSelectedPI] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [percentage, setPercentage] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const [editing, setEditing] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef(null);

  useAuth();

  const API = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchPI = async () => {
    try {
      const res = await axios.get(`${API}/api/pi/list`);
      setPiData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPI();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPINumber = (index) => {
    const date = new Date();
    let year = date.getFullYear();
    let nextYear = year + 1;
    if (date.getMonth() < 3) {
      year = year - 1;
      nextYear = year + 1;
    }
    const shortYear = String(year).slice(2);
    const shortNextYear = String(nextYear).slice(2);
    const serial = String(index + 1).padStart(5, "0");
    return `PI/${shortYear}-${shortNextYear}/${serial}`;
  };

  // ===================================================
  // AUTO STATUS UPDATE HELPER
  // ===================================================
  const updateStatus = async (pi_id, newTotal) => {
    const newStatus = newTotal >= 100 ? "paid" : "partial";
    try {
      await axios.put(`${API}/api/pi/update-status/${pi_id}`, {
        status: newStatus,
      });
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // ===================================================
  // EXPORT TO EXCEL
  // ===================================================
  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const exportData = piData.map((item, index) => ({
        "No.": index + 1,
        "PI No": formatPINumber(index),
        "PI Date": item.pi_date
          ? new Date(item.pi_date).toLocaleDateString()
          : "",
        "Customer Name": item.customer_name || "",
        "Quotation No": item.quotation_no || "",
        Assignee: item.assignee || "",
        Total: item.total || "",
        "Proforma %": item.proforma_percentage || "",
        Status: item.status || "",
        "Created At": item.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Proforma");

      const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
        wch: Math.max(key.length, 15),
      }));
      worksheet["!cols"] = colWidths;

      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toTimeString().slice(0, 5);
      XLSX.writeFile(workbook, `Proforma_(${date})_${time}.xlsx`);
      toast.success("Excel exported successfully");
      setShowExportMenu(false);
    } catch (err) {
      console.log(err);
      toast.error("Excel export failed");
    }
  };

  // ===================================================
  // EXPORT TO PDF
  // ===================================================
  const exportToPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("Proforma Invoice Report", 14, 15);

      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Exported on: ${new Date().toLocaleDateString("en-GB")}   |   Total Records: ${piData.length}`,
        14,
        22,
      );

      const tableData = piData.map((item, index) => [
        index + 1,
        formatPINumber(index),
        item.pi_date ? new Date(item.pi_date).toLocaleDateString() : "",
        item.customer_name || "",
        item.quotation_no || "",
        item.assignee || "",
        item.total ? `₹${Number(item.total).toLocaleString()}` : "",
        item.proforma_percentage ? `${item.proforma_percentage}%` : "",
        item.status || "",
        item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
      ]);

      autoTable(doc, {
        startY: 27,
        head: [
          [
            "#",
            "PI No",
            "PI Date",
            "Customer",
            "Quotation",
            "Assignee",
            "Total",
            "PI %",
            "Status",
            "Created",
          ],
        ],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3, textColor: [40, 40, 40] },
        headStyles: {
          fillColor: [234, 88, 12],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        alternateRowStyles: { fillColor: [255, 247, 237] },
        columnStyles: { 0: { cellWidth: 8 } },
      });

      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toTimeString().slice(0, 5).replace(":", "-");
      doc.save(`Proforma_(${date})_${time}.pdf`);
      toast.success("PDF exported successfully");
      setShowExportMenu(false);
    } catch (err) {
      console.log(err);
      toast.error("PDF export failed");
    }
  };

  // ===================================================
  // ADD FOLLOW-UP + AUTO STATUS
  // ===================================================
  const handleSubmitFollowUp = async () => {
    const newPercent = Number(percentage);
    if (!newPercent) {
      toast.error("Please enter percentage");
      return;
    }
    const followUps = selectedPI.follow_ups || [];
    const existingTotal = followUps.reduce(
      (sum, f) => sum + Number(f.proforma_percentage),
      0,
    );
    const newTotal = existingTotal + newPercent;

    if (newTotal > 100) {
      toast.error("Total percentage cannot exceed 100%");
      return;
    }

    try {
      setSubmitLoading(true); // ✅ ADD THIS

      await axios.post(`${API}/api/pi/add-followup/${selectedPI.pi_id}`, {
        percentage: newPercent,
      });

      await updateStatus(selectedPI.pi_id, newTotal);

      toast.success(
        newTotal >= 100
          ? "Follow-up added & marked as Won 🎉"
          : "Follow-up added & status set to Pending",
      );

      setShowModal(false);
      setPercentage("");
      setEditing(null);
      fetchPI();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setSubmitLoading(false); // ✅ ADD THIS
    }
  };
  // ===================================================
  // UPDATE FOLLOW-UP + AUTO STATUS
  // ===================================================
  const handleUpdate = async () => {
    const newPercent = Number(percentage);
    if (!newPercent) {
      toast.error("Enter valid percentage");
      return;
    }
    const followUps = selectedPI.follow_ups || [];
    const total = followUps.reduce(
      (sum, f) => sum + Number(f.proforma_percentage),
      0,
    );
    const adjustedTotal = total - Number(editing.proforma_percentage);
    const newTotal = adjustedTotal + newPercent;

    if (newTotal > 100) {
      toast.error("Total percentage cannot exceed 100%");
      return;
    }

    try {
      setUpdateLoading(true); // ✅ ADD THIS

      await axios.put(
        `${API}/api/pi/update-followup/${selectedPI.pi_id}/${editing.id}`,
        { percentage: newPercent },
      );

      await updateStatus(selectedPI.pi_id, newTotal);

      toast.success(
        newTotal >= 100
          ? "Updated & marked as Won 🎉"
          : "Updated & status set to Pending",
      );

      setShowModal(false);
      setEditing(null);
      setPercentage("");
      fetchPI();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdateLoading(false); // ✅ ADD THIS
    }
  };
  const handleEdit = (item) => {
    setEditing(item);
    setPercentage(item.proforma_percentage);
  };
  return (
    <>
      <Header />

      <div className="bg-gray-100 min-h-screen">
        {/* BREADCRUMB */}
        <div className="bg-white w-full border-gray-100 p-3 mt-1 mb-5 flex justify-between items-center">
          <div className="flex items-center text-gray-700">
            <p>
              <Link
                href="/dashboard"
                className="mx-3 text-xl text-gray-400 hover:text-indigo-600"
              >
                <i className="bi bi-house"></i>
              </Link>
              <i className="bi bi-chevron-right"></i>
              <Link
                href="#"
                className="mx-3 text-md text-gray-700 hover:text-orange-500"
              >
                Sales
              </Link>
              <i className="bi bi-chevron-right"></i>
              <Link
                href="/sales/proforma"
                className="mx-3 text-md text-gray-700 hover:text-orange-500"
              >
                Proforma
              </Link>
            </p>
          </div>

          {/* EXPORT DROPDOWN */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setShowExportMenu((prev) => !prev)}
                className="flex items-center gap-2 bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-600 hover:text-orange-600 px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-sm"
              >
                <i className="bi bi-download text-base"></i>
                Export
                <i
                  className={`bi bi-chevron-down text-xs transition-transform ${
                    showExportMenu ? "rotate-180" : ""
                  }`}
                ></i>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <button
                    onClick={exportToExcel}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                      <i className="bi bi-file-earmark-excel text-green-600 text-sm"></i>
                    </div>
                    Export Excel
                  </button>
                  <div className="h-px bg-gray-100 mx-3"></div>
                  <button
                    onClick={exportToPDF}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
                      <i className="bi bi-file-earmark-pdf text-red-600 text-sm"></i>
                    </div>
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-sm border border-gray-100 mx-7 py-2">
          <div className="p-4">
            {loading ? (
              <div className="text-center py-10 text-gray-400">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-3 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        #
                      </th>
                      <th className="py-3 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        PI No
                      </th>
                      <th className="py-3 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        PI Date
                      </th>
                      <th className="py-3 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Customer Name
                      </th>
                      <th className="py-3 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Quotation No
                      </th>
                      <th className="py-3 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Assignee
                      </th>
                      <th className="py-3 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="py-3 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        PI %
                      </th>
                      <th className="py-3 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Follow-Up
                      </th>
                      <th className="py-3 px-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {piData.length > 0 ? (
                      piData.map((item, index) => (
                        <tr
                          key={item.pi_id}
                          className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors"
                        >
                          <td className="py-3 px-3">{index + 1}</td>

                          <td className="py-3 px-3 font-medium text-gray-800">
                            {formatPINumber(index)}
                          </td>

                          <td className="py-3 px-3 text-gray-500">
                            {item.pi_date
                              ? new Date(item.pi_date).toLocaleDateString(
                                  "en-IN",
                                )
                              : "-"}
                          </td>

                          <td className="py-3 px-3 text-orange-500">
                            {item.customer_name || "-"}
                          </td>

                          <td className="py-3 px-3 text-gray-600">
                            {item.quotation_no || "-"}
                          </td>

                          <td className="py-3 px-3">
                            {item.assignee ? (
                              <div className="flex gap-1 items-center">
                                {String(item.assignee)
                                  .split(",")
                                  .map((name, i) => (
                                    <div
                                      key={i}
                                      title={name.trim()}
                                      className="px-3 py-1.5 bg-blue-800 text-white rounded-full font-semibold text-sm flex justify-center items-center min-w-[28px] text-center select-none"
                                    >
                                      {name.trim().charAt(0).toUpperCase()}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>

                          <td className="py-3 px-3 font-medium text-gray-800">
                            ₹{Number(item.total).toLocaleString()}
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-semibold text-gray-800">
                              {item.proforma_percentage}%
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`border rounded-sm px-3 py-1 text-xs font-semibold
                              ${
                                item.status === "paid"
                                  ? "border-green-200 bg-green-50 text-green-700"
                                  : item.status === "partial"
                                    ? "border-orange-200 bg-orange-50 text-orange-700"
                                    : "border-gray-200 bg-gray-50 text-gray-700"
                              }`}
                            >
                              {item.status === "paid"
                                ? "Won"
                                : item.status === "partial"
                                  ? "Pending"
                                  : "Pending"}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedPI(item);
                                setEditing(null);
                                setPercentage("");
                                setActiveIndex(null);
                                setShowModal(true);
                              }}
                              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center mx-auto hover:bg-gray-100 cursor-pointer"
                            >
                              <i className="bi bi-plus text-lg"></i>
                            </button>
                          </td>

                          <td className="py-3 px-3 text-gray-500">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString(
                                  "en-IN",
                                )
                              : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="11"
                          className="text-center py-10 text-gray-400"
                        >
                          No Data Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOLLOW-UP MODAL */}
      {showModal && selectedPI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-[900px] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Update Proforma Activities
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                  setPercentage("");
                  setActiveIndex(null);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-orange-100 text-gray-400 hover:text-orange-500 transition-all"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="flex">
              {/* LEFT SIDE */}
              <div className="w-1/2 px-6 py-5 border-r border-gray-100">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">
                  {editing ? "Edit Follow-Up" : "Add New Follow-Up"}
                </p>

                <div className="space-y-2 text-sm mb-5">
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                      Customer
                    </span>
                    <span className="font-medium text-gray-700">
                      {selectedPI.customer_name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                      Quotation
                    </span>
                    <span className="font-medium text-gray-700">
                      {selectedPI.quotation_no}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                      Total
                    </span>
                    <span className="font-semibold text-gray-800">
                      ₹{Number(selectedPI.total).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                      Current %
                    </span>
                    <span className="font-semibold text-orange-500">
                      {selectedPI.proforma_percentage}%
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Enter Percentage <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={percentage}
                    onChange={(e) => {
                      let value = e.target.value;

                      if (value === "") {
                        setPercentage("");
                        return;
                      }

                      let num = Number(value);

                      if (num >= 0 && num <= 100) {
                        setPercentage(num);
                      }
                    }}
                    className="w-full mt-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-orange-300 focus:border-transparent outline-none bg-gray-50 transition-all"
                    placeholder="Enter %"
                  />
                </div>
              </div>

              {/* RIGHT SIDE - HISTORY */}
              <div className="w-1/2 px-6 py-5 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                    Follow-Up History
                  </p>
                  <span className="text-xs bg-orange-50 text-orange-500 px-2.5 py-1 rounded-full font-semibold border border-orange-100">
                    {selectedPI.follow_ups?.length || 0} record(s)
                  </span>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-80">
                  {!selectedPI.follow_ups ||
                  selectedPI.follow_ups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                      <i className="bi bi-clock-history text-3xl mb-2"></i>
                      <p className="text-sm">No history found</p>
                    </div>
                  ) : (
                    selectedPI.follow_ups.map((h, index) => {
                      const isLatest = index === 0;
                      return (
                        <div key={h.id}>
                          <div
                            onClick={() =>
                              setActiveIndex(
                                index === activeIndex ? null : index,
                              )
                            }
                            className={`border rounded-xl p-3 cursor-pointer transition-all select-none ${
                              isLatest
                                ? "border-orange-400 bg-orange-50 shadow-sm"
                                : "hover:bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {isLatest && (
                                  <span className="text-xs bg-orange-100 text-orange-500 px-2 py-0.5 rounded-full font-semibold">
                                    Latest
                                  </span>
                                )}
                                <p className="font-semibold text-sm text-gray-700">
                                  {h.proforma_percentage}% → ₹
                                  {Number(h.total).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                  {new Date(h.created_at).toLocaleDateString(
                                    "en-IN",
                                  )}
                                </span>
                                {isLatest && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(h);
                                    }}
                                    className="text-gray-400 hover:text-orange-500 transition-all"
                                  >
                                    <i className="bi bi-pencil-square text-xs"></i>
                                  </button>
                                )}
                                <i
                                  className={`bi ${
                                    activeIndex === index
                                      ? "bi-chevron-up"
                                      : "bi-chevron-down"
                                  } text-gray-400 text-xs`}
                                ></i>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              NA
                            </p>
                          </div>

                          {/* EXPANDED DETAIL */}
                          {activeIndex === index && (
                            <div className="mt-2 border border-orange-200 rounded-xl bg-gradient-to-br from-orange-50 to-white p-4 text-sm shadow-sm">
                              <div className="flex justify-between items-center mb-3">
                                <p className="font-bold text-orange-500 text-xs uppercase tracking-wide">
                                  Details
                                </p>
                                <button
                                  onClick={() => setActiveIndex(null)}
                                  className="text-gray-400 hover:text-gray-600 text-xs"
                                >
                                  ✕ Close
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                                <div>
                                  <p className="text-xs text-gray-400 font-medium">
                                    Percentage
                                  </p>
                                  <p className="font-semibold text-gray-700 text-sm mt-0.5">
                                    {h.proforma_percentage}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 font-medium">
                                    Amount
                                  </p>
                                  <p className="font-semibold text-gray-700 text-sm mt-0.5">
                                    ₹{Number(h.total).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 font-medium">
                                    Date
                                  </p>
                                  <p className="font-semibold text-gray-700 text-sm mt-0.5">
                                    {new Date(h.created_at).toLocaleDateString(
                                      "en-IN",
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                  setPercentage("");
                  setActiveIndex(null);
                }}
                className="px-5 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={editing ? handleUpdate : handleSubmitFollowUp}
                disabled={editing ? updateLoading : submitLoading}
                className={`w-36 px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-md shadow-orange-200 flex items-center justify-center
    ${
      (editing ? updateLoading : submitLoading)
        ? "bg-orange-400 cursor-not-allowed"
        : "bg-orange-500 hover:bg-orange-600"
    }`}
              >
                {(editing ? updateLoading : submitLoading) ? (
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeWidth="4"
                      opacity="0.25"
                    />
                    <path
                      fill="white"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                ) : editing ? (
                  "Update"
                ) : (
                  "Add Follow-Up"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
