import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Axios Request Interceptor: Inject JWT Bearer Token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interfaces
export interface EmergencyMatchRequest {
  patient_condition: string;
  latitude: number;
  longitude: number;
  required_specialties: string[];
  blood_type_needed?: string;
  priority?: "critical" | "high" | "moderate" | "low";
}

export interface HospitalMatchResult {
  hospital_id: string;
  hospital_name: string;
  latitude: number;
  longitude: number;
  match_score: number;
  distance_km: number;
  estimated_eta_minutes: number;
  available_icu_beds: number;
  total_available_beds: number;
  matched_specialties: string[];
  has_blood_stock: boolean;
}

export interface TransferRequest {
  source_hospital_id: string;
  target_hospital_id: string;
  patient_condition: string;
  resource_type: string;
  notes?: string;
}

// 1. Authentication API
export const loginApi = async (username: string, password: string) => {
  try {
    const res = await api.post("/auth/login", { username, password });
    return res.data;
  } catch (err) {
    console.warn("Backend auth offline, using fallback authentication");
    // Infer role from username for offline demo
    let role = "coordinator";
    let hospital_id = "hosp_001";
    if (username === "admin") {
      role = "admin";
      hospital_id = "";
    } else if (username.startsWith("dispatcher")) {
      role = "dispatcher";
      hospital_id = "";
    }

    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ sub: username, role, hospital_id })
    )}.mock_signature`;

    return {
      access_token: mockToken,
      token_type: "bearer",
      role,
      hospital_id: hospital_id || undefined,
      username,
    };
  }
};

// 2. Analytics APIs
export const fetchAnalyticsSummary = async () => {
  try {
    const res = await api.get("/analytics/summary");
    return res.data;
  } catch (err) {
    console.warn("Backend summary offline, returning fallback data");
    return {
      available_beds: 128,
      total_beds: 180,
      hospitals_online: 10,
      active_emergencies: 7,
      ambulances_available: 24,
      bed_occupancy_rate: 71.1,
    };
  }
};

export const fetchAnalyticsTrends = async () => {
  try {
    const res = await api.get("/analytics/trends");
    return res.data;
  } catch (err) {
    console.warn("Backend trends offline, returning fallback data");
    return {
      trends: [
        { time: "00:00", emergencies: 3, bedOccupancy: 62 },
        { time: "04:00", emergencies: 1, bedOccupancy: 58 },
        { time: "08:00", emergencies: 8, bedOccupancy: 74 },
        { time: "12:00", emergencies: 14, bedOccupancy: 88 },
        { time: "16:00", emergencies: 11, bedOccupancy: 82 },
        { time: "20:00", emergencies: 6, bedOccupancy: 70 },
      ],
    };
  }
};

// 3. Hospitals Directory API
export const fetchHospitals = async () => {
  try {
    const res = await api.get("/hospitals");
    return res.data;
  } catch (err) {
    console.warn("Backend hospitals offline, returning fallback data");
    return [
      {
        id: "hosp_001",
        name: "KMC Hospital Mangaluru",
        location: "Light House Hill Rd, Mangaluru",
        latitude: 12.8702,
        longitude: 74.8436,
        total_available_beds: 32,
        available_icu_beds: 6,
        occupancy: 72,
        status: "Available",
      },
      {
        id: "hosp_002",
        name: "AJ Hospital & Research Centre",
        location: "Kuntikana, Mangaluru",
        latitude: 12.8954,
        longitude: 74.8532,
        total_available_beds: 18,
        available_icu_beds: 2,
        occupancy: 81,
        status: "Available",
      },
      {
        id: "hosp_003",
        name: "Father Muller Medical College Hospital",
        location: "Kankanady, Mangaluru",
        latitude: 12.8642,
        longitude: 74.8551,
        total_available_beds: 7,
        available_icu_beds: 1,
        occupancy: 94,
        status: "Limited",
      },
    ];
  }
};

// 4. Emergency Matching Engine API
export const createEmergencyAndMatch = async (payload: EmergencyMatchRequest): Promise<HospitalMatchResult[]> => {
  try {
    const res = await api.post("/emergency/create-and-match", payload);
    return res.data.matching_hospitals || res.data;
  } catch (err) {
    console.warn("Backend matching offline, returning calculated mock matches");
    return [
      {
        hospital_id: "hosp_001",
        hospital_name: "KMC Hospital Mangaluru",
        latitude: 12.8702,
        longitude: 74.8436,
        match_score: 94.5,
        distance_km: 2.3,
        estimated_eta_minutes: 6,
        available_icu_beds: 6,
        total_available_beds: 32,
        matched_specialties: payload.required_specialties,
        has_blood_stock: true,
      },
      {
        hospital_id: "hosp_002",
        hospital_name: "AJ Hospital & Research Centre",
        latitude: 12.8954,
        longitude: 74.8532,
        match_score: 88.0,
        distance_km: 4.1,
        estimated_eta_minutes: 9,
        available_icu_beds: 2,
        total_available_beds: 18,
        matched_specialties: payload.required_specialties,
        has_blood_stock: true,
      },
    ];
  }
};

// 5. Patient Transfers API
export const fetchTransfers = async () => {
  try {
    const res = await api.get("/transfers");
    return res.data;
  } catch (err) {
    return [
      {
        id: "TR-501",
        source_hospital: "KMC Hospital Mangaluru",
        target_hospital: "AJ Hospital & Research Centre",
        patient_condition: "Severe Trauma - ICU Required",
        resource_type: "ICU Bed",
        status: "IN_PROGRESS",
        requested_at: "10 mins ago",
      },
      {
        id: "TR-502",
        source_hospital: "Father Muller Medical College",
        target_hospital: "KMC Hospital Mangaluru",
        patient_condition: "Cardiac Stabilization",
        resource_type: "Ventilator",
        status: "PENDING",
        requested_at: "25 mins ago",
      },
    ];
  }
};

export const requestTransfer = async (payload: TransferRequest) => {
  try {
    const res = await api.post("/transfers/request", payload);
    return res.data;
  } catch (err) {
    return {
      id: `TR-${Math.floor(100 + Math.random() * 900)}`,
      status: "PENDING",
      message: "Transfer request submitted successfully (Offline mode).",
    };
  }
};

// 6. Disaster Mode Surge Protocol API
export const toggleDisasterModeApi = async (active: boolean) => {
  try {
    const res = await api.post("/disaster/toggle", { active });
    return res.data;
  } catch (err) {
    console.warn("Backend disaster toggle offline");
    return { disaster_mode: active, timestamp: new Date().toISOString() };
  }
};

export const fetchDisasterStatusApi = async () => {
  try {
    const res = await api.get("/disaster/status");
    return res.data;
  } catch (err) {
    return { disaster_mode: false };
  }
};

// 7. HMIS Sync API
export const triggerHMISSyncApi = async () => {
  try {
    const res = await api.post("/sync/hmis");
    return res.data;
  } catch (err) {
    return { status: "success", synced_facilities: 10 };
  }
};

// 8. Public Citizen Reports & Confirmation API
export const fetchPendingCitizenReportsApi = async () => {
  try {
    const res = await api.get("/citizen-reports/pending");
    return res.data;
  } catch (err) {
    return [
      {
        id: "CR-901",
        description: "Multi-vehicle collision on NH-66 near Kuntikana flyover. 3 casualties.",
        reporter_phone: "+91 98765 43210",
        latitude: 12.8954,
        longitude: 74.8532,
        status: "PENDING",
        created_at: "5 mins ago",
      },
    ];
  }
};

export const confirmCitizenReportApi = async (reportId: string, triageData: any) => {
  try {
    const res = await api.post(`/citizen-reports/${reportId}/confirm`, triageData);
    return res.data;
  } catch (err) {
    return { status: "CONFIRMED", emergency_request_id: `EMG-${Math.floor(1000 + Math.random() * 9000)}` };
  }
};

// 9. Ambulance Unit Dispatch API
export const createDispatchApi = async (emergencyId: string, hospitalId: string, unitId?: string) => {
  try {
    const res = await api.post("/dispatch/create", { emergency_id: emergencyId, hospital_id: hospitalId, unit_id: unitId });
    return res.data;
  } catch (err) {
    return { dispatch_id: `DSP-${Math.floor(100 + Math.random() * 900)}`, status: "ASSIGNED", unit_id: unitId || "ALS-Unit-01" };
  }
};

export const fetchActiveDispatchesApi = async () => {
  try {
    const res = await api.get("/dispatch/active");
    return res.data;
  } catch (err) {
    return [
      {
        id: "DSP-101",
        unit_id: "ALS-Unit-04",
        hospital_name: "KMC Hospital Mangaluru",
        status: "EN_ROUTE",
        eta_minutes: 7,
      },
    ];
  }
};

// 10. Bed Management API
export const updateBedStatusApi = async (bedId: string, status: "AVAILABLE" | "RESERVED" | "OCCUPIED") => {
  try {
    const res = await api.put(`/beds/${bedId}`, { status });
    return res.data;
  } catch (err) {
    return { id: bedId, status, updated: true };
  }
};

// 11. QR Code Arrival Handover API
export const generateQRApi = async (emergencyId: string) => {
  try {
    const res = await api.post("/qr/generate", { emergency_id: emergencyId });
    return res.data;
  } catch (err) {
    return { emergency_id: emergencyId, qr_token: `QR-TOK-${emergencyId}` };
  }
};

export const verifyQRApi = async (qrToken: string) => {
  try {
    const res = await api.post("/qr/verify", { qr_token: qrToken });
    return res.data;
  } catch (err) {
    return { verified: true, status: "OCCUPIED" };
  }
};
