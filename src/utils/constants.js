const getDefaultApiBaseUrl = () => {
  if (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) {
    return "http://localhost:5000";
  }

  return "https://evopath-backend.onrender.com";
};

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || getDefaultApiBaseUrl();

export const INITIAL_ACTIVITIES = [
  {
    id: 1,
    title: "Wadi Rum Desert Retreat & Team Building",
    category: "trips",
    vendor: "Desert Horizons Coordination",
    price: "$120 / person",
    rating: 4.9,
    duration: "2 Days",
    image: "https://images.unsplash.com/photo-1544985390-e79f6e62dd1c?auto=format&fit=crop&w=800&q=80",
    description: "Disconnect to reconnect. A fully guided overnight trip focused on team trust exercises and desert survival games."
  },
  {
    id: 2,
    title: "Tech-Free Forest Hiking",
    category: "trips",
    vendor: "Nature Treks LLC",
    price: "$45 / person",
    rating: 4.7,
    duration: "1 Day",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
    description: "A guided hike designed to relieve corporate burnout. Includes a mountain-top picnic."
  },
  {
    id: 3,
    title: "Local Orphanage Renovation",
    category: "volunteer",
    vendor: "Community Builders NGO",
    price: "Free (Donation Optional)",
    rating: 5.0,
    duration: "6 Hours",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80",
    description: "Your team will paint walls, build furniture, and create a better environment for local children. High impact CSR."
  },
  {
    id: 4,
    title: "Tree Planting Initiative",
    category: "volunteer",
    vendor: "Green Earth Society",
    price: "$10 / tree",
    rating: 4.8,
    duration: "4 Hours",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    description: "Combat climate change while bonding. Compete in teams to see who can plant the most trees."
  },
  {
    id: 5,
    title: "Office Escape Room: The Hack",
    category: "events",
    vendor: "BrainTease Corporate",
    price: "$500 / team",
    rating: 4.9,
    duration: "2 Hours",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    description: "We turn your own conference room into a high-stakes escape room. Perfect ice-breaker."
  },
  {
    id: 6,
    title: "National Independence Day Gala",
    category: "events",
    vendor: "Elite Event Planners",
    price: "Custom Quote",
    rating: 4.6,
    duration: "Evening",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    description: "Full-service catering, traditional music, and decoration for national celebrations right in your headquarters."
  }
];
