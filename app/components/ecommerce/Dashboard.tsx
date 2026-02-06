"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnapshot } from "valtio";
import { authStore, logout } from "@/app/store/authStore";
import { getCustomerOrders, getCustomerAddresses } from "@/lib/shopify";
import { globalStore } from "@/app/store/globalStore";
import { useSpring } from "@react-spring/three";
import { animated } from "@react-spring/web";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function Dashboard({ visible }: { visible: boolean }) {
  const auth = useSnapshot(authStore);
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "address">(
    "orders"
  );
  const [showContent, setShowContent] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll position and smooth scroll to top on navigation away
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (visible) {
        globalStore.overlayScrollPosition = container.scrollTop;
      }
    };

    container.addEventListener("scroll", handleScroll);

    // Smooth scroll to top when navigating away
    if (!visible && container.scrollTop > 0) {
      container.scrollTo({ top: 0, behavior: "smooth" });
      globalStore.overlayScrollPosition = 0;
    }

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [visible]);

  const style = useSpring({
    opacity: visible ? 1 : 0,
    x: visible ? 0 : 100,
    delay: visible ? 300 : 50,
    onStart: () => {
      setShowContent(true);
    },
    onRest: () => {
      setShowContent(visible);
    },
  });

  // Redirect if not logged in
  // useEffect(() => {
  //   if (!auth.isLoggedIn) {
  //     router.push("/login");
  //   }
  // }, [auth.isLoggedIn, router]);

  // // Fetch orders on mount
  useEffect(() => {
    async function fetchOrders() {
      if (!auth.accessToken) return;

      setLoading(true);
      const result = await getCustomerOrders(auth.accessToken);

      if (result.success) {
        setOrders(result.orders || []);
      }
      setLoading(false);
    }

    if (auth.isLoggedIn) {
      fetchOrders();
    }
  }, [auth.isLoggedIn, auth.accessToken]);

  if (!auth.isLoggedIn) {
    return null;
  }

  return (
    <animated.div
      ref={containerRef}
      id="dasboard-page-scroll-container"
      style={style}
      className={cn(
        "absolute inset-0 flex items-center h-dvh w-dvw text-black z-10 overflow-y-auto overflow-x-hidden bg-[#e7d7bf]",
        visible && "pointer-events-auto"
      )}
    >
      <div className="mt-10  px-2  flex w-full mx-auto flex-col lg:pt-8 lg:px-20 md:flex-row">
        {/* Heading */}
        <div className="flex flex-col lg:max-w-[600px]">
          <h2 className="text-black/30 text-7xl leading-[72px] underline">
            Library
          </h2>
          <h2 className="text-[72px] leading-[72px]">Account</h2>
          <h4 className="text-[28px] w-[430px] lg:mt-8">
            Welcome to your account, Georgia
          </h4>
        </div>

        {/* Main Container */}
        <div className="w-full mx-auto">
          <div className="bg-white  shadow-lg overflow-hidden flex h-[500px]">
            {/* Sidebar Navigation */}
            <div className="pd_sidenav w-64  p-6 relative after:absolute after:w-px after:h-[86%] after:right-0 after:top-[7%] after:bg-black">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded transition-colors ${
                    activeTab === "profile"
                      ? "font-bold"
                      : "hover:bg-gray-50 hover:cursor-pointer"
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("address")}
                  className={`w-full text-left px-4 py-3 rounded transition-colors ${
                    activeTab === "address"
                      ? "font-bold"
                      : "hover:bg-gray-50 hover:cursor-pointer"
                  }`}
                >
                  Addresses
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded transition-colors ${
                    activeTab === "orders"
                      ? "font-bold"
                      : "hover:bg-gray-50 hover:cursor-pointer"
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => router.push("/contact")}
                  className={`w-full flex gap-1 text-left px-4 py-3 rounded transition-colors hover:cursor-pointer`}
                >
                  Contact Us <ArrowUpRight />
                </button>
                <button
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="w-full text-left px-4 py-3 rounded hover:bg-gray-50 transition-colors text-red-600 hover:cursor-pointer"
                >
                  Logout
                </button>
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8">
              {/* Header with Edit button */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                  {activeTab === "profile"
                    ? "Profile"
                    : activeTab === "address"
                      ? "Addresses"
                      : "Order History"}
                </h1>
              </div>

              {/* Content */}
              {activeTab === "profile" && <ProfileInfo user={auth.user} />}
              {activeTab === "address" && (
                <AddressInfo accessToken={auth.accessToken} />
              )}
              {activeTab === "orders" && (
                <OrderHistory orders={orders} loading={loading} />
              )}
            </div>
          </div>
        </div>
      </div>
    </animated.div>
  );
}

// Profile Info Component - Updated to match your design
function ProfileInfo({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 pb-4 border-b">
        <span className="text-gray-600">First Name</span>
        <span className="text-right font-medium">
          {user?.firstName || "N/A"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-4 border-b">
        <span className="text-gray-600">Surname</span>
        <span className="text-right font-medium">
          {user?.lastName || "N/A"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-4 border-b">
        <span className="text-gray-600">Email Address</span>
        <span className="text-right font-medium">{user?.email || "N/A"}</span>
      </div>
    </div>
  );
}

// Address Info Component
function AddressInfo({ accessToken }: { accessToken: string | null }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAddresses() {
      if (!accessToken) return;

      setLoading(true);
      const result = await getCustomerAddresses(accessToken);

      if (result.success) {
        setAddresses(result.addresses || []);
      }
      setLoading(false);
    }

    fetchAddresses();
  }, [accessToken]);

  if (loading) {
    return <div className="text-center py-8">Loading addresses...</div>;
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p className="text-lg mb-2">No saved addresses</p>
        <p className="text-sm">
          Your shipping addresses will appear here after your first order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.map((address, index) => (
        <div
          key={address.id || index}
          className="border border-gray-200 rounded-lg p-4"
        >
          {address.name && <p className="font-medium mb-2">{address.name}</p>}
          <p className="text-sm text-gray-700">{address.address1}</p>
          {address.address2 && (
            <p className="text-sm text-gray-700">{address.address2}</p>
          )}
          <p className="text-sm text-gray-700">
            {address.city}, {address.province} {address.zip}
          </p>
          <p className="text-sm text-gray-700">{address.country}</p>
          {address.phone && (
            <p className="text-sm text-gray-700 mt-2">Phone: {address.phone}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// Order History Component
function OrderHistory({
  orders,
  loading,
}: {
  orders: any[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p className="text-lg mb-2">No orders yet</p>
        <p className="text-sm">
          Start shopping to see your order history here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium">Order #{order.orderNumber}</p>
              <p className="text-sm text-gray-600">
                {new Date(order.processedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">
                ${parseFloat(order.totalPrice.amount).toFixed(2)}
              </p>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  order.fulfillmentStatus === "FULFILLED"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.fulfillmentStatus || "Processing"}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-2 mt-3 pt-3 border-t">
            {order.lineItems.edges.map((item: any) => (
              <div key={item.node.id} className="flex justify-between text-sm">
                <span>
                  {item.node.title} x {item.node.quantity}
                </span>
                <span>
                  ${parseFloat(item.node.originalTotalPrice.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
