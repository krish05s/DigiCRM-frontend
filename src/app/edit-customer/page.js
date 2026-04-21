"use client";
import { useEffect, useRef, useState } from "react";
import Header from "../components/header";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import axios from "redaxios";
import { toast } from "react-toastify";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddCustomer() {
    const [activeTab, setActiveTab] = useState("update-customer");

    const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

    const [designations, setDesignations] = useState([]);

    const [industries, setIndustries] = useState([]);
    const [companyname, setCompanyname] = useState([]);
    const [showaddressModal, setShowAddressModal] = useState(false);
    const [showcontactsModal, setShowContactsModal] = useState(false);

    const router = useRouter();


    const [gstDetails, setGstDetails] = useState([]);


    // Collect row id from localstorage

    const [customerId, setCustomerId] = useState(null);

    useEffect(() => {
        const id = localStorage.getItem("customer_edit_id");

        if (id) {
            setCustomerId(id);
        }
    }, []);




    // // Token Check
    // const [role, setRole] = useState("");
    // const router = useRouter();

    // useEffect(() => {
    //     const token = localStorage.getItem("token");
    //     const role = localStorage.getItem("role");

    //     if (!token) {
    //         router.push("/");
    //         toast.error("Please Login First");
    //     } else {
    //         setRole(role);
    //     }
    // }, [router]);


    // Website Validatation >>>
    const websiteRef = useRef();
    const [error, setError] = useState("");

    const handleBlur = () => {
        let value = formData.website;

        // Ensure https:// is present
        if (!value.startsWith("https://")) {
            value = "https://" + value.replace(/^https?:\/\//, "");
        }

        // Update formData
        setFormData(prev => ({ ...prev, website: value }));

        // Validate domain
        const domain = value.replace(/^https:\/\//, "");
        const domainRegex = /^(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(domain)) {
            setError("Invalid website (e.g., google.com or www.google.com)");
        } else {
            setError("");
        }
    };


    // Keep cursor at the end when focusing
    const handleFocus = (e) => {
        const el = websiteRef.current;
        const length = el.value.length;
        el.setSelectionRange(length, length);
        console.log(e.target.value);
    };

    //  <<< Website Validation


    const [formData, setFormData] = useState({
        customer_type: "",
        company_name: "",
        customer_name: "",
        email: "",
        mobile: "",
        industry: "",
        website: "https://",
        remarks: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMobileChange = (value) => {
        setFormData((prev) => ({ ...prev, mobile: value }));
    };


    const addGst = () => {
        if (gstDetails.length >= 5) return;

        setGstDetails([
            ...gstDetails,
            {
                gst_type: "",
                gst_number: "",
                gst_state: ""
            }
        ]);
    };


    const removeGst = async (id) => {
        if (gstDetails.length === 1)
            return;

        try {
            const token = localStorage.getItem("token");

            await axios.delete(`${API_BASE}/api/customers/delete-gst/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update UI only after successful delete completed
            setGstDetails((prev) => prev.filter((gst) => gst.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to Remove GST");
        }
    };


    const updateGst = (id, field, value) => {
        setGstDetails(
            gstDetails.map((gst) =>
                gst.id === id ? { ...gst, [field]: value } : gst
            )
        );
    };


    const saveGstDetails = async () => {
        try {
            const token = localStorage.getItem("token");
            const customerId = localStorage.getItem("customer_edit_id");

            await axios.put(`${API_BASE}/api/customers/customer-gst/${customerId}`,
                {
                    gst_details: gstDetails
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

        } catch (err) {
            console.error(err);
            toast.error("GST update failed");
        }
    };



    // update data in customer_data table

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!customerId) {
            toast.error("Customer ID not found");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const payload = {
                company_name: formData.company_name,
                customer_type: formData.customer_type,
                customer_name: formData.customer_name,
                email: formData.email,
                mobile: formData.mobile,
                industry: formData.industry,
                website: formData.website,
                remarks: formData.remarks,
            };

            const res = await axios.put(`${API_BASE}/api/customers/customer-data/${customerId}`, payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(res.data.message || "Customer updated successfully");

        } catch (err) {
            console.error(err);
            toast.error(
                err.response?.data?.message || "Failed to update customer"
            );
        }
    };



    // Existing Data Render Into Form
    useEffect(() => {
        if (!customerId) return;

        const fetchCustomer = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(`${API_BASE}/api/customers/customer/${customerId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const { customer, gst_details } = res.data;

                setFormData({
                    customer_type: customer.customer_type || "",
                    company_name: customer.company_id || "",
                    customer_name: customer.customer_name || "",
                    email: customer.email || "",
                    mobile: customer.mobile || "",
                    industry: customer.industry || "",
                    website: customer.website || "https://",
                    remarks: customer.remarks || "",
                });

                setGstDetails(
                    gst_details.map(gst => ({
                        id: gst.id,
                        gst_type: gst.gst_type,
                        gst_number: gst.gst_number,
                        gst_state: gst.state
                    }))
                );

            } catch (err) {
                console.error(err);
                toast.error("Failed to load customer");
            }
        };

        fetchCustomer();
    }, [customerId]);




    // Fetch active designation for contact and set into dropdown

    useEffect(() => {
        const fetchDesignations = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/contact/read`, {
                    params: { status: 1 }
                });
                setDesignations(res.data);
            } catch (err) {
                console.error("Failed to fetch designations:", err);
            }
        };

        fetchDesignations();
    }, []);


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
        const fetchCompanyName = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/organizations/organization-name`, {
                    params: { status: 1 },
                });

                // If your API wraps data like { data: [...] }
                setCompanyname(res.data.data || res.data);
            } catch (err) {
                console.error("Failed to fetch company names:", err);
                setCompanyname([]);
            }
        };

        fetchCompanyName();
    }, []);


    // edit address integration functions

    const [addresses, setAddresses] = useState([]);
    const [addressForm, setAddressForm] = useState({
        address_type: "",
        address: "",
    });
    const [editAddressId, setEditAddressId] = useState(null);


    // Read Address Details

    const fetchAddresses = async () => {
        if (!customerId) return;

        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                `${API_BASE}/api/customers/customer-address/${customerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAddresses(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load addresses");
        }
    };

    useEffect(() => {
        fetchAddresses();
        fetchContacts();
    }, [customerId]);


    // Handle Address Form Input
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressForm(prev => ({ ...prev, [name]: value }));
    };


    // saveAddress Function for insert and update
    const saveAddress = async () => {
        try {
            const token = localStorage.getItem("token");

            if (editAddressId) {
                // UPDATE
                await axios.put(`${API_BASE}/api/customers/customer-address/${editAddressId}`, addressForm,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                toast.success("Address updated");
            } else {
                // INSERT
                await axios.post(`${API_BASE}/api/customers/customer-address`,
                    {
                        customer_id: customerId,
                        ...addressForm,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                toast.success("Address added");
            }

            setShowAddressModal(false);
            setAddressForm({ address_type: "", address: "" });
            setEditAddressId(null);

            // reload list
            fetchAddresses();

        } catch (err) {
            console.error(err);
            toast.error("Failed to save address");
        }
    };

    // Edit Address Data Rendering and collect id of row
    const editAddress = (item) => {
        setEditAddressId(item.id);
        setAddressForm({
            address_type: item.address_type,
            address: item.address,
        });
        setShowAddressModal(true);
    };

    // Delete Address Details
    const deleteAddress = async (id) => {
        try {
            const token = localStorage.getItem("token");

            await axios.delete(`${API_BASE}/api/customers/customer-address/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAddresses(prev => prev.filter(addr => addr.id !== id));
            toast.success("Address deleted");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete address");
        }
    };

    // Reset While we can cancel or close Address Model

    const closeAddressModal = () => {
        setShowAddressModal(false);
        setEditAddressId(null);
        setAddressForm({
            address_type: "",
            address: ""
        });
    };




    // edit contacts integration functions
    const [contacts, setContacts] = useState([]);
    const [contactForm, setContactForm] = useState({
        contact_person: "",
        contact_number: "",
        email: "",
        contact_designation: ""
    });
    const [editContactId, setEditContactId] = useState(null);


    // read api for fetch contacts

    const fetchContacts = async () => {
        if (!customerId) return;

        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(`${API_BASE}/api/customers/customer-contacts/${customerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setContacts(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load contacts");
        }
    };


    // Handle contacts Form Input

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
    };


    // Save contacts for insert and update 

    const saveContact = async () => {
        try {
            const token = localStorage.getItem("token");

            if (editContactId) {
                // UPDATE
                await axios.put(`${API_BASE}/api/customers/customer-contacts/${editContactId}`,
                    {
                        company_name: formData.company_name,
                        customer_name: formData.customer_name,
                        ...contactForm
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                toast.success("Contact updated");
            } else {
                // INSERT
                await axios.post(`${API_BASE}/api/customers/customer-contacts`,
                    {
                        customer_id: customerId,
                        company_name: formData.company_name,
                        customer_name: formData.customer_name,
                        ...contactForm
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                toast.success("Contact added");
            }

            setShowContactsModal(false);
            setContactForm({
                contact_person: "",
                contact_number: "",
                email: "",
                contact_designation: ""
            });
            setEditContactId(null);

            fetchContacts();

        } catch (err) {
            console.error(err);
            toast.error("Failed to save contact");
        }
    };


    // Edit contacts Data Rendering and collect id of row

    const editContact = (item) => {
        setEditContactId(item.id);
        setContactForm({
            contact_person: item.contact_person,
            contact_number: item.contact_number,
            email: item.email,
            contact_designation: item.contact_designation
        });
        setShowContactsModal(true);
    };


    // Delete contacts api integration

    const deleteContact = async (id) => {
        try {
            const token = localStorage.getItem("token");

            await axios.delete(`${API_BASE}/api/customers/customer-contacts/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setContacts(prev => prev.filter(contact => contact.id !== id));
            toast.success("Contact deleted");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete contact");
        }
    };


    return (
        <>
            <Header />
            <div className=" bg-gray-100 ">

                {/* Header */}
                <div className="bg-white w-full max-w-8xl rounded-2xl shadow-lg p-2 mt-1 mb-2">
                    <div className=" my-1.5">
                        <p><Link href="/dashboard" className="mx-3 text-xl text-gray-400 hover:text-indigo-600 "><i className="bi bi-house"></i></Link>
                            <i className="bi bi-chevron-right"></i>
                            <Link href="/customer-list" className="mx-3 text-md text-gray-700 hover:text-indigo-600">Customer List</Link>
                            <i className="bi bi-chevron-right"></i>
                            <Link href="/customer" className="mx-3 text-md text-gray-700 hover:text-indigo-600">Update Customer :</Link>
                            {formData.customer_name}
                        </p>
                    </div>
                </div>
                <form className="p-2 w-7xl mx-auto" >
                    {/* Tab Header */}
                    <div className="flex mb-4">
                        <button type="button" onClick={() => setActiveTab("update-customer")} className={`px-4 py-2 font-medium hover:cursor-pointer ${activeTab === "update-customer" ? "text-blue-900 border-b-2 border-blue-600" : "text-gray-600"}`}>
                            Update Customer
                        </button>
                        <button type="button" onClick={() => setActiveTab("address-details")} className={`px-4 py-2 font-medium hover:cursor-pointer ${activeTab === "address-details" ? "text-blue-900 border-b-2 border-blue-600" : "text-gray-600"}`}>
                            Address Details
                        </button>
                        <button type="button" onClick={() => setActiveTab("contact-details")} className={`px-4 py-2 font-medium hover:cursor-pointer ${activeTab === "contact-details" ? "text-blue-900 border-b-2 border-blue-600" : "text-gray-600"}`}>
                            Contact Details
                        </button>
                    </div>

                    {/* Personal Information Section */}
                    {activeTab === "update-customer" && (
                        <div className="bg-white shadow rounded-2xl p-6 max-h-[70vh] overflow-y-auto">
                            {/* Customer Type */}
                            <div className="mb-4 flex gap-4">
                                <label className="font-semibold">Customer Type</label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2">
                                        <input type="radio" name="customer_type" value="Individual" checked={formData.customer_type === "Individual"} onChange={handleChange} />
                                        Individual
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="radio" name="customer_type" value="Business" checked={formData.customer_type === "Business"} onChange={handleChange} />
                                        Business
                                    </label>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Company Name *</label>
                                    <select name="company_name" className="w-full border rounded p-2" value={formData.company_name} onChange={handleChange}>
                                        <option value="">Select Company</option>
                                        {companyname.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.organization_name}
                                            </option>
                                        ))}
                                    </select>

                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Customer Name *
                                    </label>
                                    <input type="text" name="customer_name" placeholder="Enter customer name" value={formData.customer_name} onChange={handleChange} className="w-full border rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mobile No.</label>
                                    <PhoneInput
                                        country={"in"}
                                        value={formData.mobile}
                                        onChange={handleMobileChange}
                                        inputStyle={{
                                            width: "100%",
                                            height: "38px",
                                            borderRadius: "0.375rem",
                                            border: "1px solid #d1d5db",
                                        }}
                                        buttonStyle={{
                                            borderTopLeftRadius: "0.375rem",
                                            borderBottomLeftRadius: "0.375rem",
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input type="email" name="email" placeholder="Enter email address" value={formData.email} onChange={handleChange} className="w-full border rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Industry *</label>
                                    <select name="industry" className="w-full border rounded p-2" value={formData.industry} onChange={handleChange}>
                                        <option value="">Select Industry</option>
                                        {industries.map((item) => (
                                            <option key={item.name} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="mb-6">
                                <h3 className="text-blue-900 font-medium mb-2">Add more details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Website</label>
                                        <input type="text" name="website" ref={websiteRef} onBlur={handleBlur} value={formData.website} onChange={handleChange} className="w-full border rounded p-2" />
                                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Remarks</label>
                                        <textarea name="remarks" placeholder="Enter remarks" value={formData.remarks} onChange={handleChange} className="w-full border rounded p-2"></textarea>
                                    </div>
                                </div>
                            </div>


                            <div className="mb-6">

                                {gstDetails.map((gst, index) => (
                                    <div key={gst.id || index} className="grid grid-cols-12 gap-4 items-end mb-2">
                                        {/* GST TYPE */}
                                        <div className="col-span-4">
                                            <label className="block text-sm font-medium mb-1">
                                                GST Type
                                            </label>
                                            <select className="w-full border rounded px-3 py-2" value={gst.gst_type}
                                                onChange={(e) =>
                                                    updateGst(gst.id, "gst_type", e.target.value)
                                                }>
                                                <option value="">Select GST Type</option>
                                                <option>Registered Regular</option>
                                                <option>Registered Composite</option>
                                                <option>Unregistered / Consumer</option>
                                            </select>
                                        </div>

                                        {/* GST NUMBER */}
                                        <div className="col-span-4">
                                            <label className="block text-sm font-medium mb-1">
                                                GST Number
                                            </label>
                                            <input type="text" className="w-full border rounded px-3 py-2" value={gst.gst_number}
                                                onChange={(e) => updateGst(gst.id, "gst_number", e.target.value)} />
                                        </div>

                                        {/* STATE */}
                                        <div className="col-span-3">
                                            <label className="block text-sm font-medium mb-1">
                                                State
                                            </label>
                                            <input type="text" className="w-full border rounded px-3 py-2" placeholder="Enter State" value={gst.gst_state}
                                                onChange={(e) =>
                                                    updateGst(gst.id, "gst_state", e.target.value)} />
                                        </div>


                                        {/* PLUS / REMOVE */}
                                        <div className="col-span-1 ">
                                            {index === gstDetails.length - 1 && gstDetails.length < 5 ? (
                                                <button type="button" onClick={addGst} className="border rounded px-3 py-1.5 text-xl hover:cursor-pointer">
                                                    <i className="bi bi-plus-lg"></i>
                                                </button>
                                            ) : (
                                                gstDetails.length > 1 && (
                                                    <button type="button" onClick={() => removeGst(gst.id)} className="border rounded px-3 py-1.5 text-xl hover:cursor-pointer">
                                                        <i className="bi bi-x-lg text-red-600"></i>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* ADD MORE GST */}
                                {gstDetails.length < 5 && (
                                    <button type="button" onClick={addGst} className="text-blue-900 font-medium mb-4 hover:underline">
                                        Add more GST?
                                    </button>
                                )}
                            </div>


                        </div>
                    )}



                    {/* Address Details Section */}
                    {activeTab === "address-details" && (
                        <div className="bg-white shadow rounded-2xl p-6 max-h-[70vh] overflow-y-auto">
                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-black mb-3">Address Listing</h2>

                                <button type="button" onClick={() => setShowAddressModal(true)} className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-950 hover:cursor-pointer">
                                    <i className="bi bi-plus-lg"></i>
                                    ADD ADDRESS
                                </button>
                            </div>

                            {/* TABLE */}
                            <div className="rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left w-16">#</th>
                                            <th className="px-4 py-3 text-left">Address Type</th>
                                            <th className="px-4 py-3 text-left">Address</th>
                                            <th className="px-4 py-3 text-left w-32">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {addresses.map((item, index) => (
                                            <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3">{index + 1}</td>
                                                <td className="px-4 py-3">{item.address_type}</td>
                                                <td className="px-4 py-3">{item.address}</td>
                                                <td className="px-4 py-3 flex gap-3">
                                                    <button type="button" onClick={() => editAddress(item)} className="text-gray-500 hover:text-blue-900 hover:cursor-pointer">
                                                        <i className="bi bi-pencil-square text-lg"></i>
                                                    </button>
                                                    <button type="button" onClick={() => deleteAddress(item.id)} className="text-gray-500 hover:text-red-600 hover:cursor-pointer">
                                                        <i className="bi bi-trash3 text-lg"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MODAL (SAME COMPONENT) */}
                            {showaddressModal && (
                                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-xl w-full max-w-lg p-6">
                                        {/* MODAL HEADER */}
                                        <div className="flex justify-between items-center mb-5 border-b text-gray-400 ">
                                            <h3 className="text-lg font-semibold text-black">
                                                {editAddressId ? "Edit Address" : "Add Address"}
                                            </h3>
                                            <button type="button" onClick={() => closeAddressModal()} className="text-2xl text-gray-500 hover:text-red-400 mb-5 hover:cursor-pointer">
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </div>

                                        {/* FORM */}
                                        <div className="space-y-4 text-gray-600">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Address Type *
                                                </label>
                                                <select name="address_type" value={addressForm.address_type} onChange={handleAddressChange} className="w-full border rounded px-3 py-2">
                                                    <option>Select Address Type</option>
                                                    <option>Billing</option>
                                                    <option>Shipping</option>
                                                    <option>Corporate</option>
                                                    <option>Warehouse</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Address
                                                </label>
                                                <textarea name="address" value={addressForm.address} onChange={handleAddressChange} className="w-full border rounded px-3 py-2" rows="3" placeholder="Enter address" />
                                            </div>
                                        </div>

                                        {/* MODAL FOOTER */}
                                        <div className="flex justify-end gap-3 mt-6">
                                            <button type="button" onClick={() => closeAddressModal()} className="px-4 py-2 border hover:bg-gray-200 rounded-lg hover:cursor-pointer">
                                                Cancel
                                            </button>
                                            <button type="button" onClick={saveAddress} className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg hover:cursor-pointer">
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}



                    {/* contact Details Section */}
                    {activeTab === "contact-details" && (
                        <div className="bg-white shadow rounded-2xl p-6 max-h-[70vh] overflow-y-auto">
                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Contacts Listing</h2>

                                <button type="button" onClick={() => setShowContactsModal(true)} className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-950 hover:cursor-pointer">
                                    <i className="bi bi-plus-lg"></i>
                                    ADD CONTACTS
                                </button>
                            </div>

                            {/* TABLE */}
                            <div className="rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-2 py-3 text-left">#</th>
                                            <th className="px-4 py-3 text-left">Company Name</th>
                                            <th className="px-4 py-3 text-left">Customer Name</th>
                                            <th className="px-4 py-3 text-left ">Contact Person</th>
                                            <th className="px-4 py-3 text-left ">Contact Number</th>
                                            <th className="px-4 py-3 text-left ">Email</th>
                                            <th className="px-4 py-3 text-left ">Contact Designation</th>
                                            <th className="px-4 py-3 text-left ">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {contacts.map((item, index) => (
                                            <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3">{index + 1}</td>
                                                <td className="px-4 py-3">{item.company_name}</td>
                                                <td className="px-4 py-3">{item.customer_name}</td>
                                                <td className="px-4 py-3">{item.contact_person}</td>
                                                <td className="px-4 py-3">{item.contact_number}</td>
                                                <td className="px-4 py-3">{item.email}</td>
                                                <td className="px-4 py-3">{item.designation_name}</td>
                                                <td className="px-4 py-3 flex gap-3">
                                                    <button type="button" onClick={() => editContact(item)} className="text-gray-500 hover:text-blue-900 cursor-pointer">
                                                        <i className="bi bi-pencil-square text-lg"></i>
                                                    </button>
                                                    <button type="button" onClick={() => deleteContact(item.id)} className="text-gray-500 hover:text-red-600 cursor-pointer">
                                                        <i className="bi bi-trash3 text-lg"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MODAL (SAME COMPONENT) */}
                            {showcontactsModal && (
                                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-xl w-full max-w-lg p-5">
                                        {/* MODAL HEADER */}
                                        <div className="flex justify-between items-center mb-5 border-b text-gray-400 ">
                                            <h3 className="text-lg font-semibold text-black mb-3">Add Contacts</h3>
                                            <button type="button" onClick={() => setShowContactsModal(false)} className="text-2xl text-gray-500 hover:text-red-400 mb-5 hover:cursor-pointer">
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </div>

                                        {/* FORM */}
                                        <div className="space-y-4 text-gray-600">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Contact Person *
                                                </label>
                                                <input type="text" name="contact_person" value={contactForm.contact_person} onChange={handleContactChange} className="w-full border rounded px-3 py-2" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Contact Number *
                                                </label>
                                                <input type="text" name="contact_number" value={contactForm.contact_number} onChange={handleContactChange} className="w-full border rounded px-3 py-2" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Email
                                                </label>
                                                <input type="text" name="email" value={contactForm.email} onChange={handleContactChange} className="w-full border rounded px-3 py-2" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">
                                                    Contact Designation *
                                                </label>
                                                <select name="contact_designation" value={contactForm.contact_designation} onChange={handleContactChange} className="w-full border rounded px-3 py-2" >
                                                    <option value="">Select Designation</option>
                                                    {designations.map(d => (
                                                        <option key={d.id} value={d.id}>
                                                            {d.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* MODAL FOOTER */}
                                        <div className="flex justify-end gap-3 mt-6 mb-3">
                                            <button type="button" onClick={() => setShowContactsModal(false)} className="px-4 py-2 border rounded hover:cursor-pointer">
                                                Cancel
                                            </button>
                                            <button type="button" onClick={saveContact} className="px-4 py-2 bg-blue-900 text-white rounded">
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </form>
            </div>

            <div className="fixed bottom-0 left-0 w-full flex justify-end gap-3 bg-white p-3 z-50">
                <button type="button"
                    onClick={async () => {
                        await handleSubmit();
                        await saveGstDetails();
                    }} className="border px-4 py-1 rounded bg-blue-900 hover:bg-blue-950 text-white hover:cursor-pointer">Save</button>

                <button type="button" onClick={() => { router.push('/customer-list') }}
                    className="border px-4 py-1 hover:bg-gray-200 rounded hover:cursor-pointer">Cancel
                </button>
            </div>

        </>
    );
}
