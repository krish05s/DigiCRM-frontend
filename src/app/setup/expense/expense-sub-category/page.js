"use client";

import React from "react";
import CommonMasterPage from "@/app/components/CommonMasterPage";
import Header from "@/app/components/header";

export default function Page() {

    const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
    return (
        <>
            <Header />
            <CommonMasterPage
                title="Expense Sub Category"
                listApi={`${API_BASE}/api/expense-sub-category/read`} // add your list API
                saveApi={`${API_BASE}/api/expense-sub-category`}      // add your insert API without any endpoints
                breadcrumbs={["Expense", "Expense Sub Category"]}
                showRadio={false}
                showCheckboxColumn={false}
            />
        </>
    );
}
