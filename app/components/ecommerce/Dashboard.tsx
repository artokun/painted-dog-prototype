"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnapshot } from "valtio";
import { authStore, logout } from "@/app/store/authStore";
import {
  getCustomerOrders,
  getCustomerAddresses,
  updateCustomerAddress,
  updateCustomerProfile,
} from "@/lib/shopify-client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PageOverlay } from "@/app/components/PageOverlay";

export function Dashboard({ visible }: { visible: boolean }) {
  const auth = useSnapshot(authStore);
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "address">(
    "orders"
  );
  const [showMobileMenu, setShowMobileMenu] = useState(true);

  const handleMobileMenuClick = (tab: "orders" | "profile" | "address") => {
    setActiveTab(tab);
    setShowMobileMenu(false);
  };

  //Redirect if not logged in
  useEffect(() => {
    if (auth.hydrated && !auth.isLoggedIn) {
      router.push("/");
    }
  }, [auth.hydrated, auth.isLoggedIn, router]);

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
  }, [auth.accessToken]);

  if (!auth.hydrated) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#e7d7bf]">
        <p className="text-black">Loading...</p>
      </div>
    );
  }

  if (!auth.isLoggedIn) {
    return null;
  }

  return (
    <PageOverlay
      visible={visible}
      id="dashboard-page-scroll-container"
      direction="right"
      className="pt-16 lg:pt-0 flex items-center bg-[#e7d7bf]"
    >
      <div className="flex w-full 2xl:max-w-[1320] mx-auto">
        <div className="mt-40 md:mt-10 px-6 flex w-full mx-auto flex-col lg:pt-8 lg:flex-row lg:px-10">
          {/* Heading */}
          <div className="flex gap-3  flex-col max-w-auto lg:max-w-[600px] pb-8">
            <h2 className="text-[48px] md:text-[72px] font-semibold leading-[72px]">
              Account
            </h2>
            <h4 className="text-[25px] md:text-[28px] w-auto lg:w-[430px] lg:mt-8">
              Welcome to your account, <br></br>
              <span className="capitalize">
                {auth.isLoggedIn && auth.user?.firstName}
              </span>
            </h4>
          </div>

          {/* Main Container */}
          <div className="w-full mx-auto torn-paper">
            <div className="torn-right"></div>
            <div className="torn-bottom"></div>
            <div className=" bg-white  flex h-[500px]">
              {/* MOBILE: Menu or Content */}
              <div className="flex-1 lg:hidden p-6">
                {showMobileMenu ? (
                  /* Mobile Navigation Menu */
                  <nav className="space-y-0">
                    <button
                      onClick={() => handleMobileMenuClick("profile")}
                      className="w-full text-[18px] text-left px-4 py-3 transition-colors flex items-center justify-between"
                    >
                      Profile
                      <span className="text-xl">›</span>
                    </button>
                    <button
                      onClick={() => handleMobileMenuClick("address")}
                      className="w-full text-[18px] text-left px-4 py-3 transition-colors flex items-center justify-between"
                    >
                      Addresses
                      <span className="text-xl">›</span>
                    </button>
                    <button
                      onClick={() => handleMobileMenuClick("orders")}
                      className="w-full text-[18px] text-left px-4 py-3 transition-colors flex items-center justify-between"
                    >
                      Orders
                      <span className="text-xl">›</span>
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          "https://painteddogpress.substack.com/action/disable_email",
                          "_blank",
                          "noopener"
                        )
                      }
                      className="w-full text-[18px] text-left px-4 py-3 transition-colors flex items-center justify-between"
                    >
                      Newsletter
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => router.push("/contact")}
                      className="w-full text-[18px] text-left px-4 py-3 transition-colors flex items-center justify-between"
                    >
                      Contact us
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-[18px] text-left px-4 py-3 transition-colors"
                    >
                      Log out
                    </button>
                  </nav>
                ) : (
                  /* Mobile Content with Back Button */
                  <div>
                    <button
                      onClick={() => setShowMobileMenu(true)}
                      className="flex items-center gap-2 mb-6 text-[16px] hover:underline"
                    >
                      <span className="text-xl">‹</span> Back to account menu
                    </button>

                    {activeTab === "profile" && (
                      <ProfileInfo
                        user={auth.user}
                        accessToken={auth.accessToken}
                      />
                    )}
                    {activeTab === "address" && (
                      <AddressInfo accessToken={auth.accessToken} />
                    )}
                    {activeTab === "orders" && (
                      <OrderHistory orders={orders} loading={loading} />
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar Navigation */}
              <div className="pd_sidenav hidden  w-64  p-6 relative after:absolute after:w-px after:h-[86%] after:right-0 after:top-[7%] after:bg-black lg:flex">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full text-[18px] text-left px-4 py-3 rounded transition-colors ${
                      activeTab === "profile"
                        ? "font-semibold"
                        : "hover:underline hover:cursor-pointer"
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("address")}
                    className={`w-full text-[18px] text-left px-4 py-3 rounded transition-colors ${
                      activeTab === "address"
                        ? "font-semibold"
                        : "hover:underline hover:cursor-pointer"
                    }`}
                  >
                    Addresses
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`w-full text-[18px] text-left px-4 py-3 rounded transition-colors ${
                      activeTab === "orders"
                        ? "font-semibold"
                        : "hover:underline hover:cursor-pointer"
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        "https://painteddogpress.substack.com/action/disable_email",
                        "_blank",
                        "noopener"
                      )
                    }
                    className="w-full text-[18px] text-left px-4 py-3 flex items-center gap-3  hover:underline transition-colors hover:cursor-pointer"
                  >
                    Newsletter
                    <Image
                      src="/contact-arrow.svg"
                      width={10}
                      height={13}
                      alt={"contact arrow"}
                    />
                  </button>
                  <button
                    onClick={() => router.push("/contact")}
                    className={`w-full text-[18px] flex gap-3 text-left px-4 py-3 rounded hover:underline transition-colors hover:cursor-pointer`}
                  >
                    Contact us
                  </button>
                  <button
                    onClick={logout}
                    className="w-full hover:underline text-[18px] text-left px-4 py-3 rounded transition-colors hover:cursor-pointer"
                  >
                    Log out
                  </button>
                </nav>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-8 hidden lg:flex lg:flex-col lg:overflow-y-scroll">
                {/* Content */}
                {activeTab === "profile" && (
                  <ProfileInfo
                    user={auth.user}
                    accessToken={auth.accessToken}
                  />
                )}
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
      </div>
    </PageOverlay>
  );
}

// Profile Info Component
function ProfileInfo({
  user,
  accessToken,
}: {
  user: any;
  accessToken: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  async function handleSave() {
    if (!accessToken) return;
    setSaving(true);
    setError(null);

    const result = await updateCustomerProfile(
      accessToken,
      form.firstName,
      form.lastName,
      form.email
    );

    if (result.success) {
      // Update the auth store so the header name updates too
      authStore.user = { ...authStore.user, ...result.customer };
      setEditing(false);
    } else {
      setError("Failed to update profile. Please try again.");
    }
    setSaving(false);
  }

  if (editing) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          {error && <p className="text-red-500 text-sm pt-2">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4 pb-2 border-b items-center">
            <span className="text-gray-600">First Name</span>
            <input
              className="text-right font-medium border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 pb-2 border-b items-center">
            <span className="text-gray-600">Surname</span>
            <input
              className="text-right font-medium border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 pb-2 border-b items-center">
            <span className="text-gray-600">Email Address</span>
            <input
              className="text-right font-medium border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[18px] font-semibold">Profile</h1>
        <button
          onClick={() => setEditing(true)}
          className="flex text-[#A09E9A] items-center gap-1 py-2 text-sm rounded hover:underline"
        >
          Edit
          <Image
            width={14}
            height={14}
            src={"/edit-pen.svg"}
            alt={"edit pen"}
          />
        </button>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4 pb-2 border-b">
          <span className="text-gray-600">First Name</span>
          <span className="text-right">{user?.firstName || "N/A"}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 pb-2 border-b">
          <span className="text-gray-600">Surname</span>
          <span className="text-right ">{user?.lastName || "N/A"}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 pb-2 border-b">
          <span className="text-gray-600">Email Address</span>
          <span className="text-right">{user?.email || "N/A"}</span>
        </div>
      </div>
    </>
  );
}

// Address Info Component
function AddressInfo({ accessToken }: { accessToken: string | null }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    async function fetchAddresses() {
      if (!accessToken) return;
      setLoading(true);
      const result = await getCustomerAddresses(accessToken);
      if (result.success) setAddresses(result.addresses || []);
      setLoading(false);
    }
    fetchAddresses();
  }, [accessToken]);

  function startEditing(address: any) {
    setEditingId(address.id);
    setForm({
      address1: address.address1 || "",
      address2: address.address2 || "",
      city: address.city || "",
      province: address.province || "",
      zip: address.zip || "",
      country: address.country || "",
      phone: address.phone || "",
    });
    setError(null);
  }

  async function handleSave(addressId: string) {
    if (!accessToken) return;
    setSaving(true);
    setError(null);

    const result = await updateCustomerAddress(accessToken, addressId, form);

    if (result.success) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === addressId ? { ...a, ...result.address } : a))
      );
      setEditingId(null);
    } else {
      setError("Failed to update address. Please try again.");
    }
    setSaving(false);
  }

  if (loading)
    return <div className="text-center py-8">Loading addresses...</div>;

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
    <div className="space-y-6">
      {addresses.map((address, index) => (
        <div key={address.id || index}>
          {index > 0 && <div className="border-t my-6" />}

          {editingId === address.id ? (
            // Edit form
            <>
              {error && <p className="text-red-500 text-sm pt-2">{error}</p>}
              <div className="flex gap-3 pt-4 mb-6">
                <button
                  onClick={() => handleSave(address.id)}
                  disabled={saving}
                  className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Street", field: "address1" },
                  { label: "Apt / Suite", field: "address2" },
                  { label: "City", field: "city" },
                  { label: "Province", field: "province" },
                  { label: "Postal Code", field: "zip" },
                  { label: "Country", field: "country" },
                  { label: "Phone", field: "phone" },
                ].map(({ label, field }) => (
                  <div
                    key={field}
                    className="grid grid-cols-2 gap-4 pb-2 border-b items-center"
                  >
                    <span className="text-gray-600">{label}</span>
                    <input
                      className="text-right font-medium border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
                      value={form[field]}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Read view
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-[18px] font-semibold">Address</h1>

                <button
                  onClick={() => startEditing(address)}
                  className="flex text-[#A09E9A] items-center gap-1 py-2 text-sm rounded hover:underline"
                >
                  Edit
                  <Image
                    width={14}
                    height={14}
                    src={"/edit-pen.svg"}
                    alt={"edit pen"}
                  />
                </button>
              </div>
              <div className="space-y-2">
                {address.address1 && (
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="text-gray-600">Street</span>
                    <span className="text-right">{address.address1}</span>
                  </div>
                )}
                {address.address2 && (
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="text-gray-600">Apt / Suite</span>
                    <span className="text-right font-medium">
                      {address.address2}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <span className="text-gray-600">City</span>
                  <span className="text-right font-medium">
                    {address.city || "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <span className="text-gray-600">Province</span>
                  <span className="text-right font-medium">
                    {address.province || "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <span className="text-gray-600">Postal Code</span>
                  <span className="text-right font-medium">
                    {address.zip || "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 py-2 border-b">
                  <span className="text-gray-600">Country</span>
                  <span className="text-right font-medium">
                    {address.country || "N/A"}
                  </span>
                </div>
                {address.phone && (
                  <div className="grid grid-cols-2 gap-4 py-2 border-b">
                    <span className="text-gray-600">Phone</span>
                    <span className="text-right font-medium">
                      {address.phone}
                    </span>
                  </div>
                )}
                <div className="pt-4"></div>
              </div>
            </>
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
        <p className="text-sm">Start shopping to see your order history here</p>
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
          {/* Order Meta */}
          <div className="flex justify-between items-start mb-3">
            <div className="text-[14px]">Order no. {order.orderNumber}</div>
            <div className="text-[14px]">
              Date: {new Date(order.processedAt).toLocaleDateString()}
            </div>
            <div className="text-[14px]">
              Status: {order.fulfillmentStatus || "Processing"}
            </div>
          </div>

          {/* Line Items */}
          <div className="flex flex-col justify-between items-start mb-3">
            {order.lineItems.edges.map((item: any, index: number) => (
              <div key={`${item.node.title}-${index}`} className="w-full">
                <div className="flex gap-2">
                  <div className="flex items-center gap-3 text-sm">
                    {item.node.variant?.image?.url ? (
                      <img
                        src={item.node.variant.image.url}
                        alt={item.node.variant.image.altText || item.node.title}
                        className="w-[77px] h-[93px] object-cover rounded border border-gray-100 shrink-0"
                      />
                    ) : (
                      <Image
                        src="/product-placeholder.svg"
                        width={77}
                        height={93}
                        alt="product"
                      />
                    )}
                    <span className="font-semibold text-[24px]">
                      {item.node.title}
                    </span>
                  </div>
                </div>
                <div className="text-right w-full pt-2">
                  <p className="flex justify-between">
                    <span className="text-[14px]">Subtotal</span>
                    <span className="text-[14px]">
                      R
                      {parseFloat(item.node.originalTotalPrice.amount).toFixed(
                        2
                      )}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      R{parseFloat(order.totalShippingPrice.amount).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total — outside the map, renders once per order */}
          <div className="space-y-2 mt-3 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-[18px]">Total</span>
              <span className="text-[18px] font-semibold">
                R{parseFloat(order.totalPrice.amount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
