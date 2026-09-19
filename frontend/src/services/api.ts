import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

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

export const fetchAnalyticsSummary = async () => {
  try {
    const res = await api.get("/analytics/summary");
    return res.data;
  } catch (err) {
    console.warn("Backend summary offline, returning fallback data");
    return {
      available_beds: 128,
      total_beds: 180,
      hospitals_online: 12,
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

export const fetchHospitals = async () => {
  try {
    const res = await api.get("/hospitals");
    return res.data;
  } catch (err) {
    console.warn("Backend hospitals offline, returning fallback data");
    return [
      {
        id: "hosp_001",
        name: "City General Hospital",
        location: "Central District",
        latitude: 40.7128,
        longitude: -74.006,
        total_available_beds: 32,
        available_icu_beds: 6,
        occupancy: 72,
        status: "Available",
      },
      {
        id: "hosp_002",
        name: "KMC Medical Center",
        location: "North District",
        latitude: 40.7306,
        longitude: -73.9352,
        total_available_beds: 18,
        available_icu_beds: 2,
        occupancy: 81,
        status: "Available",
      },
      {
        id: "hosp_003",
        name: "Janapriya Hospital",
        location: "East District",
        latitude: 40.7589,
        longitude: -73.9851,
        total_available_beds: 7,
        available_icu_beds: 1,
        occupancy: 94,
        status: "Limited",
      },
    ];
  }
};

export const createEmergencyAndMatch = async (payload: EmergencyMatchRequest): Promise<HospitalMatchResult[]> => {
  try {
    const res = await api.post("/emergency/create-and-match", payload);
    return res.data.matching_hospitals || res.data;
  } catch (err) {
    console.warn("Backend matching offline, returning calculated mock matches");
    return [
      {
        hospital_id: "hosp_003",
        hospital_name: "Janapriya Hospital",
        latitude: 40.7589,
        longitude: -73.9851,
        match_score: 94.5,
        distance_km: 2.3,
        estimated_eta_minutes: 6,
        available_icu_beds: 6,
        total_available_beds: 22,
        matched_specialties: payload.required_specialties,
        has_blood_stock: true,
      },
      {
        hospital_id: "hosp_001",
        hospital_name: "City General Hospital",
        latitude: 40.7128,
        longitude: -74.006,
        match_score: 88.0,
        distance_km: 4.1,
        estimated_eta_minutes: 9,
        available_icu_beds: 3,
        total_available_beds: 14,
        matched_specialties: payload.required_specialties,
        has_blood_stock: true,
      },
    ];
  }
};

export const fetchTransfers = async () => {
  try {
    const res = await api.get("/transfers");
    return res.data;
  } catch (err) {
    return [
      {
        id: "TR-501",
        source_hospital: "City General",
        target_hospital: "Janapriya Hospital",
        patient_condition: "Severe Trauma - ICU Required",
        resource_type: "ICU Bed",
        status: "IN_PROGRESS",
        requested_at: "10 mins ago",
      },
      {
        id: "TR-502",
        source_hospital: "KMC",
        target_hospital: "City General",
        patient_condition: "Cardiac Stabilization",
        resource_type: "Ventilator",
        status: "PENDING",
        requested_at: "25 mins ago",
      },
    ];
  }
};

export const requestTransfer = async (payload: TransferRequest) => {
  const res = await api.post("/transfers/request", payload);
  return res.data;
};
