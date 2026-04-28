
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const [salesOpen, setSalesOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);


  const salesRef = useRef(null);
  const customerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        salesRef.current &&
        !salesRef.current.contains(event.target)
      ) {
        setSalesOpen(false);
      }

      if (
        customerRef.current &&
        !customerRef.current.contains(event.target)
      ) {
        setCustomerOpen(false);
      }

    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);


  const handlelogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 shadow-sm bg-white">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Image
          src="/venster_logo.png"
          alt="Company Logo"
          width={70}
          height={70}
          className="object-contain"
        />
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex space-x-10 text-gray-800 font-medium sticky top-0">
        <Link
          href="/dashboard"
          className="hover:text-orange-500 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/todolist"
          className="hover:text-orange-500 transition-colors"
        >
          Todo
        </Link>

        <div className="relative" ref={customerRef}>
          <button
            onClick={() => setCustomerOpen(!customerOpen)}
            className="hover:text-orange-500 transition-colors cursor-pointer"
          >
            Customer ▾
          </button>

          {customerOpen && (
            <div className="absolute left-0 mt-2 w-50 bg-white rounded-md shadow-lg py-2 z-50 cursor-pointer">
              <Link href="/customer-list" className="hover:text-orange-500 block px-4 py-2 hover:bg-gray-100">
                Customers
              </Link>

              <Link href="/contacts" className="hover:text-orange-500 block px-4 py-2 hover:bg-gray-100">
                Contact Details
              </Link>

              <Link href="/contactDesignation" className="hover:text-orange-500 block px-4 py-2 hover:bg-gray-100">
                Contact Desiganation
              </Link>

            </div>
          )}
        </div>


        <div className="relative" ref={salesRef}>
          <button
            onClick={() => setSalesOpen(!salesOpen)}
            className="hover:text-orange-500 transition-colors cursor-pointer"
          >
            Sales ▾
          </button>

          {salesOpen && (
            <div className="absolute left-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-50 cursor-pointer">
              {/* <Link href="/sales/inquiry" className="hover:text-orange-500 block px-4 py-2 hover:bg-gray-100">
                Inquiry
              </Link> */}
              <Link href="/sales/lead" className="hover:text-orange-500 block px-4 py-2 hover:bg-gray-100">
                Lead
              </Link>
              <Link href="/sales/quotation" className="hover:text-orange-500 block px-4 py-2 hover:bg-gray-100">
                Quotation
              </Link>
              {/* <Link href="/sales/indiamart" className="hover:text-orange-500 block px-4 py-2 hover:bg-gray-100">
                India Mart Leads
              </Link> */}
              <Link href="/sales/proforma" className="hover:text-orange-500 block px-4 py-2 hover:bg-gray-100">
                Proforma Invoice
              </Link>
            </div>
          )}
        </div>

        <Link href="/tasks" className="hover:text-orange-500 transition-colors">
          Task List
        </Link>
        {/* <Link
          href="/contracts"
          className="hover:text-orange-500 transition-colors"
        >
          Contracts
        </Link> */}
        <Link href="/setup" className="hover:text-orange-500 transition-colors">
          Settings
        </Link>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handlelogout}
        className="flex items-center text-3xl text-gray-600 font-semibold hover:text-indigo-700 hover:cursor-pointer"
      >
        <i className="bi bi-box-arrow-in-right"></i>
      </button>
    </header>
  );
}

// header in logo
