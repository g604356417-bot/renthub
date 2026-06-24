export const INITIAL_USERS = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "admin@renthub.com",
    pass: "admin123",
    role: "admin",
    company: "RentHub",
    createdAt: "Jan 2024"
  }
];

export const LISTINGS = [
  {
    id: 1,
    t: "Tesla Model 3 Long Range",
    cat: "cars",
    city: "Moscow",
    p: 89,
    status: "active",
    img: "/images/listings/tesla-model-3.jpg",
    desc: "Electric sedan with 500km range. Level 2 Autopilot, panoramic roof, premium audio.",
    specs: [
      { l: "Type", v: "Electric" },
      { l: "Seats", v: "5" },
      { l: "0-60", v: "3.6s" },
      { l: "Range", v: "500km" }
    ],
    tags: ["Autopilot", "Supercharging", "Climate Control"],
    r: 4.9,
    rc: 38,
    imgs: ["/images/listings/tesla-model-3.jpg", "/images/listings/tesla-model-3-2.jpg"]
  },
  {
    id: 2,
    t: "BMW M4 Competition",
    cat: "cars",
    city: "St. Petersburg",
    p: 195,
    status: "active",
    img: "/images/listings/bmw-m4.jpg",
    desc: "510hp sports coupe. Adaptive M suspension, carbon exterior, Harman Kardon sound.",
    specs: [
      { l: "Power", v: "510 hp" },
      { l: "Gearbox", v: "8-spd" },
      { l: "0-60", v: "3.9s" },
      { l: "Fuel", v: "Petrol" }
    ],
    tags: ["Sport+", "Carbon", "HK Audio"],
    r: 4.8,
    rc: 21,
    imgs: ["/images/listings/bmw-m4.jpg"]
  },
  {
    id: 3,
    t: "Sun Odyssey 410 Sailing Yacht",
    cat: "boats",
    city: "Montenegro",
    p: 450,
    status: "active",
    img: "/images/listings/sailing-yacht.jpg",
    desc: "Adriatic cruising yacht with 3 cabins, GPS, and fully equipped galley.",
    specs: [
      { l: "Length", v: "12.5m" },
      { l: "Cabins", v: "3" },
      { l: "Guests", v: "8" },
      { l: "Year", v: "2021" }
    ],
    tags: ["Captain", "Kitchen", "GPS"],
    r: 4.7,
    rc: 14,
    imgs: ["/images/listings/sailing-yacht.jpg"]
  },
  {
    id: 4,
    t: "Ducati Panigale V4S",
    cat: "motorcycles",
    city: "Krasnodar",
    p: 120,
    status: "active",
    img: "/images/listings/ducati-v4s.svg",
    desc: "214hp Italian superbike with race-grade electronics.",
    specs: [
      { l: "Power", v: "214 hp" },
      { l: "Engine", v: "1103cc" },
      { l: "0-60", v: "2.8s" },
      { l: "Type", v: "Supersport" }
    ],
    tags: ["Helmet", "Gloves", "Insurance"],
    r: 5.0,
    rc: 9,
    imgs: ["/images/listings/ducati-v4s.svg"]
  },
  {
    id: 5,
    t: "Sea View Apartment",
    cat: "apartments",
    city: "Budva",
    p: 135,
    status: "active",
    img: "/images/listings/sea-view-apartment.jpg",
    desc: "Seafront apartment with panoramic Adriatic views. Pool, terrace, smart home.",
    specs: [
      { l: "Bedrooms", v: "2" },
      { l: "Area", v: "85 m2" },
      { l: "Guests", v: "4" },
      { l: "Floor", v: "7th" }
    ],
    tags: ["Pool", "Wi-Fi", "A/C", "Balcony"],
    r: 4.9,
    rc: 52,
    imgs: ["/images/listings/sea-view-apartment.jpg"]
  },
  {
    id: 6,
    t: "Mercedes G-Class AMG",
    cat: "cars",
    city: "Dubai",
    p: 320,
    status: "active",
    img: "/images/listings/g-class-amg.jpg",
    desc: "AMG G63 with 585hp. Luxury meets extreme off-road capability.",
    specs: [
      { l: "Power", v: "585 hp" },
      { l: "Drive", v: "4x4" },
      { l: "Gearbox", v: "9-spd" },
      { l: "Fuel", v: "Petrol" }
    ],
    tags: ["AWD", "Delivery", "Navigation"],
    r: 4.8,
    rc: 27,
    imgs: ["/images/listings/g-class-amg.jpg"]
  },
  {
    id: 7,
    t: "Trek Fuel EX Mountain Bike",
    cat: "bicycles",
    city: "Sochi",
    p: 22,
    status: "active",
    img: "/images/listings/mountain-bike.jpg",
    desc: "Full-suspension MTB. Fox suspension, Shimano hydraulics.",
    specs: [
      { l: "Type", v: "MTB" },
      { l: "Wheels", v: '29"' },
      { l: "Gears", v: "12-spd" },
      { l: "Brakes", v: "Hydraulic" }
    ],
    tags: ["Helmet", "Gloves", "Pump"],
    r: 4.6,
    rc: 18,
    imgs: ["/images/listings/mountain-bike.jpg"]
  },
  {
    id: 8,
    t: "Boston Dynamics Spot Robot",
    cat: "robots",
    city: "Moscow",
    p: 290,
    status: "active",
    img: "/images/listings/spot-robot.jpg",
    desc: "Quadruped robot for inspection, security, and events.",
    specs: [
      { l: "Type", v: "Quadruped" },
      { l: "Battery", v: "90 min" },
      { l: "Purpose", v: "Business" },
      { l: "Payload", v: "14 kg" }
    ],
    tags: ["Programmable", "SDK Access", "Operator Available"],
    r: 4.8,
    rc: 7,
    imgs: ["/images/listings/spot-robot.jpg"]
  }
];

export const INITIAL_MODERATION = {
  p: [
    {
      id: 101,
      t: "Lamborghini Huracan EVO",
      city: "Moscow",
      p: 580,
      desc: "Italian supercar with 640hp.",
      img: "/images/moderation/lamborghini-evo.jpg"
    },
    {
      id: 102,
      t: "5-Bedroom Sea View Villa",
      city: "Yalta",
      p: 620,
      desc: "Luxury beachfront villa with pool.",
      img: "/images/moderation/sea-view-villa.jpg"
    },
    {
      id: 103,
      t: "Porsche Taycan Turbo S",
      city: "St. Petersburg",
      p: 420,
      desc: "Electric super-sedan 761hp.",
      img: "/images/moderation/taycan-turbo-s.jpg"
    },
    {
      id: 104,
      t: "Bavaria 40 Catamaran",
      city: "Montenegro",
      p: 380,
      desc: "Catamaran for up to 8 guests.",
      img: "/images/moderation/catamaran.svg"
    }
  ],
  a: [...LISTINGS],
  r: [
    {
      id: 201,
      t: "Motorcycle without documents",
      city: "N/A",
      p: 30,
      img: "",
      reason: "Missing registration documents"
    },
    {
      id: 202,
      t: "Car with fake photos",
      city: "Moscow",
      p: 150,
      img: "",
      reason: "Photos do not match actual vehicle"
    }
  ]
};

export const INITIAL_FEATURED = [
  {
    id: 1,
    t: "Tesla Model 3 Long Range",
    city: "Moscow",
    p: 89,
    img: "/images/listings/tesla-model-3.jpg"
  },
  {
    id: 3,
    t: "Sun Odyssey 410 Sailing Yacht",
    city: "Montenegro",
    p: 450,
    img: "/images/listings/sailing-yacht.jpg"
  },
  {
    id: 5,
    t: "Sea View Apartment",
    city: "Budva",
    p: 135,
    img: "/images/listings/sea-view-apartment.jpg"
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "new_listing",
    title: "New listing pending review",
    msg: "Lamborghini Huracan EVO awaiting moderation.",
    time: "2 min ago",
    read: false
  },
  {
    id: 2,
    type: "new_listing",
    title: "New listing pending review",
    msg: "5-Bedroom Sea View Villa submitted.",
    time: "15 min ago",
    read: false
  },
  {
    id: 3,
    type: "booking",
    title: "New booking received",
    msg: "Maria S. booked Tesla Model 3 for Apr 10-14.",
    time: "1 hour ago",
    read: false
  },
  {
    id: 4,
    type: "listing_updated",
    title: "Listing updated",
    msg: "Ducati Panigale V4S - photos updated.",
    time: "3 hours ago",
    read: true
  },
  {
    id: 5,
    type: "system_alert",
    title: "System maintenance",
    msg: "Scheduled Apr 7, 02:00-04:00 UTC.",
    time: "Yesterday",
    read: true
  }
];

export const HOME_FEATURES = [
  {
    icon: "🔍",
    title: "Smart Filters",
    text: "Find what you need with flexible filters"
  },
  {
    icon: "⚡",
    title: "Instant Booking",
    text: "Reserve in seconds, pick up in minutes"
  },
  {
    icon: "✓",
    title: "Verified Owners",
    text: "All vendors are thoroughly vetted"
  },
  {
    icon: "★",
    title: "Rated & Reviewed",
    text: "Real feedback from real renters"
  }
];

export const CATEGORY_CARDS = [
  { slug: "cars", icon: "🚗", title: "Cars", text: "City cars and SUVs" },
  { slug: "motorcycles", icon: "🏍️", title: "Motorcycles", text: "Scooters and bikes" },
  { slug: "boats", icon: "⛵", title: "Yachts & Boats", text: "Sea tours and fishing" },
  { slug: "apartments", icon: "🏡", title: "Apartments", text: "Flats and villas" },
  { slug: "bicycles", icon: "🚲", title: "Bicycles", text: "City and mountain bikes" },
  { slug: "staff", icon: "👤", title: "Staff & Services", text: "Drivers, guides, and more" },
  { slug: "robots", icon: "🤖", title: "Robots", text: "Humanoid and delivery robots" },
  { slug: "aircraft", icon: "✈️", title: "Aircraft", text: "Helicopters and planes" }
];

export const DETAIL_REVIEWS = [
  {
    n: "Alex K.",
    d: "March 2026",
    txt: "Excellent condition, exactly as pictured. Highly recommend!",
    r: 5
  },
  {
    n: "Maria S.",
    d: "Feb 2026",
    txt: "Perfect choice for the weekend. Will rent again.",
    r: 5
  }
];

export const CATEGORY_FILTER_SECTIONS = {
  cars: {
    selects: [
      { label: "Transmission", options: ["Any", "Automatic", "Manual"] },
      { label: "Fuel Type", options: ["Any", "Petrol", "Diesel", "Electric", "Hybrid"] },
      { label: "Body Type", options: ["Any", "Sedan", "Crossover", "Hatchback", "Coupe"] }
    ],
    checks: ["No Deposit Required"]
  },
  motorcycles: {
    selects: [
      { label: "Bike Type", options: ["Any", "Scooter", "Motorcycle", "Quad"] },
      { label: "Engine (cc)", options: ["Any", "Up to 125cc", "125-250cc", "400cc+"] }
    ],
    checks: []
  },
  boats: {
    selects: [{ label: "Vessel Type", options: ["Any", "Jet Ski", "Speedboat", "Yacht", "Kayak"] }],
    checks: ["Includes Captain"]
  },
  apartments: {
    selects: [
      { label: "Bedrooms", options: ["Any", "Studio", "1 Bedroom", "2 Bedrooms", "3+ Bedrooms"] },
      { label: "View", options: ["Any", "Sea View", "City View", "Mountain View"] }
    ],
    checks: ["Wi-Fi", "Pool", "Parking"]
  },
  robots: {
    selects: [
      { label: "Robot Type", options: ["Any", "Humanoid", "Delivery", "Cleaning", "Entertainment"] },
      { label: "Purpose", options: ["Any", "Home", "Business", "Events"] }
    ],
    checks: ["Programmable"]
  },
  aircraft: {
    selects: [{ label: "Aircraft Type", options: ["Any", "Helicopter", "Airplane", "Paraglider"] }],
    checks: ["With Pilot"]
  },
  staff: {
    selects: [
      { label: "Service Type", options: ["Any", "Driver", "Guide", "Photographer", "Chef", "DJ"] }
    ],
    checks: ["English", "Russian"]
  }
};
