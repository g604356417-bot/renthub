"use client";

import { useEffect, useRef, useState } from "react";
import {
  CATEGORY_CARDS,
  CATEGORY_FILTER_SECTIONS,
  DETAIL_REVIEWS,
  HOME_FEATURES,
  INITIAL_FEATURED,
  INITIAL_MODERATION,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  LISTINGS as LOCAL_LISTINGS
} from "./renthub-data";

const PRIVATE_PAGES = ["dash", "vendor", "amod", "afeat", "anotif", "alisting", "aparser", "settings"];
const ADMIN_PAGES = ["amod", "afeat", "anotif", "alisting", "aparser"];
const NOTIFICATION_ICONS = {
  new_listing: "🔵",
  booking: "🟢",
  listing_updated: "🟡",
  system_alert: "🔴"
};
const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_BASE_URL || "http://127.0.0.1:8000";

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function roleColor(role) {
  return role === "admin" ? "var(--acc)" : "#2a6a2a";
}

function roleLabel(role) {
  return role === "admin" ? "Administrator" : "Vendor";
}

function stars(rating) {
  return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
}

function dayDiff(start, end) {
  if (!start || !end) {
    return 0;
  }

  const diff = Math.round((new Date(end) - new Date(start)) / 86400000);
  return diff > 0 ? diff : 0;
}

function categoryTitle(slug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function ListingCard({ listing, onOpen }) {
  return (
    <div className="vc" onClick={() => onOpen(listing.id)}>
      <div className="vim">
        {listing.img ? (
          <img src={listing.img} alt={listing.t} loading="lazy" />
        ) : (
          <span className="icon-fallback">🚗</span>
        )}
      </div>
      <div className="vb">
        <div className="vcy">{listing.city}</div>
        <div className="vt">{listing.t}</div>
        <div className="vf">
          <div className="vp">
            ${listing.p}
            <span>/day</span>
          </div>
          <div className="det" style={{ fontSize: "10px" }}>
            Book Now
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSidebar({ page, unreadCount, onGo }) {
  return (
    <aside className="asb">
      <div
        style={{
          padding: ".5rem 1.5rem 1.25rem",
          fontFamily: "Georgia, serif",
          fontSize: "1.2rem",
          fontWeight: 700,
          borderBottom: "1px solid var(--bdr)",
          marginBottom: ".75rem"
        }}
      >
        Admin
        <br />
        Panel
      </div>
      <div className={`sbi ${page === "amod" ? "on" : ""}`} onClick={() => onGo("amod")}>
        ⚖ Moderation
      </div>
      <div className={`sbi ${page === "afeat" ? "on" : ""}`} onClick={() => onGo("afeat")}>
        ⭑ Featured
      </div>
      <div className={`sbi ${page === "alisting" ? "on" : ""}`} onClick={() => onGo("alisting")}>
        📋 Listings
      </div>
      <div className={`sbi ${page === "aparser" ? "on" : ""}`} onClick={() => onGo("aparser")}>
        🕷 Parser
      </div>
      <div className={`sbi ${page === "anotif" ? "on" : ""}`} onClick={() => onGo("anotif")}>
        🔔 Notifications
        <span
          style={{
            background: "var(--acc)",
            color: "var(--afg)",
            fontSize: "10px",
            padding: "1px 7px",
            borderRadius: "10px",
            marginLeft: "4px"
          }}
        >
          {unreadCount || ""}
        </span>
      </div>
      <div style={{ height: "1px", background: "var(--bdr)", margin: "1rem 0" }} />
      <div className="sbi" onClick={() => onGo("settings")}>
        ⚙ Settings
      </div>
      <div className="sbi" onClick={() => onGo("dash")}>
        ← Dashboard
      </div>
    </aside>
  );
}

function ModerationCard({ listing, showActions, showReason, onApprove, onReject, onDelete }) {
  return (
    <div className="mc">
      <div className="mi2">
        <div className="mimg">
          {listing.img ? <img src={listing.img} alt="" /> : <span className="icon-fallback">📦</span>}
        </div>
        <div className="mb2">
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: ".2rem" }}>{listing.t}</h3>
            <p style={{ fontSize: "12px", color: "var(--mfg)", marginBottom: ".35rem" }}>
              {listing.city} · <strong>${listing.p}</strong>/day
            </p>
            {listing.desc ? (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--mfg)",
                  lineHeight: 1.5,
                  marginBottom: ".35rem"
                }}
              >
                {listing.desc}
              </p>
            ) : null}
            {showReason ? (
              <div className="adk" style={{ fontSize: "12px", padding: ".5rem .85rem", marginBottom: ".35rem" }}>
                Reason: {listing.reason}
              </div>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: ".5rem", marginTop: ".75rem", flexWrap: "wrap" }}>
            {showActions ? (
              <>
                <button className="btn bs2 bxs" onClick={() => onApprove(listing.id)}>
                  ✓ Approve
                </button>
                <button className="btn bd bxs" onClick={() => onReject(listing.id)}>
                  ✗ Reject
                </button>
              </>
            ) : null}
            <button className="btn bd bxs" onClick={onDelete}>
              🗑 Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ slug }) {
  const section = CATEGORY_FILTER_SECTIONS[slug];
  if (!section) {
    return null;
  }

  return (
    <div className="fsec">
      {section.selects.map((item) => (
        <div key={item.label} style={{ marginBottom: "1rem" }}>
          <span className="flbl">{item.label}</span>
          <select className="fi2" defaultValue={item.options[0]}>
            {item.options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      ))}
      {section.checks.map((item) => (
        <label key={item} className="chk">
          <input type="checkbox" />
          {item}
        </label>
      ))}
    </div>
  );
}

export default function Page() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("home");
  const [prevPage, setPrevPage] = useState("home");
  const [currentCategory, setCurrentCategory] = useState("");
  const [sortMode, setSortMode] = useState("");
  const [currentListingId, setCurrentListingId] = useState(null);
  const [detailImage, setDetailImage] = useState("");
  const [detailDates, setDetailDates] = useState({ start: "", end: "" });
  const [showBooked, setShowBooked] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", pass: "" });
  const [loginError, setLoginError] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [browseFilters, setBrowseFilters] = useState({ city: "", text: "", minPrice: 0, maxPrice: 1000 });
  const [dashTab, setDashTab] = useState("bookings");
  const [listings, setListings] = useState(LOCAL_LISTINGS);
  const [moderation, setModeration] = useState(INITIAL_MODERATION);
  const [modTab, setModTab] = useState("pending");
  const [featured, setFeatured] = useState(INITIAL_FEATURED);
  const [featureSelectId, setFeatureSelectId] = useState("");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState("all");
  const [settingsTab, setSettingsTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({ name: "", email: "", company: "", role: "" });
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    email: "",
    pass: "",
    role: "vendor",
    company: ""
  });
  const [partnerError, setPartnerError] = useState("");
  const [toast, setToast] = useState("");

  // Listing Manager state
  const [listingMgrTab, setListingMgrTab] = useState("all");
  const [listingForm, setListingForm] = useState({ t: "", cat: "cars", city: "", p: "", desc: "", tags: "", img: "", imgs: [], status: "active", publishFrom: "", publishTo: "", specs: {} });
  const [editingListingId, setEditingListingId] = useState(null);
  const [listingFormOpen, setListingFormOpen] = useState(false);
  const [listingSearch, setListingSearch] = useState("");

  // ── Parser state ──────────────────────────────────────────────────────────
  const PARSER_CATS = ["real_estate","cars","jobs","services","boats","electronics","animals","tourism"];
  const PARSER_CAT_LABELS = { real_estate:"Real Estate", cars:"Cars", jobs:"Jobs", services:"Services", boats:"Boats", electronics:"Electronics", animals:"Animals", tourism:"Tourism" };
  const PARSER_INTERVALS = ["15min","30min","1h","6h","12h","24h","custom"];
  const PARSER_METHODS = ["rss","xml","json_api","html"];
  const PARSER_METHOD_LABELS = { rss:"RSS", xml:"XML Feed", json_api:"JSON API", html:"HTML Scraper" };

  const EMPTY_SOURCE = {
    name:"", url:"", category:"cars", method:"rss", status:"active",
    interval:"1h", customCron:"", moderation:"auto",
    fieldMap:{ title:"title", description:"description", price:"price", currency:"currency",
      city:"city", address:"address", phone:"phone", email:"email",
      seller:"seller", photos:"photos", pubDate:"pubDate", sourceUrl:"sourceUrl" },
    dupCheck:{ url:true, phone:false, title_price:true, source_id:false }
  };

  const INIT_SOURCES = [
    { id:1, name:"Auto.me", url:"https://auto.me/rss", category:"cars", method:"rss",
      status:"active", interval:"1h", customCron:"", moderation:"auto",
      fieldMap:{ title:"title", description:"description", price:"price", currency:"currency",
        city:"city", address:"", phone:"phone", email:"email",
        seller:"author", photos:"enclosure", pubDate:"pubDate", sourceUrl:"link" },
      dupCheck:{ url:true, phone:false, title_price:true, source_id:false },
      stats:{ total:142, newToday:18, updated:5, errors:0, lastRun:"2025-06-23T22:05:00" }
    },
    { id:2, name:"Nekretnine.me", url:"https://nekretnine.me/feed", category:"real_estate", method:"rss",
      status:"active", interval:"6h", customCron:"", moderation:"review",
      fieldMap:{ title:"title", description:"description", price:"price", currency:"currency",
        city:"location", address:"address", phone:"contact_phone", email:"",
        seller:"agent_name", photos:"images", pubDate:"date", sourceUrl:"url" },
      dupCheck:{ url:true, phone:true, title_price:false, source_id:true },
      stats:{ total:87, newToday:4, updated:2, errors:1, lastRun:"2025-06-23T18:00:00" }
    },
  ];

  const INIT_IMPORT_LOG = [
    { id:1, ts:"2025-06-23T22:05:00", source:"Auto.me", action:"run", status:"ok", msg:"Imported 18 new, 5 updated, 0 errors" },
    { id:2, ts:"2025-06-23T18:00:00", source:"Nekretnine.me", action:"run", status:"warn", msg:"Imported 4 new, 2 updated, 1 error: connection timeout on item #34" },
    { id:3, ts:"2025-06-23T12:00:00", source:"Auto.me", action:"check", status:"ok", msg:"Source reachable, feed valid (142 items)" },
  ];

  const [parserTab, setParserTab] = useState("sources");       // sources | import | log
  const [parserSources, setParserSources] = useState(INIT_SOURCES);
  const [parserLog, setParserLog] = useState(INIT_IMPORT_LOG);
  const [parserRunning, setParserRunning] = useState({});      // { sourceId: bool }
  const [parserSourceForm, setParserSourceForm] = useState(EMPTY_SOURCE);
  const [parserSourceFormOpen, setParserSourceFormOpen] = useState(false);
  const [parserEditId, setParserEditId] = useState(null);
  const [parserSourceTab, setParserSourceTab] = useState("basic"); // basic | fields | dedup | schedule
  const [parserSearch, setParserSearch] = useState("");
  const [parserFilterCat, setParserFilterCat] = useState("all");
  const [parserFilterStatus, setParserFilterStatus] = useState("all");
  const [parserImportedListings, setParserImportedListings] = useState([]);

  const toastTimerRef = useRef(null);
  const loginEmailRef = useRef(null);
  const partnerNameRef = useRef(null);

  const currentListing = listings.find((listing) => listing.id === currentListingId) || null;
  const currentImages = currentListing
    ? currentListing.imgs && currentListing.imgs.length
      ? currentListing.imgs
      : currentListing.img
        ? [currentListing.img]
        : []
    : [];
  const bookingDays = dayDiff(detailDates.start, detailDates.end);
  const bookingTotal = currentListing ? bookingDays * currentListing.p : 0;
  const activeListingCount = listings.filter((listing) => listing.status === "active").length;
  const homeListings = (featured.length
    ? featured.map((item) => listings.find((listing) => listing.id === item.id)).filter(Boolean)
    : listings.slice(0, 6)
  ).slice(0, 6);
  const browseCategories = [...new Set(listings.map((listing) => listing.cat))];
  const featureOptions = listings.filter((listing) => !featured.some((item) => item.id === listing.id));
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const partnersAdmins = users.filter((user) => user.role === "admin").length;
  const partnersVendors = users.filter((user) => user.role === "vendor").length;
  const filteredNotifications =
    notifFilter === "unread" ? notifications.filter((notification) => !notification.read) : notifications;

  let browseListings = listings.filter((listing) => {
    if (listing.status !== "active") return false;
    if (currentCategory && listing.cat !== currentCategory) return false;
    if (browseFilters.city && !listing.city.toLowerCase().includes(browseFilters.city.toLowerCase())) return false;
    if (listing.p < browseFilters.minPrice || listing.p > browseFilters.maxPrice) return false;
    if (browseFilters.text) {
      const query = browseFilters.text.toLowerCase();
      const haystack = `${listing.t} ${listing.desc || ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  if (sortMode === "pa") {
    browseListings = [...browseListings].sort((a, b) => a.p - b.p);
  } else if (sortMode === "pd") {
    browseListings = [...browseListings].sort((a, b) => b.p - a.p);
  } else if (sortMode === "az") {
    browseListings = [...browseListings].sort((a, b) => a.t.localeCompare(b.t));
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadListings() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings/?status=active`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Failed to load listings: ${response.status}`);
        }

        const payload = await response.json();
        const apiListings = Array.isArray(payload.results) ? payload.results : [];

        if (!apiListings.length) {
          return;
        }

        setListings(apiListings);
        setFeatured(
          apiListings
            .filter((listing) => listing.featuredRank != null)
            .sort((a, b) => a.featuredRank - b.featuredRank)
            .map((listing) => ({
              id: listing.id,
              t: listing.t,
              city: listing.city,
              p: listing.p,
              img: listing.img
            }))
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to load listings from Django API, using local fallback.", error);
        }
      }
    }

    loadListings();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (currentListing && currentImages.length) {
      setDetailImage(currentImages[0]);
    } else {
      setDetailImage("");
    }
    setDetailDates({ start: "", end: "" });
    setShowBooked(false);
  }, [currentListingId]);

  useEffect(() => {
    if (page === "settings" && currentUser) {
      setSettingsTab("profile");
      setProfileForm({
        name: currentUser.name,
        email: currentUser.email,
        company: currentUser.company || "",
        role: roleLabel(currentUser.role)
      });
    }
  }, [page, currentUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, [page]);

  useEffect(() => {
    if (loginOpen && loginEmailRef.current) {
      loginEmailRef.current.focus();
    }
  }, [loginOpen]);

  useEffect(() => {
    if (partnerModalOpen && partnerNameRef.current) {
      partnerNameRef.current.focus();
    }
  }, [partnerModalOpen]);

  useEffect(() => {
    function handleClick(event) {
      if (!event.target.closest(".umenu")) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  function showToast(message) {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 3000);
  }

  function openLogin() {
    setLoginError("");
    setLoginOpen(true);
  }

  function closeLogin() {
    setLoginError("");
    setLoginOpen(false);
  }

  function go(nextPage, category) {
    if (PRIVATE_PAGES.includes(nextPage) && !currentUser) {
      openLogin();
      return;
    }

    if (ADMIN_PAGES.includes(nextPage) && currentUser?.role !== "admin") {
      showToast("Admin access required.");
      return;
    }

    setPrevPage(page);
    setPage(nextPage);
    if (nextPage === "browse") setCurrentCategory(category || "");
    if (nextPage === "settings") setSettingsTab("profile");
    setUserMenuOpen(false);
  }

  function goBack() {
    go(prevPage);
  }

  function requireAuth(nextPage) {
    if (currentUser) {
      go(nextPage);
    } else {
      openLogin();
    }
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    const email = loginForm.email.trim().toLowerCase();
    const password = loginForm.pass;
    const user = users.find((item) => item.email.toLowerCase() === email && item.pass === password);
    if (!user) {
      setLoginError("Incorrect email or password.");
      return;
    }
    setCurrentUser(user);
    setLoginForm({ email: "", pass: "" });
    setLoginError("");
    setLoginOpen(false);
    showToast(`Welcome back, ${user.name.split(" ")[0]}!`);
  }

  function handleLogout() {
    setCurrentUser(null);
    setUserMenuOpen(false);
    setPage("home");
    showToast("You have been signed out.");
  }

  function openListing(id) {
    setPrevPage(page);
    setCurrentListingId(id);
    setPage("detail");
  }

  function handleBookNow() {
    setShowBooked(true);
  }

  function resetFilters() {
    setCurrentCategory("");
    setSortMode("");
    setBrowseFilters({ city: "", text: "", minPrice: 0, maxPrice: 1000 });
  }

  function handleApproveListing(id) {
    setModeration((current) => {
      const listing = current.p.find((item) => item.id === id);
      if (!listing) return current;
      return {
        ...current,
        p: current.p.filter((item) => item.id !== id),
        a: [...current.a, { ...listing }]
      };
    });
    showToast("Listing approved!");
  }

  function handleRejectListing(id) {
    setModeration((current) => {
      const listing = current.p.find((item) => item.id === id);
      if (!listing) return current;
      return {
        ...current,
        p: current.p.filter((item) => item.id !== id),
        r: [...current.r, { ...listing, reason: "Rejected by administrator" }]
      };
    });
    showToast("Listing rejected.");
  }

  function handleDeleteListing(id, tab) {
    if (!window.confirm("Delete this listing?")) return;

    setModeration((current) => {
      if (tab === "p") return { ...current, p: current.p.filter((item) => item.id !== id) };
      if (tab === "a") return { ...current, a: current.a.filter((item) => item.id !== id) };
      return { ...current, r: current.r.filter((item) => item.id !== id) };
    });

    if (tab === "a") {
      setFeatured((current) => current.filter((item) => item.id !== id));
    }

    showToast("Listing deleted.");
  }

  function addFeatured() {
    const id = Number(featureSelectId);
    if (!id) return;
    const listing = listings.find((item) => item.id === id);
    if (!listing) return;
    setFeatured((current) => [
      ...current,
      { id: listing.id, t: listing.t, city: listing.city, p: listing.p, img: listing.img }
    ]);
    setFeatureSelectId("");
    showToast("Added to featured!");
  }

  function removeFeatured(index) {
    setFeatured((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function moveFeatured(index, delta) {
    setFeatured((current) => {
      const nextIndex = index + delta;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  }

  function markNotificationRead(id) {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }

  function markAllNotifications() {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }

  function saveProfile() {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      name: profileForm.name || currentUser.name,
      email: profileForm.email || currentUser.email,
      company: profileForm.company
    };
    setUsers((current) => current.map((user) => (user.id === currentUser.id ? updatedUser : user)));
    setCurrentUser(updatedUser);
    setProfileForm((current) => ({ ...current, role: roleLabel(updatedUser.role) }));
    showToast("Profile saved!");
  }

  function openPartnerModal() {
    setPartnerError("");
    setPartnerModalOpen(true);
  }

  function closePartnerModal() {
    setPartnerModalOpen(false);
    setPartnerForm({ name: "", email: "", pass: "", role: "vendor", company: "" });
    setPartnerError("");
  }

  function savePartner(event) {
    event.preventDefault();
    const name = partnerForm.name.trim();
    const email = partnerForm.email.trim().toLowerCase();
    const password = partnerForm.pass;
    const company = partnerForm.company.trim();

    if (!name || !email || !password) {
      setPartnerError("Please fill in Name, Email and Password.");
      return;
    }
    if (password.length < 6) {
      setPartnerError("Password must be at least 6 characters.");
      return;
    }
    if (users.some((user) => user.email.toLowerCase() === email)) {
      setPartnerError("An account with this email already exists.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      pass: password,
      role: partnerForm.role,
      company,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })
    };

    setUsers((current) => [...current, newUser]);
    closePartnerModal();
    showToast(`✓ Account created for ${name}`);
  }

  function deletePartner(id) {
    const user = users.find((item) => item.id === id);
    if (!user) return;
    if (!window.confirm(`Delete account for ${user.name}?`)) return;
    setUsers((current) => current.filter((item) => item.id !== id));
    showToast(`Account for ${user.name} deleted.`);
  }

  function resetPartnerPassword(id) {
    const user = users.find((item) => item.id === id);
    if (!user) return;
    const nextPassword = window.prompt(`New password for ${user.name}:`);
    if (!nextPassword) return;
    if (nextPassword.length < 6) {
      window.alert("Min. 6 characters.");
      return;
    }
    setUsers((current) =>
      current.map((item) => (item.id === id ? { ...item, pass: nextPassword } : item))
    );
    showToast(`Password reset for ${user.name}`);
  }

  // ── Listing Manager handlers ──────────────────────────────────────────────
  // ── Per-category spec schema ──────────────────────────────────────────────
  const CAT_SPECS = {
    cars: [
      { key: "type",        label: "Body Type",     type: "select", opts: ["Sedan","SUV","Crossover","Hatchback","Coupe","Convertible","Minivan","Pickup"] },
      { key: "fuel",        label: "Fuel",          type: "select", opts: ["Petrol","Diesel","Electric","Hybrid"] },
      { key: "gearbox",     label: "Gearbox",       type: "select", opts: ["Automatic","Manual","CVT","Robot"] },
      { key: "seats",       label: "Seats",         type: "select", opts: ["2","4","5","7","8+"] },
      { key: "power",       label: "Power (hp)",    type: "text",   placeholder: "e.g. 249" },
      { key: "drive",       label: "Drive",         type: "select", opts: ["FWD","RWD","AWD","4x4"] },
      { key: "year",        label: "Year",          type: "text",   placeholder: "e.g. 2023" },
      { key: "deposit",     label: "No Deposit",    type: "check" },
      { key: "delivery",    label: "Delivery",      type: "check" },
      { key: "insurance",   label: "Insurance incl.",type: "check" },
    ],
    motorcycles: [
      { key: "mtype",       label: "Bike Type",     type: "select", opts: ["Scooter","Motorcycle","Quad","Moped"] },
      { key: "engine",      label: "Engine (cc)",   type: "text",   placeholder: "e.g. 1103" },
      { key: "power",       label: "Power (hp)",    type: "text",   placeholder: "e.g. 214" },
      { key: "gearbox",     label: "Gearbox",       type: "select", opts: ["Manual","Automatic","Semi-auto"] },
      { key: "helmet",      label: "Helmet incl.",  type: "check" },
      { key: "gloves",      label: "Gloves incl.",  type: "check" },
      { key: "insurance",   label: "Insurance incl.",type: "check" },
    ],
    boats: [
      { key: "vtype",       label: "Vessel Type",   type: "select", opts: ["Sailing Yacht","Motor Yacht","Catamaran","Speedboat","Jet Ski","Kayak","Rowboat"] },
      { key: "length",      label: "Length (m)",    type: "text",   placeholder: "e.g. 12.5" },
      { key: "cabins",      label: "Cabins",        type: "select", opts: ["0","1","2","3","4","5+"] },
      { key: "guests",      label: "Max Guests",    type: "text",   placeholder: "e.g. 8" },
      { key: "year",        label: "Year",          type: "text",   placeholder: "e.g. 2021" },
      { key: "captain",     label: "Captain incl.", type: "check" },
      { key: "kitchen",     label: "Kitchen",       type: "check" },
      { key: "gps",         label: "GPS",           type: "check" },
      { key: "wifi",        label: "Wi-Fi",         type: "check" },
    ],
    apartments: [
      { key: "atype",       label: "Type",          type: "select", opts: ["Apartment","Studio","Villa","Townhouse","Penthouse","Room"] },
      { key: "bedrooms",    label: "Bedrooms",      type: "select", opts: ["Studio","1","2","3","4","5+"] },
      { key: "area",        label: "Area (m²)",     type: "text",   placeholder: "e.g. 85" },
      { key: "floor",       label: "Floor",         type: "text",   placeholder: "e.g. 7th" },
      { key: "guests",      label: "Max Guests",    type: "text",   placeholder: "e.g. 4" },
      { key: "view",        label: "View",          type: "select", opts: ["Sea View","City View","Mountain View","Garden View","No View"] },
      { key: "pool",        label: "Pool",          type: "check" },
      { key: "wifi",        label: "Wi-Fi",         type: "check" },
      { key: "ac",          label: "A/C",           type: "check" },
      { key: "parking",     label: "Parking",       type: "check" },
      { key: "balcony",     label: "Balcony",       type: "check" },
      { key: "pets",        label: "Pets allowed",  type: "check" },
    ],
    bicycles: [
      { key: "btype",       label: "Bike Type",     type: "select", opts: ["Mountain","City","Road","BMX","Electric","Cargo","Kids"] },
      { key: "wheels",      label: "Wheel size",    type: "select", opts: ['20"','24"','26"','27.5"','29"'] },
      { key: "gears",       label: "Gears",         type: "select", opts: ["Single speed","3-spd","7-spd","8-spd","11-spd","12-spd"] },
      { key: "brakes",      label: "Brakes",        type: "select", opts: ["Rim","Disc mechanical","Hydraulic disc"] },
      { key: "suspension",  label: "Suspension",    type: "select", opts: ["Rigid","Hardtail","Full-suspension"] },
      { key: "helmet",      label: "Helmet incl.",  type: "check" },
      { key: "lock",        label: "Lock incl.",    type: "check" },
    ],
    robots: [
      { key: "rtype",       label: "Robot Type",    type: "select", opts: ["Humanoid","Quadruped","Wheeled","Drone","Arm","Cleaning","Delivery","Entertainment"] },
      { key: "purpose",     label: "Purpose",       type: "select", opts: ["Home","Business","Events","Security","Construction","Research"] },
      { key: "battery",     label: "Battery life",  type: "text",   placeholder: "e.g. 90 min" },
      { key: "payload",     label: "Payload (kg)",  type: "text",   placeholder: "e.g. 14" },
      { key: "sdk",         label: "SDK Access",    type: "check" },
      { key: "operator",    label: "Operator avail.",type: "check" },
      { key: "programmable",label: "Programmable",  type: "check" },
    ],
    aircraft: [
      { key: "atype",       label: "Aircraft Type", type: "select", opts: ["Helicopter","Light Aircraft","Ultralight","Paraglider","Hang Glider","Drone"] },
      { key: "seats",       label: "Seats (excl. pilot)", type: "select", opts: ["1","2","3","4","5","6+"] },
      { key: "range",       label: "Range (km)",    type: "text",   placeholder: "e.g. 500" },
      { key: "pilot",       label: "Pilot incl.",   type: "check" },
      { key: "insurance",   label: "Insurance incl.",type: "check" },
    ],
    staff: [
      { key: "stype",       label: "Service Type",  type: "select", opts: ["Driver","Tour Guide","Photographer","Chef","DJ","Bodyguard","Nanny","Interpreter","Boat Captain"] },
      { key: "experience",  label: "Experience",    type: "select", opts: ["1–2 years","3–5 years","5–10 years","10+ years"] },
      { key: "languages",   label: "Languages",     type: "text",   placeholder: "e.g. EN, RU, ME" },
      { key: "en",          label: "English",       type: "check" },
      { key: "ru",          label: "Russian",       type: "check" },
      { key: "license",     label: "Licensed",      type: "check" },
    ],
  };

  const EMPTY_LISTING_FORM = {
    t: "", cat: "cars", city: "", p: "", desc: "",
    tags: "", img: "", imgs: [], status: "active",
    publishFrom: "", publishTo: "",
    specs: {}
  };

  function openNewListing() {
    setEditingListingId(null);
    setListingForm(EMPTY_LISTING_FORM);
    setListingFormOpen(true);
  }

  function openEditListing(listing) {
    setEditingListingId(listing.id);
    // Convert specs array [{l,v}] → flat object {key: value}
    const cat = listing.cat || "cars";
    const schema = CAT_SPECS[cat] || [];
    let specsObj = {};
    if (Array.isArray(listing.specs)) {
      listing.specs.forEach(s => {
        const field = schema.find(f => f.label === s.l || f.key === s.l);
        if (field) specsObj[field.key] = field.type === "check" ? (s.v === true || s.v === "true" || s.v === "Yes") : (s.v || "");
      });
    } else if (listing.specs && typeof listing.specs === "object") {
      specsObj = { ...listing.specs };
    }
    setListingForm({
      t: listing.t || "",
      cat,
      city: listing.city || "",
      p: listing.p != null ? String(listing.p) : "",
      desc: listing.desc || "",
      tags: Array.isArray(listing.tags) ? listing.tags.join(", ") : (listing.tags || ""),
      img: listing.img || "",
      imgs: Array.isArray(listing.imgs) ? listing.imgs : (listing.img ? [listing.img] : []),
      status: listing.status || "active",
      publishFrom: listing.publishFrom || "",
      publishTo: listing.publishTo || "",
      specs: specsObj
    });
    setListingFormOpen(true);
  }

  function closeListingForm() {
    setListingFormOpen(false);
    setEditingListingId(null);
    setListingForm(EMPTY_LISTING_FORM);
  }

  function saveListingForm() {
    const title = listingForm.t.trim();
    const price = parseFloat(listingForm.p);
    if (!title) { showToast("Title is required."); return; }
    if (isNaN(price) || price <= 0) { showToast("Enter a valid price."); return; }

    const tags = listingForm.tags
      ? listingForm.tags.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    // Convert specs object → array [{l, v}] for display compatibility
    const schema = CAT_SPECS[listingForm.cat] || [];
    const specsArr = schema
      .filter(f => f.type !== "check" ? !!listingForm.specs[f.key] : listingForm.specs[f.key])
      .map(f => ({
        l: f.label,
        v: f.type === "check" ? "Yes" : listingForm.specs[f.key]
      }));

    // Auto-build tags from checked options if tags empty
    const checkTags = schema
      .filter(f => f.type === "check" && listingForm.specs[f.key])
      .map(f => f.label.replace(" incl.", "").replace(" avail.", ""));
    const finalTags = tags.length ? tags : checkTags;

    const patch = {
      t: title, cat: listingForm.cat, city: listingForm.city, p: price,
      desc: listingForm.desc, tags: finalTags, img: listingForm.img,
      imgs: listingForm.imgs.length ? listingForm.imgs : (listingForm.img ? [listingForm.img] : []),
      status: listingForm.status, specs: specsArr,
      publishFrom: listingForm.publishFrom || null,
      publishTo: listingForm.publishTo || null
    };

    if (editingListingId != null) {
      setListings(current => current.map(l => l.id === editingListingId ? { ...l, ...patch } : l));
      showToast("Listing updated!");
    } else {
      const newListing = {
        id: Date.now(), ...patch,
        r: 0, rc: 0
      };
      setListings(current => [...current, newListing]);
      showToast("Listing created!");
    }
    closeListingForm();
  }

  function toggleListingStatus(id) {
    setListings(current =>
      current.map(l =>
        l.id === id ? { ...l, status: l.status === "active" ? "inactive" : "active" } : l
      )
    );
  }

  function deleteListingById(id) {
    if (!window.confirm("Delete this listing permanently?")) return;
    setListings(current => current.filter(l => l.id !== id));
    setFeatured(current => current.filter(f => f.id !== id));
    showToast("Listing deleted.");
  }

  function scheduleStatus(listing) {
    if (!listing.publishFrom && !listing.publishTo) return null;
    const now = new Date();
    const from = listing.publishFrom ? new Date(listing.publishFrom) : null;
    const to = listing.publishTo ? new Date(listing.publishTo) : null;
    if (from && now < from) return "scheduled";
    if (to && now > to) return "expired";
    return "live";
  }

  // ── Parser handlers (real API) ────────────────────────────────────────────
  const API = (typeof window !== "undefined" && window.__PARSER_API__) || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  async function loadSources() {
    try {
      const r = await fetch(`${API}/api/parser/sources/`);
      const data = await r.json();
      if (data.results) setParserSources(data.results);
    } catch { /* API offline — keep existing */ }
  }

  async function loadParserLog() {
    try {
      const r = await fetch(`${API}/api/parser/logs/?limit=50`);
      const data = await r.json();
      if (data.results) setParserLog(data.results.map(lg => ({
        id: lg.id, ts: lg.ts, source: lg.source, action: lg.action,
        status: lg.status, msg: lg.message,
      })));
    } catch { /* keep existing */ }
  }

  function openNewSource() {
    setParserEditId(null);
    setParserSourceForm({ ...EMPTY_SOURCE, fieldMap: { ...EMPTY_SOURCE.fieldMap }, dupCheck: { ...EMPTY_SOURCE.dupCheck } });
    setParserSourceTab("basic");
    setParserSourceFormOpen(true);
  }
  function openEditSource(src) {
    setParserEditId(src.id);
    setParserSourceForm({ ...src, fieldMap: { ...src.fieldMap }, dupCheck: { ...src.dupCheck } });
    setParserSourceTab("basic");
    setParserSourceFormOpen(true);
  }
  function closeSourceForm() { setParserSourceFormOpen(false); setParserEditId(null); }

  async function saveSourceForm() {
    const f = parserSourceForm;
    if (!f.name.trim() || !f.url.trim()) { showToast("Name and URL required."); return; }
    const payload = { name:f.name, url:f.url, category:f.category, method:f.method,
      status:f.status, moderation:f.moderation, interval:f.interval,
      customCron:f.customCron||"", fieldMap:f.fieldMap, dupCheck:f.dupCheck };
    try {
      if (parserEditId != null) {
        const r = await fetch(`${API}/api/parser/sources/${parserEditId}/`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
        const updated = await r.json();
        setParserSources(s => s.map(x => x.id === parserEditId ? updated : x));
      } else {
        const r = await fetch(`${API}/api/parser/sources/`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
        const created = await r.json();
        setParserSources(s => [...s, created]);
      }
      showToast(parserEditId != null ? "Source updated." : "Source added.");
    } catch {
      if (parserEditId != null) {
        setParserSources(s => s.map(x => x.id === parserEditId ? { ...x, ...f } : x));
      } else {
        setParserSources(s => [...s, { ...f, id: Date.now(), stats:{total:0,newToday:0,updated:0,errors:0,lastRun:null} }]);
      }
      showToast("Saved (offline mode).");
    }
    closeSourceForm();
  }

  async function deleteSource(id) {
    if (!window.confirm("Delete this source?")) return;
    try { await fetch(`${API}/api/parser/sources/${id}/`, { method:"DELETE" }); } catch {}
    setParserSources(s => s.filter(x => x.id !== id));
    showToast("Source deleted.");
  }

  async function toggleSourceStatus(id) {
    const src = parserSources.find(s => s.id === id);
    if (!src) return;
    const newStatus = src.status === "active" ? "disabled" : "active";
    try { await fetch(`${API}/api/parser/sources/${id}/`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status:newStatus}) }); } catch {}
    setParserSources(s => s.map(x => x.id === id ? { ...x, status: newStatus } : x));
  }

  async function runParser(sourceId) {
    const src = parserSources.find(s => s.id === sourceId);
    if (!src || parserRunning[sourceId]) return;
    setParserRunning(r => ({ ...r, [sourceId]: true }));
    const logId = Date.now();
    setParserLog(l => [{ id:logId, ts:new Date().toISOString(), source:src.name, action:"run", status:"running", msg:"Sending to worker…" }, ...l]);
    try {
      const r = await fetch(`${API}/api/parser/sources/${sourceId}/run/`, { method:"POST" });
      const data = await r.json();
      if (data.queued) {
        setParserLog(l => l.map(x => x.id === logId ? { ...x, status:"ok", msg:`Task queued. Results in a few seconds…` } : x));
        setTimeout(() => { loadSources(); loadParserLog(); }, 6000);
        setTimeout(() => { loadSources(); loadParserLog(); }, 15000);
      } else if (data.sync) {
        const { new: n, updated: u, errors: e } = data;
        setParserLog(l => l.map(x => x.id===logId ? { ...x, status:e?"warn":"ok", msg:`Imported ${n} new, ${u} updated, ${e} errors.` } : x));
        setParserSources(s => s.map(x => x.id===sourceId ? { ...x, stats:{...x.stats,newToday:n,updated:u,errors:e,lastRun:new Date().toISOString()} } : x));
        showToast(`Imported ${n} from ${src.name}.`);
      } else if (data.error) {
        setParserLog(l => l.map(x => x.id===logId ? { ...x, status:"error", msg:data.error } : x));
      }
    } catch (err) {
      setParserLog(l => l.map(x => x.id===logId ? { ...x, status:"error", msg:`Backend offline: ${err.message}` } : x));
      showToast("⚠ Backend offline. Run: docker-compose up");
    } finally {
      setParserRunning(r => ({ ...r, [sourceId]: false }));
    }
  }

  async function runAllSources() {
    try {
      await fetch(`${API}/api/parser/run-all/`, { method:"POST" });
      showToast("All active sources queued.");
      setTimeout(loadSources, 8000);
    } catch {
      showToast("⚠ Backend offline. Run: docker-compose up");
    }
  }

  async function checkSource(sourceId) {
    const src = parserSources.find(s => s.id === sourceId);
    if (!src) return;
    const key = `check_${sourceId}`;
    setParserRunning(r => ({...r, [key]:true}));
    const logId = Date.now();
    setParserLog(l => [{id:logId, ts:new Date().toISOString(), source:src.name, action:"check", status:"running", msg:"Checking reachability…"}, ...l]);
    try {
      const r = await fetch(`${API}/api/parser/sources/${sourceId}/check/`, { method:"POST" });
      const data = await r.json();
      const ok = data.ok !== false && data.status !== "error";
      setParserLog(l => l.map(x => x.id===logId ? { ...x, ts:new Date().toISOString(), status:ok?"ok":"error", msg:data.message||JSON.stringify(data) } : x));
    } catch (err) {
      setParserLog(l => l.map(x => x.id===logId ? { ...x, status:"error", msg:`Backend offline: ${err.message}` } : x));
    } finally {
      setParserRunning(r => ({...r, [key]:false}));
    }
  }

  const parserTotalStats = parserSources.reduce((a,s)=>({
    total:a.total+(s.stats?.total||0), newToday:a.newToday+(s.stats?.newToday||0),
    updated:a.updated+(s.stats?.updated||0), errors:a.errors+(s.stats?.errors||0)
  }),{total:0,newToday:0,updated:0,errors:0});

  return (
    <>
      <div
        className={`overlay ${loginOpen ? "show" : ""}`}
        id="login-overlay"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeLogin();
        }}
      >
        <div className="login-box">
          <div className="det" style={{ marginBottom: ".4rem" }}>
            RentHub
          </div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: ".25rem" }}>Sign In</h2>
          <div className="ediv" style={{ width: "60px", margin: ".75rem 0 1.75rem" }} />
          <form onSubmit={handleLoginSubmit}>
            <div className="fgrp">
              <span className="flbl">Email</span>
              <input
                ref={loginEmailRef}
                className="fi2"
                type="email"
                placeholder="you@renthub.com"
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            <div className="fgrp">
              <span className="flbl">Password</span>
              <input
                className="fi2"
                type="password"
                placeholder="••••••••"
                value={loginForm.pass}
                onChange={(event) => setLoginForm((current) => ({ ...current, pass: event.target.value }))}
              />
            </div>
            {loginError ? <div className="aerr">{loginError}</div> : null}
            <button
              className="btn bp"
              style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "1.25rem" }}
              type="submit"
            >
              Sign In →
            </button>
          </form>
          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--mfg)", marginTop: "1rem" }}>
            Demo: <strong>admin@renthub.com</strong> / <strong>admin123</strong>
          </p>
        </div>
      </div>

      <div
        className={`modal-wrap ${partnerModalOpen ? "show" : ""}`}
        id="add-partner-modal"
        onClick={(event) => {
          if (event.target === event.currentTarget) closePartnerModal();
        }}
      >
        <div className="modal-box">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem" }}>New Partner Account</h3>
            <button className="btn bg2 bxs" onClick={closePartnerModal} type="button">
              ✕
            </button>
          </div>
          <form onSubmit={savePartner}>
            <div className="grid-2" style={{ marginBottom: "1rem" }}>
              <div className="fgrp">
                <span className="flbl">Full Name</span>
                <input
                  ref={partnerNameRef}
                  className="fi2"
                  placeholder="John Smith"
                  value={partnerForm.name}
                  onChange={(event) => setPartnerForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="fgrp">
                <span className="flbl">Email</span>
                <input
                  className="fi2"
                  type="email"
                  placeholder="partner@example.com"
                  value={partnerForm.email}
                  onChange={(event) => setPartnerForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: "1rem" }}>
              <div className="fgrp">
                <span className="flbl">Password</span>
                <input
                  className="fi2"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={partnerForm.pass}
                  onChange={(event) => setPartnerForm((current) => ({ ...current, pass: event.target.value }))}
                />
              </div>
              <div className="fgrp">
                <span className="flbl">Role</span>
                <select
                  className="fi2"
                  value={partnerForm.role}
                  onChange={(event) => setPartnerForm((current) => ({ ...current, role: event.target.value }))}
                >
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="fgrp">
              <span className="flbl">Company / Business Name</span>
              <input
                className="fi2"
                placeholder="e.g. Luxury Cars LLC"
                value={partnerForm.company}
                onChange={(event) => setPartnerForm((current) => ({ ...current, company: event.target.value }))}
              />
            </div>
            {partnerError ? <div className="aerr">{partnerError}</div> : null}
            <div style={{ display: "flex", gap: ".75rem", marginTop: "1.5rem" }}>
              <button className="btn bp" style={{ flex: 1, justifyContent: "center" }} type="submit">
                Create Account
              </button>
              <button className="btn bg2" onClick={closePartnerModal} type="button">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={`toast ${toast ? "show" : ""}`} id="toast">
        {toast}
      </div>

      <nav>
        <div className="logo" onClick={() => go("home")}>
          RentHub
        </div>
        <div className="nav-r">
          <div className="nsw">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "var(--mfg)" }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input placeholder="Search anything..." />
          </div>
          <span className="nl" onClick={() => go("browse")}>
            Browse All
          </span>
          {!currentUser ? (
            <div id="nav-guest">
              <button className="btn bp bsm" onClick={openLogin}>
                Sign In
              </button>
            </div>
          ) : (
            <div id="nav-user">
              <div className="umenu">
                <button className="user-btn" id="uavatar" onClick={() => setUserMenuOpen((current) => !current)}>
                  {initials(currentUser.name)}
                </button>
                <div className={`umenu-drop ${userMenuOpen ? "show" : ""}`} id="umenu">
                  <div className="umenu-head">
                    <div className="user-btn" id="uavatar2" style={{ width: "34px", height: "34px", fontSize: "12px", pointerEvents: "none" }}>
                      {initials(currentUser.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>{currentUser.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--mfg)" }}>
                        {currentUser.role === "admin" ? "Administrator" : "Vendor Partner"}
                      </div>
                    </div>
                  </div>
                  <div className="umenu-item" onClick={() => go("dash")}>
                    📄 Dashboard
                  </div>
                  {currentUser.role === "admin" ? (
                    <div className="umenu-item" onClick={() => go("amod")}>
                      ⚙ Admin Panel
                    </div>
                  ) : null}
                  <div className="umenu-item" onClick={() => go("settings")}>
                    ⚙ Settings
                  </div>
                  <div className="umenu-sep" />
                  <div className="umenu-item danger" onClick={handleLogout}>
                    Sign Out
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className={`pg ${page === "home" ? "on" : ""}`} id="p-home">
        <div className="con">
          <section className="hero">
            <div className="hg">
              <div>
                <div className="det" style={{ marginBottom: ".5rem" }}>
                  Rental Marketplace
                </div>
                <h1 style={{ margin: ".4rem 0 1rem" }}>
                  Rent
                  <br />
                  Anything,
                  <br />
                  Anywhere
                </h1>
                <div className="ediv" style={{ width: "110px" }} />
                <p
                  style={{
                    color: "var(--mfg)",
                    fontSize: "1rem",
                    lineHeight: 1.75,
                    maxWidth: "400px",
                    margin: ".8rem 0 1.75rem"
                  }}
                >
                  From city cars to apartments, discover a carefully curated rental marketplace available
                  for instant booking.
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button className="btn bp" onClick={() => go("browse")}>
                    Explore Rentals →
                  </button>
                  <button className="btn bo" onClick={() => requireAuth("vendor")}>
                    List Your Rental
                  </button>
                </div>
              </div>
              <div className="hiw">
                <div className="hi">
                  <img
                    src="/images/hero-renthub.jpg"
                    alt="vehicle"
                  />
                </div>
                <div className="hbg">
                  <div className="hbl">Active Listings</div>
                  <div className="hbn">{activeListingCount}+</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="fstrip">
          <div className="con">
            <div className="fg4">
              {HOME_FEATURES.map((feature) => (
                <div key={feature.title}>
                  <div className="fi3">{feature.icon}</div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: ".35rem" }}>{feature.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--mfg)", lineHeight: 1.6 }}>{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="con">
          <section style={{ padding: "3.5rem 0" }}>
            <div className="det" style={{ marginBottom: ".4rem" }}>
              Categories
            </div>
            <h2 style={{ marginBottom: ".25rem" }}>Browse by Type</h2>
            <div className="ediv" style={{ width: "80px", margin: ".75rem 0 2rem" }} />
            <div className="cg">
              {CATEGORY_CARDS.map((category) => (
                <div className="cc" key={category.slug} onClick={() => go("browse", category.slug)}>
                  <div className="ci">{category.icon}</div>
                  <h3 style={{ fontSize: "1.15rem", marginBottom: ".3rem" }}>{category.title}</h3>
                  <p style={{ fontSize: "13px", color: "var(--mfg)" }}>{category.text}</p>
                  <div className="det" style={{ marginTop: "1rem" }}>
                    View Collection →
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ padding: "2.5rem 0" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div className="det" style={{ marginBottom: ".3rem" }}>
                  Featured
                </div>
                <h2 style={{ margin: 0 }}>Available Now</h2>
              </div>
              <button className="btn bo bsm" onClick={() => go("browse")}>
                View All
              </button>
            </div>
            <div className="vg3">
              {homeListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onOpen={openListing} />
              ))}
            </div>
          </section>

          <section style={{ padding: "2.5rem 0 5rem" }}>
            <div className="cta-b">
              <h2>Start earning from rentals</h2>
              <p>
                Join RentHub partners and earn income by renting out vehicles, apartments, or services.
                Listings are free, and you set the prices yourself.
              </p>
              <button
                className="btn"
                style={{ background: "var(--bg)", color: "var(--fg)", padding: "12px 32px" }}
                onClick={() => requireAuth("vendor")}
              >
                Become a Vendor
              </button>
            </div>
          </section>
        </div>

        <footer>
          <div className="con">
            <div className="fgd">
              <div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: ".5rem" }}>
                  RentHub
                </div>
                <p style={{ fontSize: "12px", color: "var(--mfg)" }}>Multi-vendor rental marketplace</p>
              </div>
              <div>
                <div className="det" style={{ marginBottom: ".85rem" }}>
                  Explore
                </div>
                <span className="fl" onClick={() => go("browse")}>
                  Browse All
                </span>
                <span className="fl" onClick={() => go("browse", "cars")}>
                  Cars
                </span>
                <span className="fl" onClick={() => go("browse", "boats")}>
                  Boats
                </span>
              </div>
              <div>
                <div className="det" style={{ marginBottom: ".85rem" }}>
                  For Vendors
                </div>
                <span className="fl" onClick={() => requireAuth("vendor")}>
                  List Your Rental
                </span>
                <span className="fl" onClick={() => requireAuth("dash")}>
                  Dashboard
                </span>
              </div>
              <div>
                <div className="det" style={{ marginBottom: ".85rem" }}>
                  Support
                </div>
                <span className="fl">Help Center</span>
                <span className="fl">Contact Us</span>
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                borderTop: "1px solid var(--bdr)",
                marginTop: "2.5rem",
                paddingTop: "1.5rem",
                fontSize: "12px",
                color: "var(--mfg)"
              }}
            >
              © 2026 RentHub. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
      <div className={`pg ${page === "browse" ? "on" : ""}`} id="p-browse">
        <div className="con">
          <div className="brl">
            <aside className="fp">
              <div style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.25rem" }}>
                Filters
              </div>
              <div style={{ marginBottom: "1.2rem" }}>
                <span className="flbl">Category</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  <span className={`chip ${!currentCategory ? "on" : ""}`} onClick={() => setCurrentCategory("")}>
                    All
                  </span>
                  {browseCategories.map((category) => (
                    <span
                      className={`chip ${currentCategory === category ? "on" : ""}`}
                      key={category}
                      onClick={() => setCurrentCategory(category)}
                    >
                      {categoryTitle(category)}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "1.1rem" }}>
                <span className="flbl">City</span>
                <input
                  className="fi2"
                  placeholder="Any city..."
                  value={browseFilters.city}
                  onChange={(event) =>
                    setBrowseFilters((current) => ({ ...current, city: event.target.value }))
                  }
                />
              </div>
              <div style={{ marginBottom: "1.1rem" }}>
                <span className="flbl">
                  Price/day: ${browseFilters.minPrice} - ${browseFilters.maxPrice}
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: ".5rem" }}>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={browseFilters.minPrice}
                    onChange={(event) =>
                      setBrowseFilters((current) => ({
                        ...current,
                        minPrice: Math.min(Number(event.target.value), current.maxPrice)
                      }))
                    }
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={browseFilters.maxPrice}
                    onChange={(event) =>
                      setBrowseFilters((current) => ({
                        ...current,
                        maxPrice: Math.max(Number(event.target.value), current.minPrice)
                      }))
                    }
                  />
                </div>
              </div>
              <div style={{ marginBottom: "1.2rem" }}>
                <span className="flbl">Keywords</span>
                <input
                  className="fi2"
                  placeholder="Search..."
                  value={browseFilters.text}
                  onChange={(event) =>
                    setBrowseFilters((current) => ({ ...current, text: event.target.value }))
                  }
                />
              </div>
              <FilterSection slug={currentCategory} />
              <button className="btn bg2 bsm" onClick={resetFilters} style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}>
                Reset Filters
              </button>
            </aside>

            <main>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: "1.5rem", marginBottom: ".2rem" }}>Rental Listings</h2>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--mfg)",
                      background: "var(--sec)",
                      padding: "3px 10px",
                      borderRadius: "2px"
                    }}
                  >
                    {browseListings.length} listing{browseListings.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <select
                  className="fi2"
                  style={{ width: "auto" }}
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value)}
                >
                  <option value="">Default</option>
                  <option value="pa">Price ↑</option>
                  <option value="pd">Price ↓</option>
                  <option value="az">A-Z</option>
                </select>
              </div>
              <div className="vg4">
                {browseListings.length ? (
                  browseListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} onOpen={openListing} />
                  ))
                ) : (
                  <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                    No results found.
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      <div className={`pg ${page === "detail" ? "on" : ""}`} id="p-detail">
        <div className="con" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
          <button className="btn bg2 bsm" style={{ marginBottom: "2rem" }} onClick={goBack}>
            ← Back
          </button>
          {currentListing ? (
            <div className="dg">
              <div>
                <div className="miw">
                  {detailImage ? <img src={detailImage} alt={currentListing.t} /> : <span>🚗</span>}
                </div>
                <div className="ths">
                  {currentImages.map((image, index) => (
                    <div
                      className={`th ${detailImage === image ? "on" : ""}`}
                      key={`${image}-${index}`}
                      onClick={() => setDetailImage(image)}
                    >
                      {image ? <img src={image} alt="" /> : <span>📷</span>}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "2rem" }}>
                  <div className="det">About this listing</div>
                  <p style={{ marginTop: ".75rem", lineHeight: 1.8, color: "var(--mfg)", fontSize: ".95rem" }}>
                    {currentListing.desc}
                  </p>
                  <div className="det" style={{ marginTop: "1.75rem", marginBottom: ".75rem" }}>
                    Specs
                  </div>
                  <div className="sgrid">
                    {currentListing.specs.map((spec) => (
                      <div className="sp" key={spec.l}>
                        <div className="spl">{spec.l}</div>
                        <div className="spv">{spec.v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="det" style={{ marginTop: "1.5rem", marginBottom: ".75rem" }}>
                    What&apos;s included
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {currentListing.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: "2rem" }}>
                  <div className="det" style={{ marginBottom: "1rem" }}>
                    Reviews
                  </div>
                  <div>
                    {DETAIL_REVIEWS.map((review) => (
                      <div key={`${review.n}-${review.d}`} style={{ borderTop: "1px solid var(--bdr)", padding: ".85rem 0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".3rem", gap: "1rem" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600 }}>{review.n}</span>
                          <span style={{ fontSize: "11px", color: "var(--mfg)" }}>{review.d}</span>
                        </div>
                        <div className="stars" style={{ fontSize: "13px", marginBottom: ".3rem" }}>
                          {stars(review.r)}
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--mfg)", lineHeight: 1.6 }}>{review.txt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="bcard" style={{ position: "sticky", top: "90px" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 700 }}>
                    ${currentListing.p}
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: ".9rem", fontWeight: 400, color: "var(--mfg)" }}>
                      /day
                    </span>
                  </div>
                  <div className="det" style={{ margin: ".4rem 0 1rem" }}>
                    {currentListing.city}
                  </div>
                  <div className="ediv" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem", margin: "1rem 0" }}>
                    <div className="bf">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={detailDates.start}
                        onChange={(event) =>
                          setDetailDates((current) => ({ ...current, start: event.target.value }))
                        }
                      />
                    </div>
                    <div className="bf">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={detailDates.end}
                        onChange={(event) =>
                          setDetailDates((current) => ({ ...current, end: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                  {bookingDays > 0 ? (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: ".6rem 0",
                          borderTop: "1px solid var(--bdr)",
                          fontSize: "13px"
                        }}
                      >
                        <span style={{ color: "var(--mfg)" }}>Rental days</span>
                        <span style={{ fontWeight: 600 }}>
                          {bookingDays} day{bookingDays !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: ".6rem 0", borderTop: "1px solid var(--bdr)" }}>
                        <span style={{ fontWeight: 600 }}>Total</span>
                        <span style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", fontWeight: 700 }}>
                          ${bookingTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  <button className="btn bp" style={{ width: "100%", padding: "13px", marginTop: ".75rem", justifyContent: "center" }} onClick={handleBookNow}>
                    Book Now
                  </button>
                  {showBooked ? (
                    <div className="aok" style={{ marginTop: ".75rem" }}>
                      ✓ Booking request sent! The owner will contact you within 2 hours.
                    </div>
                  ) : null}
                  <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", color: "var(--mfg)" }}>✓ Free cancellation</span>
                    <span style={{ fontSize: "11px", color: "var(--mfg)" }}>✓ Insurance included</span>
                  </div>
                </div>

                <div className="bcard" style={{ marginTop: "1rem" }}>
                  <div className="det" style={{ marginBottom: ".75rem" }}>
                    Rating & Reviews
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", fontWeight: 700 }}>
                      {currentListing.r.toFixed(1)}
                    </div>
                    <div>
                      <div className="stars" style={{ fontSize: "1.3rem" }}>
                        {stars(currentListing.r)}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--mfg)" }}>{currentListing.rc} reviews</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={`pg ${page === "dash" ? "on" : ""}`} id="p-dash">
        <div className="con">
          <div style={{ padding: "3rem 0 1.5rem" }}>
            <div className="det" style={{ marginBottom: ".3rem" }}>
              Welcome back
            </div>
            <h2 style={{ marginBottom: ".25rem" }}>{currentUser?.name || ""}</h2>
            <div className="ediv" style={{ width: "80px" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
            <div className="sc">
              <div className="sl">📄 Total Bookings</div>
              <div className="sv">7</div>
            </div>
            <div className="sc">
              <div className="sl">❤ Favorites</div>
              <div className="sv">12</div>
            </div>
            <div className="sc">
              <div className="sl">📅 Member Since</div>
              <div className="sv" style={{ fontSize: "1.25rem" }}>
                Jan 2025
              </div>
            </div>
          </div>
          <div className="tlist">
            <button className={`tab ${dashTab === "bookings" ? "on" : ""}`} onClick={() => setDashTab("bookings")}>
              📄 My Bookings
            </button>
            <button className={`tab ${dashTab === "favorites" ? "on" : ""}`} onClick={() => setDashTab("favorites")}>
              ❤ Favorites
            </button>
          </div>
          {dashTab === "bookings" ? (
            <div>
              <div className="br2">
                <div>
                  <div style={{ fontWeight: 600, marginBottom: ".25rem" }}>Booking #2041</div>
                  <div style={{ fontSize: "13px", color: "var(--mfg)" }}>Apr 10-14, 2026 · Tesla Model 3</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap" }}>
                  <span className="pill pc">✓ Confirmed</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", fontWeight: 700 }}>$356</span>
                </div>
              </div>
              <div className="br2">
                <div>
                  <div style={{ fontWeight: 600, marginBottom: ".25rem" }}>Booking #1987</div>
                  <div style={{ fontSize: "13px", color: "var(--mfg)" }}>Mar 1-3, 2026 · Ducati Panigale</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap" }}>
                  <span className="pill pa">✓ Completed</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", fontWeight: 700 }}>$240</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="vg3">
              {listings.slice(0, 3).map((listing) => (
                <ListingCard key={listing.id} listing={listing} onOpen={openListing} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`pg ${page === "vendor" ? "on" : ""}`} id="p-vendor">
        <div className="con" style={{ padding: "3.5rem 2rem", maxWidth: "640px", margin: "0 auto" }}>
          <div className="det" style={{ marginBottom: ".4rem" }}>
            For Vendors
          </div>
          <h2 style={{ marginBottom: ".25rem" }}>List Your Rental</h2>
          <div className="ediv" style={{ width: "80px", margin: ".75rem 0 2rem" }} />
          <form
            onSubmit={(event) => {
              event.preventDefault();
              showToast("Listing submitted for review!");
            }}
          >
            <div style={{ display: "grid", gap: ".85rem" }}>
              <div className="bf">
                <label>Listing Title</label>
                <input placeholder="e.g. Toyota Camry 2023" />
              </div>
              <div className="bf">
                <label>Category</label>
                <input placeholder="Car, motorcycle, yacht..." />
              </div>
              <div className="bf">
                <label>City</label>
                <input placeholder="New York, Podgorica, Dubai..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".85rem" }}>
                <div className="bf">
                  <label>Price per day ($)</label>
                  <input type="number" placeholder="99" />
                </div>
                <div className="bf">
                  <label>Deposit ($)</label>
                  <input type="number" placeholder="500" />
                </div>
              </div>
              <div className="bf">
                <label>Description</label>
                <textarea style={{ resize: "vertical", minHeight: "90px" }} placeholder="Describe your vehicle or property..." />
              </div>
            </div>
            <button className="btn bp" style={{ marginTop: "1.5rem", padding: "12px 32px" }} type="submit">
              Submit for Review
            </button>
          </form>
        </div>
      </div>
      <div className={`pg ${page === "amod" ? "on" : ""}`} id="p-amod">
        <div className="alay">
          <AdminSidebar page={page} unreadCount={unreadCount} onGo={go} />
          <div className="ac">
            <div className="det" style={{ marginBottom: ".35rem" }}>
              Admin Panel
            </div>
            <h2 style={{ marginBottom: ".25rem" }}>Listing Moderation</h2>
            <div className="ediv" style={{ width: "80px", margin: ".75rem 0 1.75rem" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
              <div className="sc">
                <div className="sl" style={{ color: "#7a5a00" }}>
                  ⏱ Pending
                </div>
                <div className="sv">{moderation.p.length}</div>
              </div>
              <div className="sc">
                <div className="sl" style={{ color: "#2a5a2a" }}>
                  ✓ Active
                </div>
                <div className="sv">{moderation.a.length}</div>
              </div>
              <div className="sc">
                <div className="sl" style={{ color: "#7a2a2a" }}>
                  ✗ Rejected
                </div>
                <div className="sv">{moderation.r.length}</div>
              </div>
            </div>
            <div className="tlist" id="mod-tabs">
              <button className={`tab ${modTab === "pending" ? "on" : ""}`} onClick={() => setModTab("pending")}>
                ⏱ Pending ({moderation.p.length})
              </button>
              <button className={`tab ${modTab === "active" ? "on" : ""}`} onClick={() => setModTab("active")}>
                ✓ Active ({moderation.a.length})
              </button>
              <button className={`tab ${modTab === "rejected" ? "on" : ""}`} onClick={() => setModTab("rejected")}>
                ✗ Rejected ({moderation.r.length})
              </button>
            </div>
            {modTab === "pending" ? (
              moderation.p.length ? (
                moderation.p.map((listing) => (
                  <ModerationCard
                    key={listing.id}
                    listing={listing}
                    showActions
                    showReason={false}
                    onApprove={handleApproveListing}
                    onReject={handleRejectListing}
                    onDelete={() => handleDeleteListing(listing.id, "p")}
                  />
                ))
              ) : (
                <div className="empty-state">✓ No listings pending review.</div>
              )
            ) : null}
            {modTab === "active" ? (
              moderation.a.length ? (
                moderation.a.map((listing) => (
                  <ModerationCard
                    key={listing.id}
                    listing={listing}
                    showActions={false}
                    showReason={false}
                    onApprove={() => {}}
                    onReject={() => {}}
                    onDelete={() => handleDeleteListing(listing.id, "a")}
                  />
                ))
              ) : (
                <div className="empty-state">No active listings.</div>
              )
            ) : null}
            {modTab === "rejected" ? (
              moderation.r.length ? (
                moderation.r.map((listing) => (
                  <ModerationCard
                    key={listing.id}
                    listing={listing}
                    showActions={false}
                    showReason
                    onApprove={() => {}}
                    onReject={() => {}}
                    onDelete={() => handleDeleteListing(listing.id, "r")}
                  />
                ))
              ) : (
                <div className="empty-state">No rejected listings.</div>
              )
            ) : null}
          </div>
        </div>
      </div>

      <div className={`pg ${page === "afeat" ? "on" : ""}`} id="p-afeat">
        <div className="alay">
          <AdminSidebar page={page} unreadCount={unreadCount} onGo={go} />
          <div className="ac">
            <div className="det" style={{ marginBottom: ".35rem" }}>
              Admin Panel
            </div>
            <h2 style={{ marginBottom: ".25rem" }}>Manage Featured</h2>
            <div className="ediv" style={{ width: "80px", margin: ".75rem 0 1.75rem" }} />
            <div className="card" style={{ marginBottom: "1.75rem", padding: "1.25rem" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: ".75rem", color: "var(--mfg)" }}>
                Add to Featured
              </div>
              <div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
                <select
                  className="fi2"
                  style={{ flex: 1 }}
                  value={featureSelectId}
                  onChange={(event) => setFeatureSelectId(event.target.value)}
                >
                  <option value="">Select a listing...</option>
                  {featureOptions.map((listing) => (
                    <option key={listing.id} value={listing.id}>
                      {listing.t} — ${listing.p}/day
                    </option>
                  ))}
                </select>
                <button className="btn bp bsm" onClick={addFeatured}>
                  + Add
                </button>
              </div>
            </div>
            <div className="card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid var(--bdr)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--mfg)",
                  textTransform: "uppercase",
                  letterSpacing: ".08em"
                }}
              >
                Currently Featured
              </div>
              {featured.length ? (
                featured.map((item, index) => (
                  <div className="fitem" key={`${item.id}-${index}`}>
                    <div className="fimg">
                      {item.img ? <img src={item.img} alt="" /> : <span className="icon-fallback">🚗</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: ".2rem" }}>{item.t}</div>
                      <div style={{ fontSize: "12px", color: "var(--mfg)" }}>
                        {item.city} · ${item.p}/day
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: ".4rem" }}>
                      <button className="btn bg2 bxs" disabled={index === 0} onClick={() => moveFeatured(index, -1)}>
                        ↑
                      </button>
                      <button
                        className="btn bg2 bxs"
                        disabled={index === featured.length - 1}
                        onClick={() => moveFeatured(index, 1)}
                      >
                        ↓
                      </button>
                      <button className="btn bd bxs" onClick={() => removeFeatured(index)}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No featured listings yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`pg ${page === "anotif" ? "on" : ""}`} id="p-anotif">
        <div className="alay">
          <AdminSidebar page={page} unreadCount={unreadCount} onGo={go} />
          <div className="ac">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div className="det" style={{ marginBottom: ".35rem" }}>
                  Admin Panel
                </div>
                <h2>Notifications</h2>
              </div>
              <div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
                <button className="btn bg2 bsm" onClick={markAllNotifications}>
                  Mark all as read
                </button>
                <div className="tlist" style={{ margin: 0 }}>
                  <button className={`tab ${notifFilter === "all" ? "on" : ""}`} onClick={() => setNotifFilter("all")}>
                    All
                  </button>
                  <button className={`tab ${notifFilter === "unread" ? "on" : ""}`} onClick={() => setNotifFilter("unread")}>
                    Unread
                  </button>
                </div>
              </div>
            </div>
            <div className="card" style={{ overflow: "hidden" }}>
              {filteredNotifications.length ? (
                filteredNotifications.map((notification) => (
                  <div
                    className={`ni ${notification.read ? "" : "unread"}`}
                    key={notification.id}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <span style={{ fontSize: "16px", flexShrink: 0 }}>
                      {NOTIFICATION_ICONS[notification.type] || "🔔"}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".25rem", gap: ".5rem" }}>
                        <span style={{ fontSize: "13px", fontWeight: notification.read ? 500 : 600 }}>
                          {notification.title}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--mfg)" }}>{notification.time}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--mfg)", lineHeight: 1.5 }}>{notification.msg}</p>
                    </div>
                    {!notification.read ? <div className="nd" /> : null}
                  </div>
                ))
              ) : (
                <div className="empty-state">No notifications.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Listing Manager ────────────────────────────────────────────── */}
      <div className={`pg ${page === "alisting" ? "on" : ""}`} id="p-alisting">
        <div className="alay">
          <AdminSidebar page={page} unreadCount={unreadCount} onGo={go} />
          <div className="ac">

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div className="det" style={{ marginBottom: ".35rem" }}>Admin Panel</div>
                <h2>Listing Manager</h2>
              </div>
              <button className="btn bp" onClick={openNewListing}>+ New Listing</button>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
              <div className="sc">
                <div className="sl" style={{ color: "#2a5a2a" }}>✓ Active</div>
                <div className="sv">{listings.filter(l => l.status === "active").length}</div>
              </div>
              <div className="sc">
                <div className="sl" style={{ color: "#7a5a00" }}>⊘ Inactive</div>
                <div className="sv">{listings.filter(l => l.status !== "active").length}</div>
              </div>
              <div className="sc">
                <div className="sl" style={{ color: "var(--mfg)" }}>∑ Total</div>
                <div className="sv">{listings.length}</div>
              </div>
            </div>

            {/* Search + tabs */}
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
              <input
                className="fi2"
                style={{ flex: 1, minWidth: "180px" }}
                placeholder="Search by title or city…"
                value={listingSearch}
                onChange={e => setListingSearch(e.target.value)}
              />
            </div>
            <div className="tlist" style={{ marginBottom: "1.5rem" }}>
              {["all", "active", "inactive", "scheduled"].map(tab => (
                <button key={tab} className={`tab ${listingMgrTab === tab ? "on" : ""}`} onClick={() => setListingMgrTab(tab)}>
                  {tab === "all" ? "All" : tab === "active" ? "✓ Active" : tab === "inactive" ? "⊘ Inactive" : "⏱ Scheduled"}
                </button>
              ))}
            </div>

            {/* Listings table */}
            {(() => {
              const q = listingSearch.trim().toLowerCase();
              const filtered = listings.filter(l => {
                if (q && !`${l.t} ${l.city}`.toLowerCase().includes(q)) return false;
                const sched = scheduleStatus(l);
                if (listingMgrTab === "active") return l.status === "active";
                if (listingMgrTab === "inactive") return l.status !== "active";
                if (listingMgrTab === "scheduled") return sched === "scheduled" || sched === "live";
                return true;
              });

              if (!filtered.length) return (
                <div className="empty-state">No listings found.</div>
              );

              return filtered.map(listing => {
                const sched = scheduleStatus(listing);
                return (
                  <div key={listing.id} className="mc" style={{ marginBottom: "1rem" }}>
                    <div className="mi2">
                      <div className="mimg" style={{ flexShrink: 0 }}>
                        {listing.img
                          ? <img src={listing.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <span className="icon-fallback">📦</span>}
                      </div>
                      <div className="mb2" style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem", flexWrap: "wrap" }}>
                          <div>
                            <h3 style={{ fontSize: "1rem", marginBottom: ".2rem" }}>{listing.t}</h3>
                            <p style={{ fontSize: "12px", color: "var(--mfg)", marginBottom: ".3rem" }}>
                              {listing.city} · <strong>${listing.p}</strong>/day · <span style={{ textTransform: "capitalize" }}>{listing.cat}</span>
                            </p>
                          </div>
                          {/* Status badge */}
                          <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{
                              fontSize: "11px", padding: "2px 10px", borderRadius: "10px", fontWeight: 600,
                              background: listing.status === "active" ? "#1a3a1a" : "#2a2a1a",
                              color: listing.status === "active" ? "#6ddb6d" : "#c0a020",
                              border: `1px solid ${listing.status === "active" ? "#2a5a2a" : "#5a4a10"}`
                            }}>
                              {listing.status === "active" ? "✓ Active" : "⊘ Inactive"}
                            </span>
                            {sched && (
                              <span style={{
                                fontSize: "11px", padding: "2px 10px", borderRadius: "10px", fontWeight: 600,
                                background: sched === "live" ? "#0a2a3a" : sched === "scheduled" ? "#1a1a3a" : "#2a1a1a",
                                color: sched === "live" ? "#4ab8e8" : sched === "scheduled" ? "#9090e8" : "#e86060",
                                border: `1px solid ${sched === "live" ? "#1a5a7a" : sched === "scheduled" ? "#3a3a7a" : "#6a2a2a"}`
                              }}>
                                {sched === "live" ? "⏱ Live window" : sched === "scheduled" ? "⏱ Scheduled" : "⏱ Expired"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Schedule display */}
                        {(listing.publishFrom || listing.publishTo) && (
                          <div style={{ fontSize: "11px", color: "var(--mfg)", marginBottom: ".4rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                            {listing.publishFrom && <span>📅 From: {new Date(listing.publishFrom).toLocaleString()}</span>}
                            {listing.publishTo && <span>📅 To: {new Date(listing.publishTo).toLocaleString()}</span>}
                          </div>
                        )}

                        {listing.desc && (
                          <p style={{ fontSize: "12px", color: "var(--mfg)", lineHeight: 1.5, marginBottom: ".5rem" }}>
                            {listing.desc.slice(0, 120)}{listing.desc.length > 120 ? "…" : ""}
                          </p>
                        )}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".5rem" }}>
                          <button className="btn bg2 bxs" onClick={() => openEditListing(listing)}>✏ Edit</button>
                          <button
                            className="btn bg2 bxs"
                            onClick={() => toggleListingStatus(listing.id)}
                            style={{ color: listing.status === "active" ? "#c0a020" : "#6ddb6d" }}
                          >
                            {listing.status === "active" ? "⊘ Unpublish" : "✓ Publish"}
                          </button>
                          <button className="btn bd bxs" onClick={() => deleteListingById(listing.id)}>🗑 Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* ── Listing Form Modal ─────────────────────────────────────────── */}
      <div
        className={`overlay ${listingFormOpen ? "show" : ""}`}
        onClick={e => { if (e.target === e.currentTarget) closeListingForm(); }}
        style={{ zIndex: 1100 }}
      >
        <div className="login-box" style={{ maxWidth: "620px", width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
          <div className="det" style={{ marginBottom: ".4rem" }}>Admin Panel</div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: ".25rem" }}>
            {editingListingId != null ? "Edit Listing" : "New Listing"}
          </h2>
          <div className="ediv" style={{ width: "60px", margin: ".75rem 0 1.5rem" }} />

          <div style={{ display: "grid", gap: "1.1rem" }}>

            {/* Title */}
            <div className="fgrp">
              <span className="flbl">Title *</span>
              <input className="fi2" placeholder="e.g. Tesla Model 3 Long Range"
                value={listingForm.t}
                onChange={e => setListingForm(f => ({ ...f, t: e.target.value }))} />
            </div>

            {/* Category + City */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="fgrp">
                <span className="flbl">Category</span>
                <select className="fi2" value={listingForm.cat}
                  onChange={e => setListingForm(f => ({ ...f, cat: e.target.value, specs: {} }))}>
                  {[
                    ["cars","🚗 Cars"],["motorcycles","🏍 Motorcycles"],["boats","⛵ Boats"],
                    ["apartments","🏡 Apartments"],["bicycles","🚲 Bicycles"],
                    ["robots","🤖 Robots"],["aircraft","✈️ Aircraft"],["staff","👤 Staff & Services"]
                  ].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="fgrp">
                <span className="flbl">City</span>
                <input className="fi2" placeholder="e.g. Budva"
                  value={listingForm.city}
                  onChange={e => setListingForm(f => ({ ...f, city: e.target.value }))} />
              </div>
            </div>

            {/* Price + Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="fgrp">
                <span className="flbl">Price / day ($) *</span>
                <input className="fi2" type="number" min="1" placeholder="0"
                  value={listingForm.p}
                  onChange={e => setListingForm(f => ({ ...f, p: e.target.value }))} />
              </div>
              <div className="fgrp">
                <span className="flbl">Status</span>
                <select className="fi2" value={listingForm.status}
                  onChange={e => setListingForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Dynamic category specs */}
            {(() => {
              const schema = CAT_SPECS[listingForm.cat] || [];
              if (!schema.length) return null;
              const selects = schema.filter(f => f.type === "select");
              const texts   = schema.filter(f => f.type === "text");
              const checks  = schema.filter(f => f.type === "check");
              const catIcons = {cars:"🚗",motorcycles:"🏍",boats:"⛵",apartments:"🏡",bicycles:"🚲",robots:"🤖",aircraft:"✈️",staff:"👤"};
              const catLabels = {cars:"Car Details",motorcycles:"Motorcycle Details",boats:"Vessel Details",apartments:"Apartment Details",bicycles:"Bicycle Details",robots:"Robot Details",aircraft:"Aircraft Details",staff:"Service Details"};
              return (
                <div style={{ border: "1px solid var(--bdr)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ background: "var(--abg)", padding: ".75rem 1rem", display: "flex", alignItems: "center", gap: ".5rem", borderBottom: "1px solid var(--bdr)" }}>
                    <span style={{ fontSize: "15px" }}>{catIcons[listingForm.cat]}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{catLabels[listingForm.cat]}</span>
                  </div>
                  <div style={{ padding: "1rem", display: "grid", gap: "1rem" }}>
                    {selects.length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: ".75rem" }}>
                        {selects.map(f => (
                          <div className="fgrp" key={f.key} style={{ margin: 0 }}>
                            <span className="flbl">{f.label}</span>
                            <select className="fi2"
                              value={listingForm.specs[f.key] || ""}
                              onChange={e => setListingForm(fr => ({ ...fr, specs: { ...fr.specs, [f.key]: e.target.value } }))}>
                              <option value="">— any —</option>
                              {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                    {texts.length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: ".75rem" }}>
                        {texts.map(f => (
                          <div className="fgrp" key={f.key} style={{ margin: 0 }}>
                            <span className="flbl">{f.label}</span>
                            <input className="fi2" placeholder={f.placeholder || ""}
                              value={listingForm.specs[f.key] || ""}
                              onChange={e => setListingForm(fr => ({ ...fr, specs: { ...fr.specs, [f.key]: e.target.value } }))} />
                          </div>
                        ))}
                      </div>
                    )}
                    {checks.length > 0 && (
                      <div>
                        <span className="flbl" style={{ display: "block", marginBottom: ".5rem" }}>Included / Options</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
                          {checks.map(f => {
                            const on = !!listingForm.specs[f.key];
                            return (
                              <button key={f.key} type="button"
                                onClick={() => setListingForm(fr => ({ ...fr, specs: { ...fr.specs, [f.key]: !fr.specs[f.key] } }))}
                                style={{
                                  fontSize: "12px", padding: "5px 12px", borderRadius: "20px", cursor: "pointer",
                                  border: `1px solid ${on ? "var(--acc)" : "var(--bdr)"}`,
                                  background: on ? "var(--acc)" : "transparent",
                                  color: on ? "var(--afg)" : "var(--fg)",
                                  fontWeight: on ? 600 : 400,
                                  transition: "all .15s"
                                }}>
                                {on ? "✓ " : ""}{f.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Description */}
            <div className="fgrp">
              <span className="flbl">Description</span>
              <textarea className="fi2" rows={3} placeholder="Short description…"
                style={{ resize: "vertical" }}
                value={listingForm.desc}
                onChange={e => setListingForm(f => ({ ...f, desc: e.target.value }))} />
            </div>

            {/* Tags */}
            <div className="fgrp">
              <span className="flbl">Tags <span style={{ fontWeight: 400, color: "var(--mfg)" }}>(comma-separated; auto-filled from options if empty)</span></span>
              <input className="fi2" placeholder="e.g. Pool, Wi-Fi, A/C"
                value={listingForm.tags}
                onChange={e => setListingForm(f => ({ ...f, tags: e.target.value }))} />
            </div>

            {/* ── Photo Manager ── */}
            <div className="fgrp">
              <span className="flbl">
                Photos
                {listingForm.imgs.length > 0 && (
                  <span style={{ fontWeight: 400, color: "var(--mfg)", marginLeft: ".5rem" }}>
                    {listingForm.imgs.length} photo{listingForm.imgs.length > 1 ? "s" : ""} · drag to reorder · first = cover
                  </span>
                )}
              </span>

              {/* Thumbnail grid with drag-reorder */}
              {listingForm.imgs.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: ".6rem", marginBottom: ".75rem" }}>
                  {listingForm.imgs.map((src, idx) => (
                    <div key={idx}
                      draggable
                      onDragStart={e => { e.dataTransfer.setData("photoIdx", String(idx)); e.currentTarget.style.opacity = ".5"; }}
                      onDragEnd={e => { e.currentTarget.style.opacity = "1"; }}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.outline = "2px solid var(--acc)"; }}
                      onDragLeave={e => { e.currentTarget.style.outline = "none"; }}
                      onDrop={e => {
                        e.preventDefault();
                        e.currentTarget.style.outline = "none";
                        const from = parseInt(e.dataTransfer.getData("photoIdx"), 10);
                        if (isNaN(from) || from === idx) return;
                        setListingForm(f => {
                          const arr = [...f.imgs];
                          const [moved] = arr.splice(from, 1);
                          arr.splice(idx, 0, moved);
                          return { ...f, imgs: arr, img: arr[0] };
                        });
                      }}
                      style={{
                        position: "relative", borderRadius: "8px", overflow: "hidden",
                        border: idx === 0 ? "2px solid var(--acc)" : "2px solid var(--bdr)",
                        cursor: "grab", aspectRatio: "4/3", background: "var(--abg)",
                        transition: "border-color .15s, opacity .15s"
                      }}>
                      <img src={src} alt=""
                        onError={e => { e.target.style.display = "none"; }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />

                      {/* Cover badge */}
                      {idx === 0 && (
                        <div style={{
                          position: "absolute", top: "5px", left: "5px",
                          background: "var(--acc)", color: "var(--afg)",
                          fontSize: "9px", fontWeight: 700, padding: "2px 6px",
                          borderRadius: "4px", letterSpacing: ".04em", pointerEvents: "none"
                        }}>COVER</div>
                      )}

                      {/* Set as cover (hover, non-first) */}
                      {idx !== 0 && (
                        <div
                          className="photo-hover-btn"
                          onClick={() => setListingForm(f => {
                            const arr = [...f.imgs];
                            const [item] = arr.splice(idx, 1);
                            arr.unshift(item);
                            return { ...f, imgs: arr, img: arr[0] };
                          })}
                          style={{
                            position: "absolute", bottom: "5px", left: "5px",
                            background: "rgba(0,0,0,.72)", color: "#fff",
                            borderRadius: "4px", fontSize: "10px", padding: "3px 7px",
                            cursor: "pointer", opacity: 0, transition: "opacity .15s",
                            whiteSpace: "nowrap"
                          }}>⭐ Cover</div>
                      )}

                      {/* Delete */}
                      <button type="button"
                        onClick={() => setListingForm(f => {
                          const arr = f.imgs.filter((_, i) => i !== idx);
                          return { ...f, imgs: arr, img: arr[0] || "" };
                        })}
                        style={{
                          position: "absolute", top: "5px", right: "5px",
                          background: "rgba(0,0,0,.65)", color: "#fff", border: "none",
                          borderRadius: "50%", width: "22px", height: "22px",
                          cursor: "pointer", fontSize: "12px", lineHeight: "22px",
                          textAlign: "center", padding: 0, display: "flex",
                          alignItems: "center", justifyContent: "center"
                        }}>✕</button>

                      {/* Drag grip */}
                      <div style={{
                        position: "absolute", bottom: "5px", right: "6px",
                        fontSize: "12px", color: "rgba(255,255,255,.4)",
                        pointerEvents: "none", lineHeight: 1
                      }}>⠿</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Drop zone */}
              <label
                onDragOver={e => {
                  if (e.dataTransfer.getData && e.dataTransfer.types.includes("Files")) {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "var(--acc)";
                    e.currentTarget.style.background = "rgba(255,255,255,.03)";
                  }
                }}
                onDragLeave={e => { e.currentTarget.style.borderColor = "var(--bdr)"; e.currentTarget.style.background = "transparent"; }}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = "var(--bdr)";
                  e.currentTarget.style.background = "transparent";
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                  if (!files.length) return;
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = ev => setListingForm(f => {
                      const arr = [...f.imgs, ev.target.result];
                      return { ...f, imgs: arr, img: arr[0] };
                    });
                    reader.readAsDataURL(file);
                  });
                }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: ".4rem", padding: "1.1rem 1rem", borderRadius: "8px",
                  border: "2px dashed var(--bdr)", cursor: "pointer",
                  transition: "border-color .2s, background .2s", marginBottom: ".5rem"
                }}>
                <input type="file" accept="image/*" multiple style={{ display: "none" }}
                  onChange={e => {
                    Array.from(e.target.files).forEach(file => {
                      const reader = new FileReader();
                      reader.onload = ev => setListingForm(f => {
                        const arr = [...f.imgs, ev.target.result];
                        return { ...f, imgs: arr, img: arr[0] };
                      });
                      reader.readAsDataURL(file);
                    });
                    e.target.value = "";
                  }} />
                <span style={{ fontSize: "20px" }}>＋🖼</span>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>
                  {listingForm.imgs.length ? "Add more photos" : "Drag & drop photos here"}
                </span>
                <span style={{ fontSize: "11px", color: "var(--mfg)" }}>or click to choose · multiple files · JPG PNG WEBP</span>
              </label>

              {/* URL add */}
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".1rem" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--bdr)" }} />
                <span style={{ fontSize: "11px", color: "var(--mfg)", whiteSpace: "nowrap" }}>or add by URL</span>
                <div style={{ flex: 1, height: "1px", background: "var(--bdr)" }} />
              </div>
              <div style={{ display: "flex", gap: ".5rem", marginTop: ".5rem" }}>
                <input className="fi2" placeholder="https://… or /images/listings/photo.jpg"
                  style={{ flex: 1 }} id="photo-url-input"
                  onKeyDown={e => {
                    if (e.key !== "Enter") return;
                    const val = e.target.value.trim();
                    if (!val) return;
                    setListingForm(f => { const arr = [...f.imgs, val]; return { ...f, imgs: arr, img: arr[0] }; });
                    e.target.value = "";
                  }} />
                <button type="button" className="btn bg2" style={{ padding: "0 1rem", flexShrink: 0 }}
                  onClick={() => {
                    const inp = document.getElementById("photo-url-input");
                    const val = inp?.value.trim();
                    if (!val) return;
                    setListingForm(f => { const arr = [...f.imgs, val]; return { ...f, imgs: arr, img: arr[0] }; });
                    if (inp) inp.value = "";
                  }}>Add</button>
              </div>
            </div>




            {/* Publication schedule */}
            <div style={{ background: "var(--abg)", border: "1px solid var(--bdr)", borderRadius: "10px", padding: "1rem" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: ".75rem", display: "flex", alignItems: "center", gap: ".4rem" }}>
                ⏱ Publication Schedule
                <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--mfg)" }}>(optional)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="fgrp" style={{ margin: 0 }}>
                  <span className="flbl">Publish from</span>
                  <input className="fi2" type="datetime-local"
                    value={listingForm.publishFrom}
                    onChange={e => setListingForm(f => ({ ...f, publishFrom: e.target.value }))} />
                </div>
                <div className="fgrp" style={{ margin: 0 }}>
                  <span className="flbl">Publish until</span>
                  <input className="fi2" type="datetime-local"
                    value={listingForm.publishTo}
                    onChange={e => setListingForm(f => ({ ...f, publishTo: e.target.value }))} />
                </div>
              </div>
              {(listingForm.publishFrom || listingForm.publishTo) && (
                <div style={{ marginTop: ".75rem", fontSize: "12px", color: "var(--mfg)", lineHeight: 1.6 }}>
                  {listingForm.publishFrom && listingForm.publishTo
                    ? `Live from ${new Date(listingForm.publishFrom).toLocaleString()} to ${new Date(listingForm.publishTo).toLocaleString()}.`
                    : listingForm.publishFrom
                      ? `Goes live at ${new Date(listingForm.publishFrom).toLocaleString()}.`
                      : `Expires at ${new Date(listingForm.publishTo).toLocaleString()}.`}
                  <button className="btn bd bxs" style={{ marginLeft: ".75rem", fontSize: "11px", padding: "2px 8px" }}
                    onClick={() => setListingForm(f => ({ ...f, publishFrom: "", publishTo: "" }))}>
                    Clear
                  </button>
                </div>
              )}
            </div>

          </div>

          <div style={{ display: "flex", gap: ".75rem", marginTop: "1.75rem" }}>
            <button className="btn bp" style={{ flex: 1, justifyContent: "center", padding: "12px" }} onClick={saveListingForm}>
              {editingListingId != null ? "Save Changes" : "Create Listing"}
            </button>
            <button className="btn bg2" style={{ padding: "12px 1.5rem" }} onClick={closeListingForm}>
              Cancel
            </button>
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════════════
          PARSER — Ad scraping engine
      ══════════════════════════════════════════════════════════════════ */}
      <div className={`pg ${page === "aparser" ? "on" : ""}`} id="p-aparser">
        <div className="alay">
          <AdminSidebar page={page} unreadCount={unreadCount} onGo={go} />
          <div className="ac">

            {/* Header */}
            <div className="parser-header">
              <div>
                <div className="det" style={{marginBottom:".3rem"}}>Admin Panel</div>
                <h2 style={{marginBottom:".15rem"}}>🕷 Ad Parser</h2>
                <p style={{fontSize:"13px",color:"var(--mfg)"}}>Automatic scraping from external sources</p>
              </div>
              <div className="parser-header-btns">
                <button className="btn bg2 bxs" onClick={()=>runAllSources()} disabled={parserSources.filter(s=>s.status==="active").length===0}>
                  ▶ Run All Active
                </button>
                <button className="btn bp" onClick={openNewSource}>+ Add Source</button>
              </div>
            </div>

            {/* Top stats */}
            <div className="parser-stats-row">
              {[
                {label:"Total Imported", val:parserTotalStats.total, icon:"📦", color:"var(--fg)"},
                {label:"New Today",      val:parserTotalStats.newToday, icon:"✨", color:"#6ddb6d"},
                {label:"Updated",        val:parserTotalStats.updated, icon:"↻",  color:"#4ab8e8"},
                {label:"Errors",         val:parserTotalStats.errors, icon:"⚠",  color:"#e86060"},
                {label:"Sources",        val:parserSources.length, icon:"🌐", color:"var(--fg)"},
                {label:"Active",         val:parserSources.filter(s=>s.status==="active").length, icon:"●", color:"#6ddb6d"},
              ].map(s=>(
                <div className="sc" key={s.label}>
                  <div className="sl">{s.icon} {s.label}</div>
                  <div className="sv" style={{color:s.color}}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Tab bar */}
            <div className="tlist" style={{marginBottom:"1.5rem"}}>
              {[["sources","🌐 Sources"],["import","📥 Import Log"],["log","📋 Action Log"]].map(([id,label])=>(
                <button key={id} className={`tab ${parserTab===id?"on":""}`} onClick={()=>setParserTab(id)}>{label}</button>
              ))}
            </div>

            {/* ── SOURCES tab ── */}
            {parserTab==="sources" && (<>

              {/* Filters */}
              <div className="parser-filters">
                <input className="fi2" style={{flex:1,minWidth:"160px"}} placeholder="Search sources…"
                  value={parserSearch} onChange={e=>setParserSearch(e.target.value)} />
                <select className="fi2" style={{width:"160px"}} value={parserFilterCat} onChange={e=>setParserFilterCat(e.target.value)}>
                  <option value="all">All categories</option>
                  {PARSER_CATS.map(c=><option key={c} value={c}>{PARSER_CAT_LABELS[c]}</option>)}
                </select>
                <select className="fi2" style={{width:"140px"}} value={parserFilterStatus} onChange={e=>setParserFilterStatus(e.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              {/* Sources table */}
              <div className="parser-table-wrap">
                <table className="parser-table">
                  <thead>
                    <tr>
                      <th>Source</th><th>Method</th><th>Category</th><th>Interval</th>
                      <th>Moderation</th><th>Stats</th><th>Last Run</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parserSources
                      .filter(s=>{
                        if(parserFilterCat!=="all" && s.category!==parserFilterCat) return false;
                        if(parserFilterStatus!=="all" && s.status!==parserFilterStatus) return false;
                        if(parserSearch && !`${s.name} ${s.url}`.toLowerCase().includes(parserSearch.toLowerCase())) return false;
                        return true;
                      })
                      .map(src=>{
                        const running = parserRunning[src.id];
                        const checking = parserRunning[`check_${src.id}`];
                        return (
                          <tr key={src.id} className={running?"parser-row-running":""}>
                            <td>
                              <div style={{fontWeight:600,fontSize:"13px"}}>{src.name}</div>
                              <div style={{fontSize:"11px",color:"var(--mfg)",maxWidth:"200px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{src.url}</div>
                            </td>
                            <td><span className="parser-badge parser-badge-method">{PARSER_METHOD_LABELS[src.method]||src.method}</span></td>
                            <td><span className="parser-badge">{PARSER_CAT_LABELS[src.category]||src.category}</span></td>
                            <td style={{fontSize:"12px"}}>{src.interval==="custom"?src.customCron||"custom":src.interval}</td>
                            <td>
                              <span className={`parser-badge ${src.moderation==="auto"?"parser-badge-auto":"parser-badge-review"}`}>
                                {src.moderation==="auto"?"Auto-publish":"Review"}
                              </span>
                            </td>
                            <td>
                              <div style={{fontSize:"11px",lineHeight:1.7}}>
                                <span style={{color:"#6ddb6d"}}>+{src.stats?.newToday||0} today</span><br/>
                                <span style={{color:"var(--mfg)"}}>{src.stats?.total||0} total</span>
                                {(src.stats?.errors||0)>0 && <><br/><span style={{color:"#e86060"}}>⚠ {src.stats.errors} err</span></>}
                              </div>
                            </td>
                            <td style={{fontSize:"11px",color:"var(--mfg)"}}>
                              {src.stats?.lastRun ? new Date(src.stats.lastRun).toLocaleString("en-GB",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}) : "—"}
                            </td>
                            <td>
                              <div className={`parser-status-dot ${src.status==="active"?"active":""}`} />
                              <span style={{fontSize:"11px"}}>{src.status==="active"?"Active":"Off"}</span>
                            </td>
                            <td>
                              <div className="parser-actions">
                                <button className="btn bg2 bxs" style={{fontSize:"11px",padding:"4px 10px"}}
                                  onClick={()=>runParser(src.id)} disabled={!!running}>
                                  {running ? <span className="parser-spin">↻</span> : "▶"}
                                </button>
                                <button className="btn bg2 bxs" style={{fontSize:"11px",padding:"4px 10px"}}
                                  onClick={()=>checkSource(src.id)} disabled={!!checking}>
                                  {checking ? <span className="parser-spin">↻</span> : "✓"}
                                </button>
                                <button className="btn bg2 bxs" style={{fontSize:"11px",padding:"4px 10px"}} onClick={()=>openEditSource(src)}>✏</button>
                                <button className="btn bg2 bxs" style={{fontSize:"11px",padding:"4px 10px",color:src.status==="active"?"#c0a020":"#6ddb6d"}} onClick={()=>toggleSourceStatus(src.id)}>
                                  {src.status==="active"?"⊘":"●"}
                                </button>
                                <button className="btn bd bxs" style={{fontSize:"11px",padding:"4px 10px"}} onClick={()=>deleteSource(src.id)}>🗑</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {parserSources.length===0 && (
                      <tr><td colSpan={9} style={{textAlign:"center",padding:"2rem",color:"var(--mfg)"}}>No sources yet. Add the first one.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>)}

            {/* ── IMPORT LOG tab ── */}
            {parserTab==="import" && (<>
              <div style={{marginBottom:"1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"13px",color:"var(--mfg)"}}>{parserImportedListings.length} listings imported this session</span>
                <button className="btn bg2 bxs" onClick={()=>setParserImportedListings([])}>Clear session log</button>
              </div>
              {parserImportedListings.length===0
                ? <div className="empty-state">No imports this session. Run a parser to see results.</div>
                : parserImportedListings.map(item=>(
                  <div key={item.id} className="mc" style={{marginBottom:".75rem"}}>
                    <div style={{padding:".75rem 1rem",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:".5rem"}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:"13px"}}>{item.t}</div>
                        <div style={{fontSize:"11px",color:"var(--mfg)"}}>{item.cat} · {item.city} · ${item.p}/day · via {item.source}</div>
                      </div>
                      <div style={{display:"flex",gap:".5rem",alignItems:"center"}}>
                        <span style={{
                          fontSize:"11px",padding:"2px 9px",borderRadius:"10px",fontWeight:600,
                          background:item.status==="active"?"#1a3a1a":"#2a1a1a",
                          color:item.status==="active"?"#6ddb6d":"#e8a020",
                          border:`1px solid ${item.status==="active"?"#2a5a2a":"#6a3a10"}`
                        }}>{item.status==="active"?"Published":"Pending review"}</span>
                        {item.status==="pending" && (
                          <button className="btn bp bxs" style={{fontSize:"11px",padding:"3px 10px"}}
                            onClick={()=>setListings(l=>l.map(x=>x.id===item.id?{...x,status:"active"}:x))}>
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
            </>)}

            {/* ── ACTION LOG tab ── */}
            {parserTab==="log" && (<>
              <div style={{marginBottom:"1rem",display:"flex",justifyContent:"flex-end"}}>
                <button className="btn bg2 bxs" onClick={()=>setParserLog([])}>Clear log</button>
              </div>
              {parserLog.length===0
                ? <div className="empty-state">Log is empty.</div>
                : parserLog.map(entry=>(
                  <div key={entry.id} className="mc" style={{marginBottom:".5rem"}}>
                    <div style={{padding:".65rem 1rem",display:"flex",gap:"1rem",alignItems:"flex-start",flexWrap:"wrap"}}>
                      <div style={{fontSize:"11px",color:"var(--mfg)",whiteSpace:"nowrap",minWidth:"110px"}}>
                        {new Date(entry.ts).toLocaleString("en-GB",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"})}
                      </div>
                      <div style={{minWidth:"90px"}}>
                        <span style={{
                          fontSize:"11px",padding:"2px 8px",borderRadius:"8px",fontWeight:600,
                          background:entry.status==="ok"?"#1a3a1a":entry.status==="warn"?"#2a2a10":entry.status==="running"?"#10203a":"#2a1010",
                          color:entry.status==="ok"?"#6ddb6d":entry.status==="warn"?"#e8c020":entry.status==="running"?"#4ab8e8":"#e86060",
                          border:`1px solid ${entry.status==="ok"?"#2a5a2a":entry.status==="warn"?"#5a5010":entry.status==="running"?"#1a4a7a":"#5a1010"}`
                        }}>
                          {entry.status==="running" ? <span className="parser-spin">↻</span> : entry.status}
                        </span>
                      </div>
                      <div style={{fontSize:"12px",fontWeight:600,minWidth:"120px"}}>{entry.source}</div>
                      <div style={{fontSize:"12px",color:"var(--mfg)",flex:1}}>{entry.msg}</div>
                      <div style={{fontSize:"11px",color:"var(--mfg)",textTransform:"uppercase",letterSpacing:".04em"}}>{entry.action}</div>
                    </div>
                  </div>
                ))
              }
            </>)}

          </div>
        </div>
      </div>

      {/* ── Source Form Modal ─────────────────────────────────────────────── */}
      <div
        className={`overlay ${parserSourceFormOpen?"show":""}`}
        onClick={e=>{if(e.target===e.currentTarget)closeSourceForm();}}
        style={{zIndex:1100}}
      >
        <div className="login-box" style={{maxWidth:"640px",width:"100%",maxHeight:"92vh",overflowY:"auto"}}>
          <div className="det" style={{marginBottom:".3rem"}}>Parser</div>
          <h2 style={{fontSize:"1.4rem",marginBottom:".25rem"}}>{parserEditId!=null?"Edit Source":"New Source"}</h2>
          <div className="ediv" style={{width:"60px",margin:".75rem 0 1.25rem"}}/>

          {/* Inner tabs */}
          <div className="tlist" style={{marginBottom:"1.25rem"}}>
            {[["basic","Basic"],["fields","Field Map"],["dedup","Dedup"],["schedule","Schedule"]].map(([id,label])=>(
              <button key={id} className={`tab ${parserSourceTab===id?"on":""}`} onClick={()=>setParserSourceTab(id)} style={{fontSize:"12px"}}>{label}</button>
            ))}
          </div>

          {/* ── Basic tab ── */}
          {parserSourceTab==="basic" && (
            <div style={{display:"grid",gap:"1rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                <div className="fgrp">
                  <span className="flbl">Source name *</span>
                  <input className="fi2" placeholder="e.g. Auto.me" value={parserSourceForm.name}
                    onChange={e=>setParserSourceForm(f=>({...f,name:e.target.value}))}/>
                </div>
                <div className="fgrp">
                  <span className="flbl">Status</span>
                  <select className="fi2" value={parserSourceForm.status}
                    onChange={e=>setParserSourceForm(f=>({...f,status:e.target.value}))}>
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
              <div className="fgrp">
                <span className="flbl">URL *</span>
                <input className="fi2" placeholder="https://example.com/rss" value={parserSourceForm.url}
                  onChange={e=>setParserSourceForm(f=>({...f,url:e.target.value}))}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                <div className="fgrp">
                  <span className="flbl">Category</span>
                  <select className="fi2" value={parserSourceForm.category}
                    onChange={e=>setParserSourceForm(f=>({...f,category:e.target.value}))}>
                    {PARSER_CATS.map(c=><option key={c} value={c}>{PARSER_CAT_LABELS[c]}</option>)}
                  </select>
                </div>
                <div className="fgrp">
                  <span className="flbl">Protocol / Method</span>
                  <select className="fi2" value={parserSourceForm.method}
                    onChange={e=>setParserSourceForm(f=>({...f,method:e.target.value}))}>
                    {PARSER_METHODS.map(m=><option key={m} value={m}>{PARSER_METHOD_LABELS[m]}</option>)}
                  </select>
                </div>
              </div>
              <div className="fgrp">
                <span className="flbl">Moderation mode</span>
                <div style={{display:"flex",gap:".75rem",marginTop:".25rem"}}>
                  {[["auto","Auto-publish"],["review","Send to review"]].map(([v,l])=>(
                    <label key={v} style={{display:"flex",alignItems:"center",gap:".4rem",cursor:"pointer",fontSize:"13px"}}>
                      <input type="radio" name="moderation" value={v} checked={parserSourceForm.moderation===v}
                        onChange={()=>setParserSourceForm(f=>({...f,moderation:v}))} style={{accentColor:"var(--acc)"}}/>
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              {parserSourceForm.method==="html" && (
                <div style={{background:"rgba(255,200,80,.07)",border:"1px solid rgba(255,200,80,.2)",borderRadius:"8px",padding:".75rem 1rem",fontSize:"12px",color:"#c0a020"}}>
                  ⚠ HTML scraping requires backend proxy. CORS restrictions apply in static deployment.
                  Configure your Node.js/Express proxy to forward requests.
                </div>
              )}
            </div>
          )}

          {/* ── Field Map tab ── */}
          {parserSourceTab==="fields" && (
            <div style={{display:"grid",gap:".75rem"}}>
              <p style={{fontSize:"12px",color:"var(--mfg)",marginBottom:".25rem"}}>
                Map source fields → site fields. Enter the key name as it appears in the source feed.
              </p>
              {[
                {key:"title",      label:"Title"},
                {key:"description",label:"Description"},
                {key:"price",      label:"Price"},
                {key:"currency",   label:"Currency"},
                {key:"city",       label:"City"},
                {key:"address",    label:"Address"},
                {key:"phone",      label:"Phone"},
                {key:"email",      label:"Email"},
                {key:"seller",     label:"Seller name"},
                {key:"photos",     label:"Photos (field/enclosure)"},
                {key:"pubDate",    label:"Publication date"},
                {key:"sourceUrl",  label:"Original URL"},
              ].map(f=>(
                <div key={f.key} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".75rem",alignItems:"center"}}>
                  <span style={{fontSize:"12px",fontWeight:600,color:"var(--fg)"}}>{f.label}</span>
                  <input className="fi2" style={{margin:0}} placeholder={`source field name`}
                    value={parserSourceForm.fieldMap[f.key]||""}
                    onChange={e=>setParserSourceForm(fr=>({...fr,fieldMap:{...fr.fieldMap,[f.key]:e.target.value}}))}/>
                </div>
              ))}
              <div style={{marginTop:".5rem",padding:".75rem 1rem",background:"var(--abg)",borderRadius:"8px",border:"1px solid var(--bdr)"}}>
                <div style={{fontSize:"12px",fontWeight:600,marginBottom:".5rem"}}>Skip field if empty</div>
                <div style={{fontSize:"12px",color:"var(--mfg)"}}>Fields left blank will be skipped during import and not overwrite existing data.</div>
              </div>
            </div>
          )}

          {/* ── Dedup tab ── */}
          {parserSourceTab==="dedup" && (
            <div style={{display:"grid",gap:"1rem"}}>
              <p style={{fontSize:"12px",color:"var(--mfg)"}}>
                Select which fields to use for duplicate detection. If any match is found, the listing will be updated instead of created.
              </p>
              {[
                {key:"url",         label:"Original URL",          desc:"Most reliable. Checks if the source URL already exists."},
                {key:"phone",       label:"Phone number",          desc:"Useful when the same seller posts to multiple sources."},
                {key:"source_id",   label:"Source ID / slug",      desc:"Use if the feed provides a unique item identifier."},
                {key:"title_price", label:"Title + Price match",   desc:"Fuzzy match. Catches reposts with same content."},
              ].map(f=>{
                const on = !!parserSourceForm.dupCheck[f.key];
                return (
                  <div key={f.key}
                    onClick={()=>setParserSourceForm(fr=>({...fr,dupCheck:{...fr.dupCheck,[f.key]:!fr.dupCheck[f.key]}}))}
                    style={{display:"flex",gap:"1rem",padding:".85rem 1rem",borderRadius:"8px",cursor:"pointer",
                      border:`1px solid ${on?"var(--acc)":"var(--bdr)"}`,
                      background:on?"rgba(255,255,255,.03)":"transparent",transition:"all .15s"}}>
                    <div style={{width:"18px",height:"18px",borderRadius:"4px",flexShrink:0,marginTop:"1px",
                      background:on?"var(--acc)":"transparent",border:`2px solid ${on?"var(--acc)":"var(--bdr)"}`,
                      display:"flex",alignItems:"center",justifyContent:"center",color:"var(--afg)",fontSize:"11px"}}>
                      {on?"✓":""}
                    </div>
                    <div>
                      <div style={{fontSize:"13px",fontWeight:600,marginBottom:".2rem"}}>{f.label}</div>
                      <div style={{fontSize:"12px",color:"var(--mfg)"}}>{f.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Schedule tab ── */}
          {parserSourceTab==="schedule" && (
            <div style={{display:"grid",gap:"1rem"}}>
              <div className="fgrp">
                <span className="flbl">Update interval</span>
                <select className="fi2" value={parserSourceForm.interval}
                  onChange={e=>setParserSourceForm(f=>({...f,interval:e.target.value}))}>
                  {[["15min","Every 15 minutes"],["30min","Every 30 minutes"],["1h","Every hour"],
                    ["6h","Every 6 hours"],["12h","Every 12 hours"],["24h","Every 24 hours"],["custom","Custom cron"]].map(([v,l])=>(
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              {parserSourceForm.interval==="custom" && (
                <div className="fgrp">
                  <span className="flbl">Cron expression</span>
                  <input className="fi2" placeholder="e.g. 0 */2 * * * (every 2h)" value={parserSourceForm.customCron||""}
                    onChange={e=>setParserSourceForm(f=>({...f,customCron:e.target.value}))}/>
                  <div style={{fontSize:"11px",color:"var(--mfg)",marginTop:".35rem"}}>
                    Format: minute hour day month weekday — <code>0 * * * *</code> = every hour
                  </div>
                </div>
              )}
              <div style={{padding:"1rem",background:"var(--abg)",borderRadius:"8px",border:"1px solid var(--bdr)"}}>
                <div style={{fontSize:"12px",fontWeight:600,marginBottom:".5rem"}}>⚙ Cron integration</div>
                <div style={{fontSize:"12px",color:"var(--mfg)",lineHeight:1.7}}>
                  Cron jobs run on the backend (Node.js + BullMQ/Redis). Add to your <code>scheduler.js</code>:<br/>
                  <code style={{display:"block",marginTop:".4rem",padding:".5rem .75rem",background:"rgba(0,0,0,.3)",borderRadius:"5px",fontSize:"11px"}}>
                    queue.add('parse', &#123; sourceId: {parserEditId||"<id>"} &#125;, &#123; repeat: &#123; cron: '{parserSourceForm.interval==="custom"?parserSourceForm.customCron||"0 * * * *":"0 * * * *"}' &#125; &#125;)
                  </code>
                </div>
              </div>
            </div>
          )}

          <div style={{display:"flex",gap:".75rem",marginTop:"1.75rem"}}>
            <button className="btn bp" style={{flex:1,justifyContent:"center",padding:"12px"}} onClick={saveSourceForm}>
              {parserEditId!=null?"Save Changes":"Add Source"}
            </button>
            <button className="btn bg2" style={{padding:"12px 1.5rem"}} onClick={closeSourceForm}>Cancel</button>
          </div>
        </div>
      </div>

      <div className={`pg ${page === "settings" ? "on" : ""}`} id="p-settings">
        <div className="con set-wrap">
          <div className="set-top">
            <div className="det" style={{ marginBottom: ".3rem" }}>
              Account
            </div>
            <h2 style={{ marginBottom: 0 }}>Settings</h2>
          </div>

          <div className="set-htabs">
            <button className={`sni ${settingsTab === "profile" ? "on" : ""}`} onClick={() => setSettingsTab("profile")}>
              👤 Profile
            </button>
            <button className={`sni ${settingsTab === "security" ? "on" : ""}`} onClick={() => setSettingsTab("security")}>
              🔒 Security
            </button>
            {currentUser?.role === "admin" ? (
              <button className={`sni ${settingsTab === "partners" ? "on" : ""}`} onClick={() => setSettingsTab("partners")}>
                👥 Partner Accounts
              </button>
            ) : null}
          </div>

          <div className={`set-panel ${settingsTab === "profile" ? "on" : ""}`}>
            <div className="profile-hero">
              <div className="profile-avatar-lg" style={{ background: currentUser ? roleColor(currentUser.role) : "var(--acc)" }}>
                {currentUser ? initials(currentUser.name) : ""}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: ".2rem" }}>{currentUser?.name || ""}</div>
                <div style={{ fontSize: "13px", color: "var(--mfg)", marginBottom: ".5rem" }}>{currentUser?.email || ""}</div>
                {currentUser ? (
                  <div>
                    <span className={`pill ${currentUser.role === "admin" ? "pv" : "pa"}`}>{roleLabel(currentUser.role)}</span>
                    {currentUser.company ? (
                      <span style={{ fontSize: "12px", color: "var(--mfg)", marginLeft: ".6rem" }}>{currentUser.company}</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div style={{ fontSize: "12px", color: "var(--mfg)", flexShrink: 0 }}>
                {currentUser ? `Member since ${currentUser.createdAt || ""}` : ""}
              </div>
            </div>

            <div className="set-section">
              <div className="set-section-title">Personal Information</div>
              <div className="grid-2">
                <div className="fgrp">
                  <span className="flbl">Full Name</span>
                  <input
                    className="fi2"
                    placeholder="Your name"
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                  />
                </div>
                <div className="fgrp">
                  <span className="flbl">Email</span>
                  <input
                    className="fi2"
                    type="email"
                    placeholder="your@email.com"
                    value={profileForm.email}
                    onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </div>
              </div>
              <div className="fgrp">
                <span className="flbl">Company / Business</span>
                <input
                  className="fi2"
                  placeholder="Your business name (optional)"
                  value={profileForm.company}
                  onChange={(event) => setProfileForm((current) => ({ ...current, company: event.target.value }))}
                />
              </div>
              <div className="fgrp">
                <span className="flbl">Role</span>
                <input className="fi2" disabled value={profileForm.role} readOnly />
              </div>
              <button className="btn bp bsm" onClick={saveProfile}>
                Save Changes
              </button>
            </div>

            <div className="set-section" style={{ borderLeft: "3px solid oklch(0.60 0.20 25 / 0.4)" }}>
              <div className="set-section-title" style={{ color: "oklch(0.55 0.20 25)" }}>
                ⚠ Danger Zone
              </div>
              <p style={{ fontSize: "13px", color: "var(--mfg)", marginBottom: "1rem" }}>
                Sign out of your current session.
              </p>
              <button className="btn bd bsm" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>

          <div className={`set-panel ${settingsTab === "security" ? "on" : ""}`}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
              <div className="set-section" style={{ marginBottom: 0 }}>
                <div className="set-section-title">🔑 Change Password</div>
                <div className="fgrp">
                  <span className="flbl">Current Password</span>
                  <input className="fi2" type="password" placeholder="••••••••" />
                </div>
                <div className="fgrp">
                  <span className="flbl">New Password</span>
                  <input className="fi2" type="password" placeholder="Min. 6 characters" />
                </div>
                <div className="fgrp">
                  <span className="flbl">Confirm Password</span>
                  <input className="fi2" type="password" placeholder="Repeat new password" />
                </div>
                <button className="btn bp bsm" onClick={() => showToast("Password updated successfully!")}>
                  Update Password
                </button>
              </div>
              <div className="set-section" style={{ marginBottom: 0 }}>
                <div className="set-section-title">🔐 Two-Factor Authentication</div>
                <p style={{ fontSize: "13px", color: "var(--mfg)", lineHeight: 1.6, marginBottom: "1rem" }}>
                  Add an extra layer of security. A code will be required each time you sign in.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "var(--sec)",
                    borderRadius: "var(--rad)",
                    padding: ".75rem 1rem",
                    marginBottom: "1rem",
                    gap: ".75rem"
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>🔐</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: ".15rem" }}>2FA is disabled</div>
                    <div style={{ fontSize: "12px", color: "var(--mfg)" }}>Your account is less secure</div>
                  </div>
                </div>
                <button className="btn bo bsm" onClick={() => showToast("2FA setup coming soon!")}>
                  Enable 2FA
                </button>
              </div>
            </div>
            <div className="set-section">
              <div className="set-section-title">🖥 Active Sessions</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".75rem 0", borderBottom: "1px solid var(--bdr)", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: ".2rem" }}>
                    Chrome on macOS - <span style={{ color: "#2a6a2a" }}>Current</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--mfg)" }}>Podgorica, Montenegro · Active now</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".75rem 0", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: ".2rem" }}>📱 Safari on iPhone</div>
                  <div style={{ fontSize: "12px", color: "var(--mfg)" }}>Moscow, Russia · 2 days ago</div>
                </div>
                <button className="btn bg2 bxs" onClick={() => showToast("Session revoked.")}>
                  Revoke
                </button>
              </div>
            </div>
          </div>

          <div className={`set-panel ${settingsTab === "partners" ? "on" : ""}`}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem", fontWeight: 600 }}>
                  Partner Accounts
                </div>
                <div style={{ fontSize: "13px", color: "var(--mfg)", marginTop: ".2rem" }}>
                  Create and manage vendor & admin access
                </div>
              </div>
              <button className="btn bp bsm" onClick={openPartnerModal}>
                + New Partner
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
              <div className="sc">
                <div className="sl">Total Accounts</div>
                <div className="sv">{users.length}</div>
              </div>
              <div className="sc">
                <div className="sl" style={{ color: "#5a1a7a" }}>
                  Admins
                </div>
                <div className="sv">{partnersAdmins}</div>
              </div>
              <div className="sc">
                <div className="sl" style={{ color: "#2a5a2a" }}>
                  Vendors
                </div>
                <div className="sv">{partnersVendors}</div>
              </div>
            </div>
            <div>
              {users.map((user) => (
                <div className="prow" key={user.id}>
                  <div className="prow-info">
                    <div className="avatar-sm" style={{ background: roleColor(user.role) }}>
                      {initials(user.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {user.name}
                        {user.id === currentUser?.id ? (
                          <span style={{ fontSize: "11px", color: "var(--mfg)", fontWeight: 400 }}> (you)</span>
                        ) : null}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--mfg)" }}>
                        {user.email}
                        {user.company ? ` · ${user.company}` : ""}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".3rem", flexWrap: "wrap" }}>
                        <span className={`pill ${user.role === "admin" ? "pv" : "pa"}`} style={{ fontSize: "10px", padding: "2px 8px" }}>
                          {roleLabel(user.role)}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--mfg)" }}>Since {user.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="prow-actions">
                    {user.id !== currentUser?.id ? (
                      <>
                        <button className="btn bg2 bxs" onClick={() => resetPartnerPassword(user.id)}>
                          Reset Pass
                        </button>
                        <button className="btn bd bxs" onClick={() => deletePartner(user.id)}>
                          Delete
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--mfg)", padding: "0 .5rem" }}>Current session</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
