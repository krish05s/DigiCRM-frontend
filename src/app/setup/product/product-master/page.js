"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "redaxios";
import Link from "next/link";
import { toast } from "react-toastify";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import Header from "@/app/components/header";

export default function Page() {

    const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

    const [formdata, setFormData] = useState({
        product_name: "",
        product_category: "",
        unit: "",
        product_code: "",
        product_type: "",
        purchase_price: "",
        sales_price: "",
        product_code_type: "",
        code: "",
        current_stocks: "",
        description: "",
    });
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [products, setProducts] = useState([]);
    const [productCategory, setProductCategory] = useState([]);
    const [productUnit, setProductUnit] = useState([]);
    const [scrollOffsets, setScrollOffsets] = useState({});
    const [filters, setFilters] = useState({
        product_name: "",
        product_category: "",
        unit: "",
        product_code: "",
        product_type: "",
        purchase_price: "",
        sales_price: "",
        product_code_type: "",
        code: "",
        current_stocks: "",
        description: "",
    });
    const [viewProduct, setViewProduct] = useState(null);


    const APIBase = `${API_BASE}/api/product-master`


    //  PAGINATION ADDED HERE
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${APIBase}/read`, {
                params: {
                    search1: filters.product_name,
                    search2: filters.product_category,
                    search3: filters.product_code,
                    search4: filters.unit,
                    search5: filters.code,
                    search6: filters.purchase_price,
                    search7: filters.current_stocks,
                    search8: filters.product_type,
                },
            });
            setProducts(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load contacts");
        }
    };


    useEffect(() => {
        const delay = setTimeout(() => {
            fetchData();
        }, 300); // 300ms debounce

        return () => clearTimeout(delay);
    }, [filters]);



    // useEffect(() => {
    //     fetchData();
    // }, [fetchData]);


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`${APIBase}/update/${editId}`, formdata);
                toast.success("Updated successfully");
                await fetchData();
            } else {
                await axios.post(`${APIBase}/insert`, formdata);
                toast.success("Inserted successfully");
                await fetchData();
            }
            resetForm();
        } catch (err) {
            console.error("Error saving:", err);
            toast.error("Error saving data");
        }
    };


    const resetForm = () => {
        setFormData({
            product_name: "",
            product_category: "",
            unit: "",
            product_code: "",
            product_type: "",
            purchase_price: "",
            sales_price: "",
            product_code_type: "",
            code: "",
            current_stocks: "",
            description: "",
        });
        setEditId(null);
        setShowForm(false);
    }

    // Code for Update Data
    const handleEdit = (item) => {
        setEditId(item.id);
        setFormData({
            product_name: item.product_name || "",
            product_category: item.product_category || "",
            unit: item.unit || "",
            product_code: item.product_code || "",
            product_type: item.product_type || "",
            purchase_price: item.purchase_price || "",
            sales_price: item.sales_price || "",
            product_code_type: item.product_code_type || "",
            code: item.code || "",
            current_stocks: item.current_stocks || "",
            description: item.description || "",
        });
        setShowForm(true);
    };



    // to fetch active contact designations

    useEffect(() => {
        const fetchProductCategory = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/product-category/product-category`, {
                    params: { status: 1 }
                });
                setProductCategory(res.data.data);
            } catch (err) {
                console.error("Failed to fetch designations:", err);
            }
        };

        fetchProductCategory();
    }, []);

    useEffect(() => {
        const fetchProductUnit = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/product-unit/product-unit`, {
                    params: { status: 1 },
                });

                // If your API wraps data like { data: [...] }
                setProductUnit(res.data.data || res.data);
            } catch (err) {
                console.error("Failed to fetch company names:", err);
                setProductUnit([]); // fallback
            }
        };

        fetchProductUnit();
    }, []);



    //  PAGINATION CALCULATIONS

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
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
                            <Link href="/setup" className="mx-3 text-md text-gray-700 hover:text-indigo-600">
                                Setup
                            </Link>
                            <i className="bi bi-chevron-right"></i>
                            <Link href="#" className="mx-3 text-md text-gray-700 hover:text-indigo-600">
                                Product
                            </Link>
                            <i className="bi bi-chevron-right"></i>
                            <Link href="/setup/product/product-master" className="mx-3 text-md text-gray-700 hover:text-indigo-600">
                                Product Master
                            </Link>
                        </p>
                    </div>

                    <div>
                        <button type="button" onClick={() => { setEditId(null); setFormData({ product_name: "", product_category: "", unit: "", product_code: "", product_type: "", purchase_price: "", sales_price: "", product_code_type: "", code: "", current_stocks: "", description: "" }); setShowForm(true); }} className="bg-blue-800 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-900">
                            + ADD PRODUCT
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mx-6">

                    <input type="text" name="product_name" placeholder="Enter Product Name" className="p-2 w-53 mb-3 border text-gray-500 bg-white rounded-md mx-2" value={filters.product_name} onChange={handleFilterChange} />

                    <select name="product_category" value={filters.product_category} onChange={handleFilterChange} className="mx-2 bg-white text-gray-500 w-53 p-2 border rounded-md">
                        <option value="">Select Product Category</option>
                        {productCategory.map((item) => (
                            <option key={item.id || item.name} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <input type="text" name="product_code" placeholder="Enter Product Code" className="p-2 w-53 mb-3 border text-gray-500 bg-white rounded-md mx-2" value={filters.product_code} onChange={handleFilterChange} />

                    <select name="unit" value={filters.unit} onChange={handleFilterChange} className="mx-2 bg-white text-gray-500 w-53 p-2 border rounded-md">
                        <option value="">Select Product Unit</option>
                        {productUnit.map((item) => (
                            <option key={item.id || item.name} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <input type="text" name="code" placeholder="Enter Code" className="p-2 w-53 mb-3 border text-gray-500 bg-white rounded-md mx-2" value={filters.code} onChange={handleFilterChange} />

                    <input type="text" name="purchase_price" placeholder="Enter Purchase Price" className="p-2 w-53 mb-3 border text-gray-500 bg-white rounded-md mx-2" value={filters.purchase_price} onChange={handleFilterChange} />

                    <input type="text" name="current_stocks" placeholder="Enter Current Stocks" className="p-2 w-53 mb-3 border text-gray-500 bg-white rounded-md mx-2" value={filters.current_stocks} onChange={handleFilterChange} />

                    <select name="product_type" value={filters.product_type} onChange={handleFilterChange} className="mx-2 bg-white text-gray-500 w-53 p-2 border rounded-md">
                        <option value="">Select Product Type</option>
                        <option value="Both">Both</option>
                        <option value="sales">Sales</option>
                        <option value="purchase">Purchase</option>
                    </select>

                    <button type="button" onClick={() => { setFilters({ product_name: "", product_category: "", product_code: "", unit: "", code: "", purchase_price: "", current_stocks: "", product_type: "" }); fetchData(); }}
                        className="border rounded-md p-0.5 bg-gray-200 text-gray-700 hover:bg-gray-300 text-md text-center mx-5 px-3">
                        Clear
                    </button>
                </div>

                {/* Table */}
                <form className="p-1 mx-4">
                    <div className="bg-white shadow-md rounded-2xl p-1 border border-gray-200">
                        <table className=" w-full text-sm text-left text-gray-700 border-collapse mt-2 mb-2">
                            <thead className="bg-gray-50 text-gray-900  text-xs">
                                <tr>
                                    <th className="py-3 px-5 w-10">#</th>
                                    <th className="py-3 px-4 text-center">
                                        Product Name
                                    </th>

                                    <th className="py-3 px-4 text-center">
                                        Product Category
                                    </th>
                                    <th className="py-3 px-4 text-center">Product Code
                                    </th>
                                    <th className="py-3 px-4 text-center">Unit
                                    </th>
                                    <th className="py-3 px-4 text-center">Code
                                    </th>
                                    <th className="py-3 px-4 text-center">Purchase Price
                                    </th>
                                    <th className="py-3 px-4 text-center">Current Stocks
                                    </th>
                                    <th className="py-3 px-4 text-center">Product Type
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
                                                {item.product_name}
                                            </td>
                                            <td className="py-1 px-4 text-center text-gray-800">
                                                {
                                                    productCategory.find(
                                                        c => c.id == item.product_category
                                                    )?.name
                                                }
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {item.product_code}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {item.unit}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {item.code}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {item.purchase_price}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {item.current_stocks}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                {item.product_type}
                                            </td>
                                            <td className="py-2 px-4 text-center text-lg">
                                                <button type="button" onClick={() => setViewProduct(item)} className="text-gray-400 text-xl hover:text-green-700 mx-1" title="View Product">
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button type="button" onClick={() => handleEdit(item)} className="text-gray-400 hover:text-blue-800 mx-1">
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center text-gray-500 py-3">
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

                {/* Modal remains same */}
                {showForm && (
                    <div className="fixed inset-0 bg-gray-900/30 z-50 flex justify-center items-center overflow-y-auto">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-[800px] relative my-10 max-h-[85vh] overflow-y-auto">
                            <button type="button" onClick={() => { setShowForm(false); }}
                                className="absolute top-5 right-4 text-xl text-gray-500 hover:text-gray-800">
                                ✕
                            </button>

                            <h3 className="text-lg mb-3 text-black">
                                {editId ? "Edit" : "Add"} Product
                                <hr className="mt-3 mb-5 text-gray-300" />
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <label className="block text-sm text-gray-600  mb-1">
                                            Product Name *
                                        </label>
                                        <input type="text" name="product_name" value={formdata.product_name} onChange={handleChange} className="w-full border rounded p-2" required />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600  mb-1">
                                            Product Category *
                                        </label>
                                        <select name="product_category" value={formdata.product_category} onChange={handleChange} className="w-full border rounded p-2 ">
                                            <option value="">Select Product Category</option>
                                            {productCategory.map((item) => (
                                                <option key={item.id || item.name} value={item.id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Unit
                                        </label>
                                        <select name="unit" value={formdata.unit} onChange={handleChange} className="w-full border rounded p-2">
                                            <option value="">Select Unit</option>
                                            {productUnit.map((item) => (
                                                <option key={item.id || item.name} value={item.name}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600  mb-1">
                                            Product Code *
                                        </label>
                                        <input type="text" name="product_code" value={formdata.product_code} onChange={handleChange} className="w-full border rounded p-2" required />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600  mb-1">
                                            Product Type *
                                        </label>
                                        <select name="product_type" value={formdata.product_type} onChange={handleChange} className="w-full border rounded p-2">
                                            <option value="Both">Both</option>
                                            <option value="sales">Sales</option>
                                            <option value="purchase">Purchase</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600  mb-1">
                                            Purchase Price *
                                        </label>
                                        <input type="text" name="purchase_price" value={formdata.purchase_price} onChange={handleChange} className="w-full border rounded p-2" required />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600  mb-1">
                                            Sales Price *
                                        </label>
                                        <input type="text" name="sales_price" value={formdata.sales_price} onChange={handleChange} className="w-full border rounded p-2" required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div>
                                            <label className="block text-sm text-gray-600  mb-1">
                                                Product Code Type *
                                            </label>
                                            <select name="product_code_type" value={formdata.product_code_type} onChange={handleChange} className="w-full border rounded p-2">
                                                <option value="">-- Select --</option>
                                                <option value="SAC Code">SAC Code</option>
                                                <option value="HSN Code">HSN Code</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-600  mb-1">
                                                Code *
                                            </label>
                                            <input type="text" name="code" value={formdata.code} onChange={handleChange} className="w-full border rounded p-2" required />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600  mb-1">
                                            Current Stocks *
                                        </label>
                                        <input type="text" name="current_stocks" value={formdata.current_stocks} onChange={handleChange} className="w-full border rounded p-2" required />
                                    </div>

                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600  mb-1">
                                        Description
                                    </label>
                                    <textarea type="text" name="description" value={formdata.description} onChange={handleChange} className="w-full border rounded p-2" required />
                                </div>

                                <div className="flex justify-end gap-2 mt-2">
                                    <button type="button" onClick={() => { setShowForm(false); }}
                                        className="px-4 py-2 bg-gray-200 rounded-lg">
                                        Cancel
                                    </button>
                                    <button type="submit" className="bg-blue-800 text-white px-4 py-1.5 rounded-lg">
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                )}

                {/* ===================== VIEW PRODUCT MODAL ===================== */}
                {viewProduct && (
                    <div className="fixed inset-0 bg-gray-900/40 z-50 flex justify-center items-center overflow-y-auto">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-[800px] relative my-10 max-h-[85vh] overflow-y-auto">
                            <button type="button" onClick={() => setViewProduct(null)} className="absolute top-5 right-4 text-xl text-gray-500 hover:text-gray-800">
                                ✕
                            </button>

                            <h3 className="text-lg mb-3 text-black ">
                                View Product
                                <hr className="mt-3 mb-5 text-gray-300" />
                            </h3>

                            <div className="grid grid-cols-2 gap-3 mb-3">

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Product Name</label>
                                    <input type="text" value={viewProduct.product_name || ""} disabled className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Product Category</label>
                                    <input type="text" value={
                                        productCategory.find(
                                            c => c.id == viewProduct.product_category
                                        )?.name
                                    } disabled className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Unit</label>
                                    <input type="text" value={viewProduct.unit || ""} disabled className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Product Code</label>
                                    <input type="text" value={viewProduct.product_code || ""} disabled className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Product Type</label>
                                    <input type="text" value={viewProduct.product_type || ""} disabled className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Purchase Price</label>
                                    <input type="text" value={viewProduct.purchase_price || ""} disabled className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed" />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Sales Price</label>
                                    <input type="text" value={viewProduct.sales_price || ""} disabled className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed" />
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Product Code Type</label>
                                        <input type="text" value={viewProduct.product_code_type || ""} disabled className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed" />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Code</label>
                                        <input type="text" value={viewProduct.code || ""} disabled className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Current Stocks</label>
                                    <input type="text" value={viewProduct.current_stocks || ""} disabled className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Description</label>
                                <textarea value={viewProduct.description || ""} disabled rows={3} className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed" />
                            </div>

                            <div className="flex justify-end mt-4">
                                <button type="button" onClick={() => setViewProduct(null)} className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
