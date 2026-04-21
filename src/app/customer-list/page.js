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


  const [filters, setFilters] = useState({
    customer_name: "",
    mobile: "",
    email: "",
    industry: "",
  });
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

      const res = await axios.get(`${API_BASE}/api/customers/get-customers?${query}`);

      const result = res.data;

      if (result.success) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }

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
              <Link href="/dashboard" className="mx-3 text-xl text-gray-400 hover:text-indigo-600">
                <i className="bi bi-house"></i>
              </Link>
              <i className="bi bi-chevron-right"></i>
              <Link href="/customer-list" className="mx-3 text-md text-gray-700 hover:text-orange-500">
                Customer List
              </Link>
            </p>

            <div>

              <input type="text" placeholder="🔍 Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border w-sm border-gray-300 text-gray-700 placeholder-gray-400 p-1 px-2 mx-5 rounded-sm focus:ring-1 outline-none focus:ring-orange-200 transition-all text-md" />
              <Link href="/customer" className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-sm ml-2  ">
                + ADD CUSTOMER
              </Link>
            </div>
          </div>
        </div>

        {/* Filters + Table */}

        <div className="mx-4 mb-2">
          <input type="text" name="customer_name" value={filters.customer_name} onChange={handleChange} placeholder="Enter Customer Name" className="border bg-white border-gray-300 rounded-sm px-3 py-2 w-56 mx-2 focus:ring-orange-200 outline-none focus:ring-1" />

          <input type="text" name="mobile" value={filters.mobile} onChange={handleChange} placeholder="Enter Mobile No." className="border bg-white border-gray-300 rounded-sm px-3 py-2 w-56 mx-2 focus:ring-orange-200 outline-none focus:ring-1" />

          <input type="text" name="email" value={filters.email} onChange={handleChange} placeholder="Enter Email" className="border bg-white border-gray-300 rounded-sm px-3 py-2 w-56 mx-2 focus:ring-orange-200 outline-none focus:ring-1" />

          <select name="industry" value={filters.industry} onChange={handleChange} className="border  text-grey-400 bg-white border-gray-300 rounded-sm px-3 py-2 w-56 mx-2 focus:ring-orange-200 outline-none   focus:ring-1">
            <option value="">Select Industry</option>
            {industries.map((item, index) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          <button type="button" onClick={() => { setFilters({ customer_name: "", mobile: "", email: "", contact_number: "", email: "", industry: "" }); }}
            className="border cursor-pointer rounded-sm p-0.5 border-gray-200  transition-all text-md  mx-5 px-3 bg-gray-200 text-gray-700 hover:bg-gray-300 text-md text-center">
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
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2">{indexOfFirstItem + index + 1}</td>
                        <td className="px-4 py-2">{row.company_name}</td>
                        <td className="px-4 py-2 text-orange-500">{row.customer_name}</td>
                        <td className="px-4 py-2">{row.email}</td>
                        <td className="px-4 py-2">{row.mobile}</td>
                        <td className="px-4 py-2">{row.customer_type}</td>
                        <td className="px-4 py-2">{row.website}</td>
                        <td className="px-4 py-2">{row.industry_name}</td>
                        <td className="py-2 px-4  text-lg">
                          <button type="button" className="text-gray-400 hover:text-green-600 cursor-pointer">
                            <i className="bi bi-eye text-xl"></i>
                          </button>
                          <button type="button" onClick={() => { localStorage.setItem("customer_edit_id", JSON.stringify(row.id)); router.push("/edit-customer"); }} className="text-gray-400 hover:text-blue-700 mx-2 cursor-pointer">
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button type="button"  className="text-gray-400 hover:text-red-600 cursor-pointer">
                            <i className="bi bi-trash3"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-gray-500">No data found</td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-gray-200 bg-white rounded-b-lg">
                {/* Previous Button */}
                <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium rounded-sm border bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>

                {/* Page Info Centered */}
                <span className="text-sm text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of{" "}
                  <span className="font-semibold">{totalPages}</span>
                </span>

                {/* Next Button */}
                <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium rounded-sm border bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
