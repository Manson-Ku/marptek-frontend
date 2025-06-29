// context/CustomerContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const CustomerContext = createContext({
  customerId: null,
  loading: true,
  error: null,
  refreshCustomerId: () => {},
});

export function CustomerProvider({ children }) {
  const { data: session, status } = useSession();
  const [customerId, setCustomerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 取得 customerId
  const fetchCustomerId = async () => {
    setLoading(true);
    setError(null);
    try {
      if (session?.idToken) {
        const res = await fetch("https://marptek-login-api-84949832003.asia-east1.run.app/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: session.idToken }),
        });
        const data = await res.json();
        if (data?.user?.customer_id) {
          setCustomerId(data.user.customer_id);
        } else {
          setCustomerId(null);
          setError("找不到 customer_id");
        }
      } else {
        setCustomerId(null);
      }
    } catch (e) {
      setError(e.message || "取得 customerId 失敗");
      setCustomerId(null);
    } finally {
      setLoading(false);
    }
  };

  // 自動取得 customerId，依 session.idToken
  useEffect(() => {
    if (status === "authenticated" && session?.idToken) {
      fetchCustomerId();
    } else if (status !== "loading") {
      setCustomerId(null);
      setLoading(false);
    }
  }, [session?.idToken, status]);

  // 提供 context value
  return (
    <CustomerContext.Provider
      value={{
        customerId,
        loading,
        error,
        refreshCustomerId: fetchCustomerId,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

// custom hook
export function useCustomer() {
  return useContext(CustomerContext);
}
