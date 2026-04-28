import React from 'react'
import Link from "next/link";
import Header from '@/app/components/header';
import useAuth from '@/app/components/useAuth';

export default function Page() {

    const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
    useAuth();
    
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
                                Sales
                            </Link>
                            <i className="bi bi-chevron-right"></i>
                            <Link href="#" className="mx-3 text-md text-gray-700 hover:text-indigo-600">
                                Inquiry
                            </Link>

                        </p>
                    </div>

                    <div>
                        <Link href="/sales/inquiry/add-inquiry" className="bg-blue-800 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-900">
                            + ADD INQUIRY
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                {/* <div className="mx-6">

                    <input type="text" name="name" placeholder="Enter Name" className="p-2 w-53 mb-3 border text-gray-500 bg-white rounded-md mx-2" value={filters.name} onChange={handleFilterChange} />

                    <input type="text" name="email" placeholder="Enter Email" className="p-2 w-53 mb-3 border text-gray-500 bg-white rounded-md mx-2" value={filters.email} onChange={handleFilterChange} />

                    <input type="text" name="mobile" placeholder="Enter Mobile No." className="p-2 w-53 mb-3 border text-gray-500 bg-white rounded-md mx-2" value={filters.mobile} onChange={handleFilterChange} />

                    <input type="date" name="date_of_birth" className="p-2 w-53 mb-3 border text-gray-500 bg-white rounded-md mx-2" value={filters.date_of_birth} onChange={handleFilterChange} />

                    <select name="role" value={filters.role} onChange={handleFilterChange} className="mx-2 bg-white text-gray-500 w-53 p-2 border rounded-md">
                        <option value="">Select Role</option>
                        {roles.map((item) => (
                            <option key={item.id || item.name} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <select name="designation" value={filters.designation} onChange={handleFilterChange} className="mx-2 bg-white text-gray-500 w-53 p-2 border rounded-md">
                        <option value="">Select Designation</option>
                        {designations.map((item) => (
                            <option key={item.id || item.name} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <input type="date" name="date_of_joining" className="p-2 w-53 mb-3 border text-gray-500 bg-white rounded-md mx-2" value={filters.date_of_joining} onChange={handleFilterChange} />

                    <select name="status" value={filters.status} onChange={handleFilterChange} className="mx-2 bg-white text-gray-500 w-53 p-2 border rounded-md">
                        <option value="">Select Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                    </select>

                    <button type="button" onClick={resetFilter}
                        className="border rounded-md p-0.5 bg-gray-200 text-gray-700 hover:bg-gray-300 text-md text-center mx-5 px-3">
                        Clear
                    </button>
                </div> */}

                {/* Table */}
                <form className="p-1 mx-4">
                    <div className="bg-white shadow-md rounded-2xl p-1 border border-gray-200">
                        <table className=" w-full text-sm text-left text-gray-700 border-collapse mt-2 mb-2">
                            <thead className="bg-gray-50 text-gray-900  text-xs">
                                <tr>
                                    <th className="py-3 px-5 w-10">#</th>
                                    <th className="py-3 px-4">
                                        Name
                                        {/* <ColumnScroll columnKey="name" /> */}
                                    </th>

                                    <th className="py-3 px-4">
                                        Email
                                        {/* <ColumnScroll columnKey="email" /> */}
                                    </th>
                                    <th className="py-3 px-4">Mobile No.
                                        {/* <ColumnScroll columnKey="mobile" /> */}
                                    </th>
                                    <th className="py-3 px-4">Date of Birth
                                        {/* <ColumnScroll columnKey="date_of_birth" /> */}
                                    </th>
                                    <th className="py-3 px-4">Role
                                        {/* <ColumnScroll columnKey="role" /> */}
                                    </th>
                                    <th className="py-3 px-4">Designation
                                        {/* <ColumnScroll columnKey="designation" /> */}
                                    </th>
                                    <th className="py-3 px-4">Date of Joining
                                        {/* <ColumnScroll columnKey="date_of_joining" /> */}
                                    </th>
                                    <th className="py-3 px-4">Status
                                    </th>
                                    <th className="py-3 px-4">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                
                            </tbody>
                        </table>
                        

                    </div>
                </form>

            </div>
        </>
    )
}
