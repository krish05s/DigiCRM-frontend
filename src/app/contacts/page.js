"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "redaxios";
import Link from "next/link";
import { toast } from "react-toastify";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import Header from "../components/header";

export default function Page() {

    const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    const [formdata, setFormData] = useState({
        customer_id: "",
        company_name: "",
        customer_name: "",
        contact_person: "",
        contact_number: "",
        email: "",
        contact_designation: "",
    });

    const [filters, setFilters] = useState({
        company_name: "",
        customer_name: "",
        contact_person: "",
        contact_number: "",
        email: "",
        contact_designation: "",
    });

    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [designations, setDesignations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [companyname, setCompanyname] = useState([]);
    const [customername, setCustomername] = useState([]);
    const [scrollOffsets, setScrollOffsets] = useState({});

    const API_base = `${API_BASE}/api/contacts`;

    /* ---------------- FETCH CONTACTS ---------------- */
    const fetchData = useCallback(async () => {
        try {
            const res = await axios.get(`${API_base}/read`, {
                params: {
                    search1: filters.company_name,
                    search2: filters.customer_name,
                    search3: filters.contact_person,
                    search4: filters.contact_number,
                    search5: filters.email,
                    search6: filters.contact_designation,
                },
            });
           setContacts(res.data.data || []);
        } catch {
            toast.error("Failed to load contacts");
        }
    }, [filters]);

    useEffect(() => {
        const delay = setTimeout(fetchData, 300);
        return () => clearTimeout(delay);
    }, [fetchData]);

    /* ---------------- FETCH DROPDOWNS ---------------- */
    useEffect(() => {
        axios
            .get(`${API_BASE}/api/contact/read`, { params: { status: 1 } })
            .then((res) => setDesignations(res.data))
            .catch(() => { });
    }, []);

    useEffect(() => {
        axios.get(`${API_BASE}/api/organizations/organization-name`)
            .then((res) => setCompanyname(res.data.data || res.data))
            .catch(() => setCompanyname([]));
    }, []);

    const fetchCustomersByCompany = async (companyId) => {
        if (!companyId) {
            setCustomername([]);
            return;
        }
        try {
            const res = await axios.get(`${API_BASE}/api/customers/customer-name`,
                { params: { company_name: companyId } }
            );
            setCustomername(res.data.data || []);
        } catch {
            setCustomername([]);
        }
    };

    /* ---------------- HANDLERS ---------------- */
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((p) => ({ ...p, [name]: value }));
    };

    const handleFilterCompanyChange = async (e) => {
        const companyId = e.target.value;
        setFilters((p) => ({ ...p, company_name: companyId, customer_name: "" }));
        await fetchCustomersByCompany(companyId);
    };

    const handleFormCompanyChange = async (e) => {
        const companyId = e.target.value;
        setFormData((p) => ({
            ...p,
            company_name: companyId, // INT
            customer_id: "",         // reset ID
            customer_name: ""        // reset name
        }));

        await fetchCustomersByCompany(companyId);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            customer_id: "",
            company_name: "",
            customer_name: "",
            contact_person: "",
            contact_number: "",
            email: "",
            contact_designation: "",
        });
        setEditId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            editId
                ? await axios.put(`${API_base}/update/${editId}`, formdata)
                : await axios.post(`${API_base}/insert`, formdata);
            toast.success("Saved successfully");
            fetchData();
            resetForm();
        } catch {
            toast.error("Error saving data");
        }
    };

    const handleEdit = async (item) => {
        const company = companyname.find(
            c => c.organization_name === item.company_name
        );

        setEditId(item.id);

        // FIRST load customers
        await fetchCustomersByCompany(company?.id);

        // THEN set formdata
        setFormData({
            customer_id: item.customer_id,   // ✅ ID from DB
            company_name: company?.id || "",
            customer_name: item.customer_name,
            contact_person: item.contact_person,
            contact_number: item.contact_number,
            email: item.email,
            contact_designation: item.contact_designation,
        });

        setShowForm(true);
    };


    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        await axios.delete(`${API_base}/delete/${id}`);
        fetchData();
    };




    /* ---------------- PAGINATION ---------------- */
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentData = contacts.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.ceil(contacts.length / itemsPerPage);

    const handlePageChange = (page) => {

        if (page < 1) return;
        if (page > totalPages) return;

        setCurrentPage(page);

    };
    return (
        <>
            <Header />
            <div className="bg-gray-100">
                {/* Header */}
                <div className="bg-white w-full rounded shadow-lg p-3 mt-1 mb-5 flex justify-between items-center">
                    <div className="flex items-center text-gray-700">
                        <p>
                            <Link href="/dashboard" className="mx-3 text-xl text-gray-400 hover:text-indigo-600">
                                <i className="bi bi-house"></i>
                            </Link>
                            <i className="bi bi-chevron-right"></i>
                            <Link href="#" className="mx-3 text-md text-gray-700 hover:text-orange-500">
                                Customer
                            </Link>
                            <i className="bi bi-chevron-right"></i>
                            <Link href="/contacts" className="mx-3 text-md text-gray-700 hover:text-orange-500">
                                Contacts
                            </Link>
                        </p>
                    </div>

                    <div>
                        <button type="button" onClick={() => setShowForm(true)} className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600">
                            + ADD CONTACT
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mx-6">

                    <select name="company_name" value={filters.company_name} onChange={handleFilterCompanyChange} className="mx-2 bg-white text-gray-500 w-53 p-2 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-orange-200">
                        <option value="">Select Company Name</option>
                        {companyname.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.organization_name}
                            </option>
                        ))}
                    </select>

                    <select name="customer_name" value={filters.customer_name} onChange={handleFilterChange} className="mx-2 bg-white text-gray-500 w-53 p-2 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-orange-200">
                        <option value="">Select Customer Name</option>
                        {customername.map((item) => (
                            <option key={item.id} value={item.customer_name}>
                                {item.customer_name}
                            </option>
                        ))}
                    </select>

                    <input type="text" name="contact_person" placeholder="Enter Contact Person" className="p-2 w-53 mb-3 border border-gray-300 text-gray-500 bg-white rounded-sm mx-2 outline-none focus:ring-1 focus:ring-orange-200 " value={filters.contact_person} onChange={handleFilterChange} />

                    <input type="text" name="contact_number" placeholder="Enter Contact Number" className="p-2 w-53 mb-3 border border-gray-300 text-gray-500 bg-white rounded-sm mx-2 outline-none focus:ring-1 focus:ring-orange-200" value={filters.contact_number} onChange={handleFilterChange} />

                    <input type="text" name="email" placeholder="Enter email" className="p-2 w-53 mb-3 border border-gray-300 text-gray-500 bg-white rounded-sm mx-2 outline-none focus:ring-1 focus:ring-orange-200" value={filters.email} onChange={handleFilterChange} />

                    <select name="contact_designation" value={filters.contact_designation} onChange={handleFilterChange} className="mx-2 bg-white text-gray-500 w-53 p-2 border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-orange-200">
                        <option value="">Select Contact Designation</option>
                        {designations.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <button type="button" onClick={() => { setFilters({ company_name: "", customer_name: "", contact_person: "", contact_number: "", email: "", contact_designation: "", }); fetchData(); }}
                        className=" rounded-md p-0.5 bg-gray-200 text-gray-700 hover:bg-gray-300 text-md text-center mx-5 px-3">
                        Clear
                    </button>
                </div>

                {/* Table */}
                <form className="p-1 mx-4">
                    <div className="bg-white shadow-md rounded-2xl p-1 border border-gray-200">
                        <table className=" w-full text-sm text-left text-gray-700 border-collapse mt-2 mb-2">
                            <thead className="  border-b border-gray-200  text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-5 w-10">#</th>
                                    <th className="py-3 px-4 text-center">
                                        Company Name
                                    </th>

                                    <th className="py-3 px-4 ">
                                        Customer Name
                                    </th>
                                    <th className="py-3 px-4 text-center">
                                        Contact Person
                                    </th>
                                    <th className="py-3 px-4 text-center">
                                        Contact Number                           
                                    </th>
                                    <th className="py-3 px-4 text-center">Email
                                                                      </th>
                                    <th className="py-3 px-4 text-center">
                                        Contact Designation
                                    </th>
                                    <th className="py-3 px-4 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentData.length > 0 ? (
                                    currentData.map((item, index) => (
                                        <tr key={item.id} className={`hover:bg-gray-50 transition`}>
                                            <td className="py-1 px-4 text-gray-600">
                                                {index + 1}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {item.company_name}
                                            </td>
                                            <td className="py-1 px-4 font-medium text-orange-500">
                                                {item.customer_name}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {item.contact_person}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {item.contact_number}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {item.email}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {item.designation_name}
                                            </td>
                                            <td className="py-2 px-4 text-center text-lg">
                                                <button type="button" onClick={() => handleEdit(item)} className="text-gray-400 hover:text-blue-700 mx-2">
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button type="button" onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600">
                                                    <i className="bi bi-trash3"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center text-gray-500 py-3">
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
                                <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium rounded-md border bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Next
                                </button>
                            </div>
                        )}

                    </div>
                </form>

                {/* Modal remains same */}
                {showForm && (
                    <div className="fixed inset-0 bg-gray-900/30 z-50 flex justify-center items-center">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-[500px] relative">
                            <button type="button" onClick={() => { setShowForm(false); }}
                                className="absolute top-3 right-4 text-xl text-orange-500 hover:text-orange-600">
                                ✕
                            </button>

                            <h3 className="text-lg mb-3 text-black">
                                {editId ? "Edit" : "Add"} Table Contacts
                                <hr className="mt-3 mb-5 text-gray-300" />
                            </h3>
                            <form onSubmit={handleSubmit}>

                                <label className="block text-sm  text-gray-500 mb-2">Comapany Name *</label>
                                <select name="company_name" value={formdata.company_name} onChange={handleFormCompanyChange} className="w-full border rounded-sm p-2 mb-5 outline-none focus:ring-1 focus:ring-orange-200 border-gray-300 ">
                                    <option value="">Select Company Name</option>
                                    {companyname.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.organization_name}
                                        </option>
                                    ))}
                                </select>


                                <label className="block text-sm  text-gray-500 mb-2">Customer Name *</label>
                                <select
                                    name="customer_id"
                                    value={formdata.customer_id}
                                    onChange={(e) => {
                                        const selectedId = Number(e.target.value); // ✅ force INT
                                        const selectedCustomer = customername.find(
                                            c => c.id === selectedId
                                        );

                                        setFormData(p => ({
                                            ...p,
                                            customer_id: selectedId,                 // ✅ PRIMARY KEY
                                            customer_name: selectedCustomer?.customer_name || ""
                                        }));
                                    }}
                                    className="w-full border rounded-sm p-2 mb-5 outline-none focus:ring-1 focus:ring-orange-200 border-gray-300 "
                                >
                                    <option value="">Select Customer Name</option>
                                    {customername.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.customer_name}
                                        </option>
                                    ))}
                                </select>



                                <label className="block text-sm  text-gray-500 mb-2">Contact Person *</label>
                                <input type="text" className="border p-2 w-md rounded-sm mb-3 focus:ring-1 focus:ring-orange-200 outline-none border-gray-300" name="contact_person" value={formdata.contact_person} onChange={handleChange} />

                                <label className="block text-sm  text-gray-500 mb-2">Contact Number *</label>
                                <input type="text" className="border p-2 w-md rounded-sm mb-3 focus:ring-1 focus:ring-orange-200 outline-none border-gray-300" name="contact_number" value={formdata.contact_number} onChange={handleChange} />

                                <label className="block text-sm  text-gray-500 mb-2">Email</label>
                                <input type="text" className="border p-2 w-md rounded-sm    mb-3 focus:ring-1 focus:ring-orange-200 outline-none border-gray-300" name="email" value={formdata.email} onChange={handleChange} />

                                <label className="block text-sm  text-gray-500 mb-2">Contact Designation *</label>
                                <select name="contact_designation" value={formdata.contact_designation} onChange={handleChange} className="w-full border rounded-sm p-2 mb-5 outline-none focus:ring-1 focus:ring-orange-200 border-gray-300 ">
                                    <option value="">Select Contact Designation</option>
                                    {designations.map((item) => (
                                        <option key={item.id || item.name} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>


                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => { setShowForm(false); }}
                                        className="px-4 py-2 rounded-sm    border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" className="bg-orange-500  hover:bg-orange-600 text-white px-4 py-1.5 rounded-sm">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div >
        </>
    );
}
