"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../components/header";
import Link from "next/link";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "redaxios";

export default function CustomerList() {
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [industries, setIndustries] = useState([]);

  // view
  const [viewModal, setViewModal] = useState({ open: false, data: null });

  // delete
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: "",
  });

  const [filters, setFilters] = useState({
    customer_name: "",
    mobile: "",
    email: "",
    industry: "",
  });
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/contact/read`, { params: { status: 1 } })
      .then((res) => setDesignations(res.data))
      .catch(() => {});
  }, []);

  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ASC" });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Token Check
  const [role, setRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/");
      toast.error("Please Login First");
    } else {
      setRole(role);
    }
  }, [router]);

  // Store offset for each scrollable column
  const [columnOffsets, setColumnOffsets] = useState({
    company_name: 0,
    customer_name: 0,
    email: 0,
    website: 0,
    industry: 0,
  });

  // Fetch table data
  const fetchCustomers = async () => {
    try {
      const query = new URLSearchParams({
        page,
        limit: 10,
        search,
        sortBy: sortConfig.key,
        order: sortConfig.direction,
        ...filters,
      }).toString();

      const res = await axios.get(
        `${API_BASE}/api/customers/get-customers?${query}`,
      );

      const result = res.data;

      if (result.success) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Fetching Active Industries
  useEffect(() => {
    const fetchIndustry = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/Industries/industries`, {
          params: { status: 1 },
        });

        // If your API wraps data like { data: [...] }
        setIndustries(res.data.data || res.data);
      } catch (err) {
        console.error("Failed to fetch names:", err);
        setIndustries([]); // fallback
      }
    };

    fetchIndustry();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [page, sortConfig]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchCustomers();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  //  PAGINATION CALCULATIONS
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      <Header />
      <div className="bg-gray-100">
        <div className="bg-white w-full rounded-sm shadow-lg p-3 mt-1 mb-5">
          <div className="flex justify-between items-center">
            <p>
              <Link
                href="/dashboard"
                className="mx-3 text-xl text-gray-400 hover:text-indigo-600"
              >
                <i className="bi bi-house"></i>
              </Link>
              <i className="bi bi-chevron-right"></i>
              <Link
                href="/customer-list"
                className="mx-3 text-md text-gray-700 hover:text-orange-500"
              >
                Customer List
              </Link>
            </p>

            <div>
              <input
                type="text"
                placeholder="🔍 Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border w-sm border-gray-300 text-gray-700 placeholder-gray-400 p-1 px-2 mx-5 rounded-sm focus:ring-1 outline-none focus:ring-orange-200 transition-all text-md"
              />
              <Link
                href="/customer"
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-sm ml-2  "
              >
                + ADD CUSTOMER
              </Link>
            </div>
          </div>
        </div>

        {/* Filters + Table */}

        <div className="mx-4 mb-2">
          <input
            type="text"
            name="customer_name"
            value={filters.customer_name}
            onChange={handleChange}
            placeholder="Enter Customer Name"
            className="border bg-white border-gray-300 rounded-sm px-3 py-2 w-56 mx-2 focus:ring-orange-200 outline-none focus:ring-1"
          />

          <input
            type="text"
            name="contact_number"
            placeholder="Enter Contact Number"
            className="border bg-white border-gray-300 rounded-sm px-3 py-2 w-56 mx-2 focus:ring-orange-200 outline-none focus:ring-1"
            value={filters.contact_number || ""}
            onChange={(e) => {
              const val = e.target.value;

              // Only allow digits
              if (!/^\d*$/.test(val)) return;

              // First digit must be 6, 7, 8, or 9 (Indian mobile numbers)
              if (val.length === 1 && !["6", "7", "8", "9"].includes(val))
                return;

              // Max 10 digits
              if (val.length > 10) return;

              setFilters((p) => ({ ...p, contact_number: val }));
            }}
            maxLength={10}
          />

          <input
            type="text"
            name="email"
            value={filters.email}
            onChange={handleChange}
            placeholder="Enter Email"
            className="border bg-white border-gray-300 rounded-sm px-3 py-2 w-56 mx-2 focus:ring-orange-200 outline-none focus:ring-1"
          />

          <select
            name="industry"
            value={filters.industry}
            onChange={handleChange}
            className="border bg-white border-gray-300 rounded-sm px-3 py-2 w-56 mx-2 focus:ring-orange-200 outline-none focus:ring-1 text-gray-500"
          >
            <option value="">Select Industry</option>
            {industries.map((item, index) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setFilters({
                customer_name: "",
                mobile: "",
                email: "",
                contact_number: "",
                email: "",
                industry: "",
              });
            }}
            className="border cursor-pointer rounded-sm p-0.5 border-gray-200  transition-all text-md  mx-5 px-3 bg-gray-200 text-gray-700 hover:bg-gray-300 text-md text-center"
          >
            Clear
          </button>
        </div>

        <form className="p-2 w-8xl mx-3">
          <div className="bg-white shadow rounded-sm p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full w-8xl border border-gray-200 text-sm text-left">
                <thead className="bg-gray-50  border-b border-gray-200  text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2 text-center">#</th>
                    <th className="px-4 py-2">Company Name </th>
                    <th className="px-4 py-2">Customer Name </th>
                    <th className="px-4 py-2">Email </th>
                    <th className="px-4 py-2">Mobile No.</th>
                    <th className="px-4 py-2">Customer Type</th>
                    <th className="px-4 py-2">Website </th>
                    <th className="px-4 py-2">Industry </th>
                    <th className="px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-4 py-2">{row.company_name}</td>
                        <td className="px-4 py-2 text-orange-500">
                          {row.customer_name}
                        </td>
                        <td className="px-4 py-2">{row.email}</td>
                        <td className="px-4 py-2">{row.mobile}</td>
                        <td className="px-4 py-2">{row.customer_type}</td>
                        <td className="px-4 py-2">{row.website}</td>
                        <td className="px-4 py-2">{row.industry_name}</td>
                        <td className="py-2 px-4  text-lg">
                          {/* <button
                            type="button"
                            className="text-gray-400 hover:text-green-600 cursor-pointer"
                          >
                            <i className="bi bi-eye text-xl"></i>
                          </button> */}
                          <button
                            type="button"
                            onClick={() =>
                              setViewModal({ open: true, data: row })
                            }
                            className="text-gray-400 hover:text-green-600 cursor-pointer"
                          >
                            <i className="bi bi-eye text-xl"></i>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem(
                                "customer_edit_id",
                                JSON.stringify(row.id),
                              );
                              router.push("/edit-customer");
                            }}
                            className="text-gray-400 hover:text-blue-700 mx-2 cursor-pointer"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                id: row.id,
                                name: row.customer_name,
                              })
                            }
                            className="text-gray-400 hover:text-red-600 cursor-pointer"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-4 text-gray-500"
                      >
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-gray-200 bg-white rounded-b-lg">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-sm border bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Info Centered */}
                <span className="text-sm text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of{" "}
                  <span className="font-semibold">{totalPages}</span>
                </span>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-sm border bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Delete Modal` */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-sm  border border-gray-100 overflow-hidden">
            {/* <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2"> */}
            <div className="flex justify-between items-center px-6 py-4  bg-gradient-to-r from-orange-100 to-white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Delete Customer
                </span>
              </div>
              <button
                onClick={() =>
                  setDeleteModal({ open: false, id: null, name: "" })
                }
                className="w-7 h-7 flex items-center justify-center  text-orange-500 text-md"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </div>
              <p className="font-semibold text-gray-800 text-base mb-1">
                {deleteModal.name}
              </p>
              <p className="text-sm text-gray-400">
                This action cannot be undone. Are you sure?
              </p>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={() =>
                  setDeleteModal({ open: false, id: null, name: "" })
                }
                className="flex-1 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(deleteModal.id);
                  setDeleteModal({ open: false, id: null, name: "" });
                }}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Customer Modal */}
      {viewModal.open && viewModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 ">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 ">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 from-orange-100 to-white bg-gradient-to-r ">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7  flex items-center justify-center">
                  <i className="bi bi-person text-orange-500 text-md"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {viewModal.data.customer_name}
                  </p>
                  <p className="text-gray-400 text-md">
                    {viewModal.data.customer_type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewModal({ open: false, data: null })}
                className="w-7 h-7 flex items-center justify-center  text-orange-500 text-md"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-2 gap-4">
              {/* Company*/}
              <div className="bg-gray-50 rounded-sm px-4 py-3 flex items-center gap-3">
                <i className="bi bi-building text-orange-400 text-lg"></i>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Company
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {viewModal.data.company_name || "—"}
                  </p>
                </div>
              </div>

              {/* Customer Name */}
              <div className="bg-gray-50 rounded-sm px-4 py-3 flex items-center gap-3">
                <i className="bi bi-person-circle text-orange-400 text-lg"></i>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Customer Name
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {viewModal.data.customer_name || "—"}
                  </p>
                </div>
              </div>
              {/* Email */}
              <div className="bg-gray-50 rounded-sm px-4 py-3 flex items-center gap-3">
                <i className="bi bi-envelope text-orange-400 text-lg"></i>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-gray-700 break-all">
                    {viewModal.data.email || "—"}
                  </p>
                </div>
              </div>
              {/* Mobile */}
              <div className="bg-gray-50 rounded-sm px-4 py-3 flex items-center gap-3">
                <i className="bi bi-telephone text-orange-400 text-lg"></i>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Mobile
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {viewModal.data.mobile || "—"}
                  </p>
                </div>
              </div>

              {/* Customer Type */}
              <div className="bg-gray-50 rounded-sm px-4 py-3 flex items-center gap-3">
                <i className="bi bi-tag text-orange-400 text-lg"></i>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Customer Type
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {viewModal.data.customer_type || "—"}
                  </p>
                </div>
              </div>

              {/* Website */}
              <div className="bg-gray-50 rounded-sm px-4 py-3 flex items-center gap-3">
                <i className="bi bi-globe text-orange-400 text-lg"></i>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Website
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {viewModal.data.website || "—"}
                  </p>
                </div>
              </div>

              {/* Industry */}
              <div className="bg-gray-50 rounded-sm px-4 py-3 flex items-center gap-3">
                <i className="bi bi-briefcase text-orange-400 text-lg"></i>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Industry
                  </p>
                  <p className="text-sm font-semibold text-gray-700">
                    {viewModal.data.industry_name || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => setViewModal({ open: false, data: null })}
                className="px-5 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
