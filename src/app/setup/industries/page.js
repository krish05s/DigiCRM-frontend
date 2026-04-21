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
                title="Industries"
                listApi={`${API_BASE}/api/Industries/read`} // add your list API
                saveApi={`${API_BASE}/api/Industries`}      // add your insert API without any endpoints
                breadcrumbs={["Industries"]}
                showRadio={false}
                showCheckboxColumn={false}
            />
        </>
    );
}
