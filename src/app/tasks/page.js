"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "redaxios";
import Link from "next/link";
import { toast } from "react-toastify";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import Header from "../components/header";
import Select from "react-select";
import { X, FileImage, FileText } from "lucide-react";

export default function Page() {
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [formData, setFormData] = useState({
    task_name: "",
    status: "",
    priority: "",
    recurring_type: "",
    repeat_every: "",
    description: "",
    assignee: "",
    template: "",
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [relatedTo, setRelatedTo] = useState("");
  const [secondValue, setSecondValue] = useState("");
  const [secondOptions, setSecondOptions] = useState([]);
  const [asignee, setAsignee] = useState([]);
  const [status, setStatus] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState("");
  const [task, setTask] = useState([]);
  const [filters, setFilters] = useState({});

  const [scrollOffsets, setScrollOffsets] = useState({});
  const [loadingColumns, setLoadingColumns] = useState({});

  const APIBase = `${API_BASE}/api/tasks`;

  //  PAGINATION ADDED HERE
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${APIBase}/read`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setTasks(res.data.result || []);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || "Failed to load tasks");
    }
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const formatForInput = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

  const handleEdit = async (item) => {
    setEditId(item.id);
    // Fetch existing files for the task
    try {
      const res = await axios.get(`${API_BASE}/api/tasks/files/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExistingFiles(res.data.files || []); // each file: {id, file_name, file_path
    } catch (err) {
      console.error("Failed to load existing files:", err);
      setExistingFiles([]);
    }

    setFormData({
      task_name: item.task_name,
      status: item.status,
      priority: item.priority,
      recurring_type: item.recurring_type,
      repeat_every: item.repeat_every,
      description: item.description,
      assignee: item.assignee,
      template: item.template,
    });
    setStartDate(formatForInput(item.start_date));
    setDueDate(formatForInput(item.due_date));
    setRelatedTo(item.related_to);
    setSecondValue(item.related_value);

    setShowForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({
      task_name: "",
      status: "",
      priority: "",
      recurring_type: "",
      repeat_every: "",
      description: "",
      assignee: "",
      template: "",
    });

    setStartDate("");
    setDueDate("");
    setRelatedTo("");
    setSecondValue("");
    setSecondOptions([]);

    setShowForm(false);
    fetchData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    // Append normal fields
    fd.append("task_name", formData.task_name);
    fd.append("status", formData.status);
    fd.append("priority", formData.priority);
    fd.append("recurring_type", formData.recurring_type);
    fd.append("repeat_every", formData.repeat_every);
    fd.append("description", formData.description);
    fd.append("assignee", formData.assignee);
    fd.append("template", formData.template);

    fd.append("start_date", startDate);
    fd.append("due_date", dueDate);
    fd.append("related_to", relatedTo);
    fd.append("related_value", secondValue);

    fd.append("created_by_id", localStorage.getItem("id"));
    fd.append("created_by_name", localStorage.getItem("username"));

    // append existing file ids to keep
    existingFiles.forEach((file) => {
      fd.append("existing_files[]", file.id);
    });

    // append deleted file ids
    removedFiles.forEach((id) => {
      fd.append("removed_files[]", id);
    });

    // append new uploaded files
    newFiles.forEach((item) => {
      fd.append("files", item.file);
    });

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        // axios automatically sets multipart boundary, so Content-Type can be omitted
      },
    };

    try {
      if (editId) {
        await axios.put(`${APIBase}/update/${editId}`, fd, config);
        toast.success("Task updated successfully!");
      } else {
        await axios.post(`${APIBase}/insert`, fd, config);
        toast.success("Task added successfully!");
      }

      resetForm();
      setNewFiles([]);
      fetchData();
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  //  PAGINATION CALCULATIONS
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = tasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

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

        const cleanedData = (res.data.data || []).map((item) => ({
          ...item,
          name: item.name.split(" ")[0], // Only first name
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

  // Related Option Maping
  const RELATED_API_MAP = {
    Contract: `${API_BASE}/api/contract-types/contracts`,
    Quotation: "",
    Lead: "",
    Inquiry: "",
    Customer: `${API_BASE}/api/customers/customer-name`,
  };

  // Fetch Api's For related_to
  useEffect(() => {
    if (!relatedTo) {
      setSecondOptions([]);
      return;
    }

    const apiUrl = RELATED_API_MAP[relatedTo];

    const fetchOptions = async () => {
      try {
        const res = await axios.get(apiUrl, { params: { status: 1 } });

        let finalData =
          res.data.data || // for API returning {data: []}
          res.data || // for API returning []
          [];

        setSecondOptions(finalData);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
        setSecondOptions([]);
      }
    };

    fetchOptions();
  }, [relatedTo]);

  // Model for Upload Files
  const [showModal, setShowModal] = useState(false);
  const [files, setFiles] = useState([]);

  const MAX_FILES = 5;

  const handleSelect = (e) => {
    const files = Array.from(e.target.files);

    const totalAlreadySelected = existingFiles.length + newFiles.length;

    let remainingSlots = MAX_FILES - totalAlreadySelected;

    if (remainingSlots <= 0) {
      toast.error("You cannot upload more than 5 files");
      e.target.value = "";
      return;
    }

    const validFiles = [];

    for (const file of files) {
      if (remainingSlots <= 0) {
        toast.error("You cannot select more than 5 files");
        break;
      }

      const ext = file.name.split(".").pop().toLowerCase();

      //  Duplicate check
      const isDuplicate =
        existingFiles.some((f) => f.file_name === file.name) ||
        newFiles.some((f) => f.file.name === file.name) ||
        validFiles.some((f) => f.file.name === file.name);

      if (isDuplicate) {
        toast.error(`File is already uploaded`);
        continue;
      }

      //  Unsupported type
      if (![...IMAGE_EXT, ...DOC_EXT].includes(ext)) {
        toast.error("Unsupported file type");
        continue;
      }

      //  Image size
      if (IMAGE_EXT.includes(ext) && file.size > MAX_IMG_SIZE) {
        toast.error("Image exceeds allowed 5 MB");
        continue;
      }

      //  Document size
      if (DOC_EXT.includes(ext) && file.size > MAX_DOC_SIZE) {
        toast.error("Document exceeds allowed 15 MB");
        continue;
      }

      // Valid file
      validFiles.push({ file, id: crypto.randomUUID() });
      remainingSlots--;
    }

    if (validFiles.length) {
      setNewFiles((prev) => [...prev, ...validFiles]);
    }

    e.target.value = "";
  };

  // Drag drop
  const handleDrop = (e) => {
    e.preventDefault();

    handleSelect({
      target: {
        files: e.dataTransfer.files,
        value: "",
      },
    });
  };

  // Remove specific file
  const handleRemoveFile = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/tasks/delete/${id}`);

      if (response.data.success) {
        setExistingFiles((prev) => prev.filter((f) => f.id !== id));

        toast.success("File deleted");
        setShowDeleteModal(false);
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong while deleting");
    }
  };

  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);

  const [fileToDelete, setFileToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const IMAGE_EXT = ["jpg", "jpeg", "png"];
  const DOC_EXT = ["pdf", "txt", "doc", "xlsx", "csv", "pptx"];
  const MAX_IMG_SIZE = 5 * 1024 * 1024; // 5 MB
  const MAX_DOC_SIZE = 15 * 1024 * 1024; // 15 MB

  // delete functionality

  const confirmDelete = (id) => {
    setFileToDelete(id);
    setShowDeleteModal(true);
  };

  // API for Dynamic Status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/task-status/read`, {
          params: { status: 1 },
        });

        setStatus(res.data.data || res.data);
      } catch (err) {
        console.error("Failed to fetch Status:", err);
      }
    };

    fetchStatus();
  }, []);

  return (
    <div className="bg-gray-100">
      <Header />
      {/* Breadcrumb */}
      <div className="bg-white w-full  shadow-lg p-3 mt-1 mb-5 flex justify-between items-center">
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
              Tasks
            </Link>
            <i className="bi bi-chevron-right"></i>
            <Link
              href="#"
              className="mx-3 text-md text-gray-700 hover:text-orange-500"
            >
              Tasks List
            </Link>
          </p>
        </div>

        <div>
          <input
            type="text"
            placeholder="🔍 Search..."
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border w-sm   p-1 px-2 mx-5  border-gray-300 text-gray-700 placeholder-gray-400 rounded-sm focus:ring-1 outline-none focus:ring-orange-200 transition-all text-md"
          />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-600"
          >
            + ADD TASK
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-6 flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 mb-5">
        {/* Task Name */}
        <input
          type="text"
          name="task_name"
          placeholder="Enter Task Name"
          value={filters.task_name || ""}
          onChange={(e) =>
            setFilters({ ...filters, task_name: e.target.value })
          }
          className="p-2 w-52 border text-gray-700 bg-white rounded-sm focus:ring-1 outline-none focus:ring-orange-200 transition-all border-gray-300 "
        />

        {/* Status */}
        <select
          name="status"
          value={filters.status || ""}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="p-2 w-52 border text-gray-700 bg-white rounded-sm focus:ring-1 outline-none focus:ring-orange-200 transition-all border-gray-300 "
        >
          <option value="">Select Status</option>

          {status.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          name="priority"
          value={filters.priority || ""}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="p-2 w-52 border text-gray-700 bg-white rounded-sm focus:ring-1 outline-none focus:ring-orange-200 transition-all border-gray-300 "
        >
          <option value="">Select Priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        {/* Assignee - dynamic API */}
        <select
          name="assignee"
          value={filters.assignee || "-"}
          onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
          className="p-2 w-52 border text-gray-700 bg-white rounded-sm focus:ring-1 outline-none focus:ring-orange-200 transition-all border-gray-300 "
        >
          <option value="">Select Assignee</option>

          {asignee.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>

        {/* Start Date Range */}
        <div className="flex items-center border bg-white rounded-sm px-2 border-gray-300  ">
          <span className="mx-1 text-gray-400">Start Date</span>
          <input
            type="date"
            value={filters.start_from || ""}
            onChange={(e) =>
              setFilters({ ...filters, start_from: e.target.value })
            }
            className="p-2 w-32 border-gray-300 focus:outline-none  "
          />
        </div>

        {/* Due Date Range */}
        <div className="flex items-center border bg-white rounded-md px-2 border-gray-300 ">
          <span className="mx-1 text-gray-400">Due Date</span>
          <input
            type="date"
            value={filters.due_from || ""}
            onChange={(e) =>
              setFilters({ ...filters, due_from: e.target.value })
            }
            className="p-2 w-32 border-gray-300 focus:outline-none  "
          />
        </div>

        {/* Assignee - dynamic API */}
        <select
          name="created_by_name"
          value={filters.created_by_name || ""}
          onChange={(e) =>
            setFilters({ ...filters, created_by_name: e.target.value })
          }
          className="p-2 w-52 border text-gray-700 bg-white rounded-sm focus:ring-1 outline-none focus:ring-orange-200 transition-all border-gray-300 "
        >
          <option value="">Select Created By</option>

          {users.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>

        {/* created Date Range */}
        <div className="flex items-center border bg-white rounded-sm px-2 border-gray-300 ">
          <span className="mx-1 text-gray-400">Created Date</span>
          <input
            type="date"
            value={filters.created_at || ""}
            onChange={(e) =>
              setFilters({ ...filters, created_at: e.target.value })
            }
            className="p-2 w-32 border-gray-300 focus:outline-none  "
          />
        </div>

        {/* CLEAR BUTTON */}
        <button
          type="button"
          className=" rounded-sm p-0.5 bg-gray-200 text-gray-700 hover:bg-gray-300 text-md text-center px-3"
          onClick={() => setFilters({})}
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <form className="p-1 mx-4">
        <div className="bg-white shadow-md rounded-2xl p-1 border border-gray-200">
          <table className=" w-full text-sm text-left text-gray-700 border-collapse mt-2 mb-2">
            <thead className="uppercase font-semibold text-xs tracking-wider bg-gray-50 border-b border-gray-100 text-gray-400">
              <tr>
                <th className="py-3 px-5 w-10">#</th>
                <th className="py-3 px-5 w-sm">Task Name</th>

                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4 ">Due Date</th>
                <th className="py-3 px-4 ">Priority - </th>
                <th className="py-3 px-4 ">Assignee</th>
                <th className="py-3 px-4 ">Status</th>
                <th className="py-3 px-4 ">Created</th>
                <th className="py-3 px-4 ">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition font-medium`}
                  >
                    <td className="py-1 px-4 text-gray-600">{index + 1}</td>
                    <td className="py-2 px-5 text-gray-800">
                      {item.task_name}
                    </td>
                    <td className="py-1 px-4">
                      {item.start_date
                        ? new Date(item.start_date)
                            .toLocaleDateString("en-GB")
                            .replace(/\//g, "-")
                        : "-"}
                    </td>

                    <td className="py-2 px-4 ">
                      {item.due_date
                        ? new Date(item.due_date)
                            .toLocaleDateString("en-GB")
                            .replace(/\//g, "-")
                        : "-"}
                    </td>

                    <td className="py-2 px-2 text-lg">
                      {[
                        ...Array(
                          item.priority === "High"
                            ? 3
                            : item.priority === "Medium"
                              ? 2
                              : item.priority === "Low"
                                ? 1
                                : 0,
                        ),
                      ].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}

                      {[
                        ...Array(
                          3 -
                            (item.priority === "High"
                              ? 3
                              : item.priority === "Medium"
                                ? 2
                                : item.priority === "Low"
                                  ? 1
                                  : 0),
                        ),
                      ].map((_, i) => (
                        <span key={i} style={{ opacity: 0.3 }}>
                          ⭐
                        </span>
                      ))}
                    </td>

                    <td
                      style={{
                        display: "flex",
                        gap: "1px",
                        alignItems: "center",
                      }}
                      className="py-2 px-4"
                    >
                      {String(item.assignee)
                        .split(",")
                        .map((name, index) => {
                          const letter = name.trim().charAt(0).toUpperCase();

                          return (
                            <div
                              key={index}
                              title={name.trim()}
                              className="px-3 py-1.5 bg-blue-800 text-white rounded-full font-semibold text-sm flex justify-center items-center min-w-[28px] text-center select-none"
                            >
                              {letter}
                            </div>
                          );
                        })}
                    </td>

                    <td className="py-2 px-4 ">{item.status_name}</td>
                    <td className="py-2 px-4 w-50">
                      {item.created_by_name} | {formatDateTime(item.created_at)}
                    </td>

                    <td className="py-2 px-4  text-lg">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="text-gray-400 hover:text-blue-800 mx-2"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
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
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className=" px-4 py-2 text-sm font-medium rounded-sm  bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-4 py-2 text-sm font-medium rounded-sm border bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Modal remains same */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/30 z-50 flex justify-center items-center">
          <div className="bg-white rounded-sm shadow-lg w-[800px] relative max-h-[75vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-50 px-6 pt-6 pb-3  from-orange-100 to-white bg-gradient-to-r ">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setExistingFiles([]);
                }}
                className="absolute top-6 right-6 text-xl text-orange-500 hover:text-orange-600"
              >
                ✕
              </button>

              <h3 className="text-lg mb-3 text-orange-500 font-semibold">
                {editId ? "Edit" : "Add"} Task
              </h3>
            </div>

            {/* FORM CONTENT */}
            <div className="p-6 pt-3">
              <form onSubmit={handleSubmit}>
                <div className="text-gray-600 mb-2">
                  <label className="block mb-2">Task Name * </label>

                  <div className="relative">
                    <input
                      type="text"
                      name="task_name"
                      value={formData.task_name}
                      onChange={handleChange}
                      className="w-full border  rounded-sm px-4 py-2  border-gray-300 outline-none focus:ring-1 focus:ring-orange-200"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-gray-600">
                  <div>
                    <label className="block mb-2">Start Date *</label>

                    <div className="flex">
                      <div className="relative w-full">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setDueDate("");
                          }}
                          className="w-full border  rounded-sm px-4 py-2  border-gray-300 outline-none focus:ring-1 focus:ring-orange-200"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2"> Due Date *</label>
                    <input
                      type="date"
                      value={dueDate}
                      min={startDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full border  rounded-sm px-4 py-2  border-gray-300 outline-none focus:ring-1 focus:ring-orange-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Status *</label>

                    <div className="flex">
                      <div className="relative w-full">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full border  rounded-sm px-4 py-2  border-gray-300 outline-none focus:ring-1 focus:ring-orange-200"
                          required
                        >
                          {status.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">Priority *</label>

                    <div className="flex">
                      <div className="relative w-full">
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="w-full border  rounded-sm px-4 py-2  border-gray-300 outline-none focus:ring-1 focus:ring-orange-200"
                          required
                        >
                          <option value=""> --Select-- </option>
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">Recurring Type *</label>
                    <div className="relative">
                      <select
                        name="recurring_type"
                        value={formData.recurring_type}
                        onChange={handleChange}
                        className="w-full border  rounded-sm px-4 py-2  border-gray-300 outline-none focus:ring-1 focus:ring-orange-200"
                        required
                      >
                        <option value="">-- Select --</option>
                        <option>Day</option>
                        <option>Week</option>
                        <option>Month</option>
                        <option>Year</option>
                        <option>Custom</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">Repeat Every *</label>
                    <div className="relative">
                      <select
                        name="repeat_every"
                        value={formData.repeat_every}
                        onChange={handleChange}
                        className="w-full border  rounded-sm px-4 py-2  border-gray-300 outline-none focus:ring-1 focus:ring-orange-200"
                        required
                      >
                        <option value="">-- Select --</option>
                        {[6, 5, 4, 3, 2, 1].map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">Related To *</label>
                    <div className="relative">
                      <select
                        value={relatedTo}
                        onChange={(e) => {
                          setRelatedTo(e.target.value);
                          setSecondValue("");
                        }}
                        className="w-full border  rounded-sm px-4 py-2  border-gray-300 outline-none focus:ring-1 focus:ring-orange-200"
                        required
                      >
                        <option value="">-- Select --</option>
                        <option>Contract</option>
                        <option>Quotation</option>
                        <option>Lead</option>
                        <option>Inquiry</option>
                        <option>Customer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">{relatedTo} *</label>
                    <div className="relative">
                      {relatedTo ? (
                        <select
                          className="w-full border  rounded-sm px-4 py-2  border-gray-300 outline-none focus:ring-1 focus:ring-orange-200"
                          value={secondValue}
                          onChange={(e) => setSecondValue(e.target.value)}
                          required
                        >
                          <option value="">-- Select --</option>
                          {secondOptions.length > 0 ? (
                            secondOptions.map((item) => (
                              <option
                                key={item.id}
                                value={item.name || item.customer_name}
                              >
                                {item.name || item.customer_name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No data found</option>
                          )}
                        </select>
                      ) : (
                        <div className="w-full border border-gray-200 bg-gray-100 rounded-md px-4 py-2 text-gray-400">
                          Select Related To first
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">Assignee *</label>
                    <div className="relative">
                      <Select
                        isMulti
                        options={asignee.map((item) => ({
                          value: item.name,
                          label: item.name,
                        }))}
                        value={
                          formData.assignee
                            ? formData.assignee.split(",").map((n) => ({
                                label: n.trim(),
                                value: n.trim(),
                              }))
                            : []
                        }
                        onChange={(selected) => {
                          const names = selected.map((s) => s.value).join(",");
                          setFormData({ ...formData, assignee: names });
                        }}
                        className="w-full"
                        placeholder="Select Assignee"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">Template</label>
                    <div className="relative">
                      <select
                        name="template"
                        value={formData.template}
                        onChange={handleChange}
                        className="w-full border  rounded-sm px-4 py-2  border-gray-300 outline-none focus:ring-1 focus:ring-orange-200"
                        required
                      >
                        <option value="">-- Select --</option>
                        <option>N/A</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="text-gray-600 mt-2">
                  <label className="block mb-2">Description *</label>
                  <textarea
                    rows={2}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:ring-1 focus:ring-orange-200"
                    required
                  ></textarea>
                </div>

                <div className="text-gray-600 mt-2">
                  <label className="block mb-2 ">Select Files *</label>
                  <div className="border border-dashed border-gray-400 text-center ">
                    <div className="m-3">
                      <h3 className="mb-3">Upload Documents</h3>
                      <button
                        type="button"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-2 mx-auto transition-all shadow-md shadow-orange-200"
                        onClick={() => setShowModal(true)}
                      >
                        <i className="bi bi-cloud-arrow-up px-2"></i> Browse
                        Files
                      </button>
                      <p className="mb-4 text-gray-400">
                        Max size: 2MB - JPG, PNG, PDF, TXT, DOC, XLSX, CSV, PPTX
                        file support
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-gray-600 mt-2">
                  <label className="block mb-2">Existing Files</label>
                  <div className="mb-3">
                    {existingFiles.map((f) => (
                      <div key={f.id} className="flex justify-between mb-1">
                        <a href={f.file_path} target="_blank">
                          {f.file_name}
                        </a>
                        <button
                          type="button"
                          className="text-gray-400 text-sm hover:text-red-600"
                          onClick={() => confirmDelete(f.id)}
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {showDeleteModal && (
                  <div className="fixed inset-0 flex items-center justify-center bg-gray-900/30 z-40">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
                      <h2 className="text-lg font-semibold mb-4 text-orange-500">
                        Confirm Delete
                      </h2>
                      <p className="mb-6">
                        Are you sure you want to delete this File?
                      </p>
                      <div className="flex justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(fileToDelete)}
                          className="bg-orange-500 text-white px-8 py-2 rounded-sm hover:bg-orange-600"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteModal(false)}
                          className="bg-gray-300  px-8 py-2    rounded-sm text-sm font-medium  border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* UPLOAD MODAL */}
                {showModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
                    <div className="w-[650px] bg-white rounded-xl shadow-xl">
                      <div className=" p-4 flex justify-between from-orange-100  to-white bg-gradient-to-r">
                        <h2 className="text-orange-500 text-lg">Upload Files</h2>
                        <X
                          className="text-white cursor-pointer"
                          onClick={() => setShowModal(false)}
                        />
                      </div>

                      <div className="flex justify-between">
                        <div
                          onDrop={handleDrop}
                          onDragOver={(e) => e.preventDefault()}
                          className="border-2 border-dashed border-gray-400 m-6 p-8 text-center rounded-xl"
                        >
                          <p className="font-semibold mt-3">DRAG FILES HERE</p>
                          <p className="text-gray-500 mt-1">
                            OR{" "}
                            <label className="text-gray-700 underline cursor-pointer">
                              SELECT FILE
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleSelect}
                              />
                            </label>
                          </p>
                        </div>

                        <div className="max-h-52 overflow-y-auto px-6 pb-4 mt-4 space-y-8 custom-scroll">
                          {/* Newly Added Files */}
                          {newFiles.map((f) => (
                            <div
                              key={f.id}
                              className="flex items-center justify-between gap-3 border border-gray-300 p-3 mb-3 rounded-3xl"
                            >
                              <div className="flex items-center gap-3">
                                {f.file.type.includes("image") ? (
                                  <FileImage
                                    size={35}
                                    className="text-blue-700"
                                  />
                                ) : (
                                  <FileText
                                    size={35}
                                    className="text-blue-700"
                                  />
                                )}
                                <p className="truncate max-w-[240px]">
                                  {f.file.name}
                                </p>
                              </div>
                              <X
                                size={22}
                                className="text-gray-500 hover:text-red-400 cursor-pointer"
                                onClick={() =>
                                  setNewFiles(
                                    newFiles.filter((file) => file.id !== f.id),
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 flex justify-end">
                        <button
                          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-sm"
                          onClick={() => setShowModal(false)}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* BUTTONS */}
                <div className="flex justify-end mt-5 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setExistingFiles([]);
                    }}
                    className="px-5 py-2 rounded-sm text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-sm"
                  >
                    {editId ? "UPDATE" : "SAVE"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
