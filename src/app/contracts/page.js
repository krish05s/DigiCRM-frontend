"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "redaxios";
import Link from "next/link";
import { toast } from "react-toastify";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import Header from "../components/header";
import Select from "react-select";
import { useRouter } from "next/navigation";


export default function Page() {

    const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

    const [formData, setFormData] = useState({
        company_name: "",
        customer_name: "",
        contract_name: "",
        contract_type: "",
        contract_value: "",
        start_date: "",
        end_date: "",
        description: "",
        assignee: "",
    });
    const [editId, setEditId] = useState(null);
    const [contractList, setContractList] = useState([]);
    const [asignee, setAsignee] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [users, setUsers] = useState([]);
    const [token, setToken] = useState("");
    const [company, setCompany] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [filters, setFilters] = useState({
        search: "",
        company_name: "",
        customer_name: "",
        contract_name: "",
        contract_type: "",
        contract_value: "",
        start_date: "",
        end_date: "",
        assignee: "",
        created_by_name: "",
        created_at: "",
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);


    const router = useRouter()

    const [scrollOffsets, setScrollOffsets] = useState({});
    const [loadingColumns, setLoadingColumns] = useState({})


    const APIBase = `${API_BASE}/api/contracts-list`


    //  PAGINATION ADDED HERE
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);


    const fetchData = async () => {
        const res = await axios.get(`${APIBase}/read`, {
            headers: { Authorization: `Bearer ${token}` },
            params: filters
        });
        setContracts(res.data.result || []);
    };


    useEffect(() => {
        const t = localStorage.getItem("token");
        setToken(t);
    }, []);

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, filters]);



    // delete functionality

    const confirmDelete = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            const res = await axios.delete(`${API_BASE}/api/contracts-list/delete/${deleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success("Contract deleted successfully");
                setContracts((prev) => prev.filter(item => item.id !== deleteId));
            } else {
                toast.error("Failed to delete contract");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong!");
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };


    //  PAGINATION CALCULATIONS
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = contracts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(contracts.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };


    // Asignee dropdown api calling
    useEffect(() => {
        const fetchAsignee = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/manage-user/asignee`, {
                    params: { status: 1 },
                });

                const cleanedData = (res.data.data || []).map(item => ({
                    ...item,
                    name: item.name.split(" ")[0] // Only first name
                }));

                setAsignee(cleanedData);

            } catch (err) {
                console.error("Failed to fetch names:", err);
                setAsignee([]); // fallback
            }
        };

        fetchAsignee();
    }, []);



    // Asignee dropdown api calling
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/manage-user/asignee`, {
                    params: { status: 1 },
                });

                setUsers(res.data.data || res.data);

            } catch (err) {
                console.error("Failed to fetch names:", err);
                setAsignee([]); // fallback
            }
        };

        fetchUsers();
    }, []);


    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/contract-types/contracts`, {
                    params: { status: 1 },
                });

                setCompany(res.data.data || res.data);

            } catch (err) {
                console.error("Failed to fetch names:", err);
                setCompany([]); // fallback
            }
        };

        fetchCompany();
    }, []);


    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/customers/customer-name`, {
                    params: { status: 1 },
                });

                setCustomers(res.data.data || res.data);

            } catch (err) {
                console.error("Failed to fetch names:", err);
                setCustomers([]); // fallback
            }
        };

        fetchCustomers();
    }, []);


    // Dynamic Dropdown for contracts types
    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/contract-types/contracts`,
                    { params: { status: 1 } }
                );
                setContractList(res.data.data);
            } catch { }
        };

        fetchContracts();
    }, []);


    const formatDateTime = (dateString) => {
        if (!dateString) return "-";

        const d = new Date(dateString);

        const date = d.toLocaleDateString("en-GB").replace(/\//g, "-");
        const time = d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        return `${date}  ${time}`;
    };

    return (
        <>
            <Header />
            <div className="bg-gray-100">
                {/* Header */}
                <div className="bg-white w-full rounded-2xl shadow-lg p-3 mt-1 mb-5 flex justify-between items-center">
                    <div className="flex items-center text-gray-700">
                        <p>
                            <Link href="/dashboard" className="mx-3 text-xl text-gray-400 hover:text-indigo-600">
                                <i className="bi bi-house"></i>
                            </Link>
                            <i className="bi bi-chevron-right"></i>
                            <Link href="#" className="mx-3 text-md text-gray-700 hover:text-indigo-600">
                                Contract
                            </Link>
                            <i className="bi bi-chevron-right"></i>
                            <Link href="/contracts" className="mx-3 text-md text-gray-700 hover:text-indigo-600">
                                Contract List
                            </Link>
                        </p>
                    </div>

                    <div>
                        <input type="text" placeholder="🔍 Search..." value={filters.search || ""} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="border w-sm border-gray-300 text-gray-700 placeholder-gray-400 p-1 px-2 mx-5 rounded-md" />
                        <Link href="/contracts/add-contracts" className="bg-blue-800 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-900">
                            + ADD CONTRACT
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mx-6 flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 mb-5">

                    <input type="text" name="contract_name" placeholder="Enter Contract Name" value={filters.contract_name || ""} onChange={(e) => setFilters({ ...filters, contract_name: e.target.value })} className="p-2 w-52 border text-gray-700 bg-white rounded-md" />

                    {/* Status */}
                    <select name="customer_name" value={filters.customer_name || ""} onChange={(e) => setFilters({ ...filters, customer_name: e.target.value })} className="p-2 w-52 border text-gray-700 bg-white rounded-md">
                        <option value="">Select Customer</option>
                        {customers.map((item) => (
                            <option key={item.id} value={item.customer_name}>
                                {item.customer_name}
                            </option>
                        ))}
                    </select>

                    {/* Priority */}
                    <select name="contract_type" value={filters.contract_type || ""} onChange={(e) => setFilters({ ...filters, contract_type: e.target.value })} className="p-2 w-52 border text-gray-700 bg-white rounded-md">
                        <option value="">Select Contract Type</option>
                        {contractList.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    {/* Assignee - dynamic API */}
                    <select name="assignee" value={filters.assignee || "-"} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })} className="p-2 w-52 border text-gray-700 bg-white rounded-md">
                        <option value="">Select Assignee</option>

                        {asignee.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    {/* Start Date Range */}
                    <div className="flex items-center border bg-white rounded-md px-2">
                        <span className="mx-1 text-gray-400">Start Date</span>
                        <input type="date" value={filters.start_date || ""} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} className="p-2 w-32 outline-none" />
                    </div>

                    {/* Due Date Range */}
                    <div className="flex items-center border bg-white rounded-md px-2">
                        <span className="mx-1 text-gray-400">Due Date</span>
                        <input type="date" value={filters.end_date || ""} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} className="p-2 w-32 outline-none" />
                    </div>

                    {/* Assignee - dynamic API */}
                    <select name="created_by_name" value={filters.created_by_name || ""} onChange={(e) => setFilters({ ...filters, created_by_name: e.target.value })} className="p-2 w-52 border text-gray-700 bg-white rounded-md">
                        <option value="">Select Created By</option>

                        {users.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    {/* created Date Range */}
                    <div className="flex items-center border bg-white rounded-md px-2">
                        <span className="mx-1 text-gray-400">Created Date</span>
                        <input type="date" value={filters.created_at || ""} onChange={(e) => setFilters({ ...filters, created_at: e.target.value })} className="p-2 w-32 outline-none" />
                    </div>

                    {/* CLEAR BUTTON */}
                    <button type="button" className="border rounded-md p-0.5 bg-gray-200 text-gray-700 hover:bg-gray-300 text-md text-center px-3" onClick={() => setFilters({})}>
                        Clear
                    </button>
                </div>

                {/* Table */}
                <form className="p-1 mx-4">
                    <div className="bg-white shadow-md rounded-2xl p-1 border border-gray-200">
                        <h3 className="mx-2 text-md mt-2">Contract Listing</h3>
                        <hr className="text-gray-300 mx-2 mt-2 mb-3" />
                        <table className=" w-full text-sm text-left text-gray-700 border-collapse mt-2 mb-2 custom-scroll">
                            <thead className="bg-gray-50 text-gray-900  text-xs">
                                <tr>
                                    <th className="py-3 px-5 w-10">#</th>
                                    <th className="py-3 px-4">
                                        Customer
                                    </th>

                                    <th className="py-3 px-4">
                                        Contract Name
                                        
                                    </th>
                                    <th className="py-3 px-4 ">Contract Type
                                       
                                    </th>
                                    <th className="py-3 px-4 ">Contract Value
                                        
                                    </th>
                                    <th className="py-3 px-4 ">Start Date
                                        
                                    </th>
                                    <th className="py-3 px-4 ">End Date
                                     
                                    </th>
                                    <th className="py-3 px-4 ">Assignee
                                    
                                    </th>
                                    <th className="py-3 px-4 ">Created
                                    </th>
                                    <th className="py-3 px-4 ">Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentData.length > 0 ? (
                                    currentData.map((item, index) => (
                                        <tr key={item.id} className={`hover:bg-gray-50 transition font-medium`}>
                                            <td className="py-1 px-4 text-gray-600">
                                                {index + 1}
                                            </td>
                                            <td className="py-2 px-5 text-gray-800">
                                                {item.customer_name}
                                            </td>
                                            <td className="py-2 px-5 text-gray-800">
                                                {item.contract_name}
                                            </td>
                                            <td className="py-2 px-5 text-gray-800">
                                                {item.contract_type}
                                            </td>
                                            <td className="py-2 px-5 text-gray-800">
                                                {item.contract_value}
                                            </td>
                                            <td className="py-1 px-4">
                                                {item.start_date
                                                    ? new Date(item.start_date).toLocaleDateString("en-GB").replace(/\//g, "-")
                                                    : "-"}
                                            </td>

                                            <td className="py-2 px-4 ">
                                                {item.end_date
                                                    ? new Date(item.end_date).toLocaleDateString("en-GB").replace(/\//g, "-")
                                                    : "-"}
                                            </td>

                                            <td style={{ display: "flex", gap: "1px", alignItems: "center" }} className="py-2 px-4">
                                                {String(item.assignee)
                                                    .split(",")
                                                    .map((name, index) => {
                                                        const letter = name.trim().charAt(0).toUpperCase();

                                                        return (
                                                            <div key={index} title={name.trim()} className="px-3 py-1.5 bg-blue-800 text-white rounded-full font-semibold text-sm flex justify-center items-center min-w-[28px] text-center select-none">
                                                                {letter}
                                                            </div>
                                                        );
                                                    })}
                                            </td>

                                            <td className="py-2 px-4 w-50">
                                                {item.created_by_name} | {formatDateTime(item.created_at)}
                                            </td>

                                            <td className="py-2 px-4  text-lg">
                                                <button type="button" onClick={() => { localStorage.setItem("view_contract_data", JSON.stringify(item)); router.push("/contracts/view-contracts"); }} className="text-gray-400 hover:text-green-600">
                                                    <i className="bi bi-eye text-xl"></i>
                                                </button>
                                                <button type="button" onClick={() => { localStorage.setItem("edit_contract_data", JSON.stringify(item)); router.push("/contracts/edit-contracts"); }} className="text-gray-400 hover:text-blue-800 mx-2">
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button type="button" onClick={() => confirmDelete(item.id)} className="text-gray-400 hover:text-red-800">
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center text-gray-500 py-3">
                                            No records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-3 border-gray-200 bg-white rounded-b-lg">
                                {/* Previous Button */}
                                <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium rounded-md border bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Previous
                                </button>

                                {/* Page Info Centered */}
                                <span className="text-sm text-gray-600">
                                    Page <span className="font-semibold">{currentPage}</span> of{" "}
                                    <span className="font-semibold">{totalPages}</span>
                                </span>

                                {/* Next Button */}
                                <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium rounded-md border bg-blue-800 text-white hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Next
                                </button>
                            </div>
                        )}

                    </div>
                </form>


            </div>


            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900/30 z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
                        <h2 className="text-lg font-semibold mb-4 text-red-500">Confirm Delete</h2>
                        <p className="mb-6">Are you sure you want to delete this contract?</p>
                        <div className="flex justify-center gap-4">
                            <button type="button" onClick={handleDelete} className="bg-blue-800 text-white px-8 py-2 rounded-xl hover:bg-blue-900">
                                Yes
                            </button>
                            <button type="button" onClick={() => setShowDeleteModal(false)} className="bg-gray-300 text-gray-800 px-8 py-2 rounded-xl hover:bg-gray-400">
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}

