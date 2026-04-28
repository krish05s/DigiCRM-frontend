"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export default function useAuth(allowedRoles = []) {
  const router = useRouter();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // If no token → redirect to login
    if (!token) {
      toast.error("Please Login First");
      router.back();
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Check token expiry
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        toast.error("Session Expired, Please Login Again");
        router.push("/");
        return;
      }

      // If roles are passed, check access
      // Example: useAuth(["Admin"])
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(role)
      ) {
        toast.error("Access Denied");
        router.back();
        return;
      }

      // If no roles passed → allow all logged-in users
      // Example: useAuth()

    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      toast.error("Invalid Token, Please Login Again");
      router.push("/");
    }
  }, [router, allowedRoles]);
}