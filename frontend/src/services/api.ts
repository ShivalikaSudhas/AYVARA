import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

/* ---------------- HOSPITALS ---------------- */

export interface Hospital {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export const fetchHospitals = async (): Promise<Hospital[]> => {
  const res = await api.get("/hospitals");
  return res.data;
};

export const fetchHospital = async (
  hospitalId: string
): Promise<Hospital> => {
  const res = await api.get(`/hospitals/${hospitalId}`);
  return res.data;
};

/* ---------------- DEPARTMENTS ---------------- */

export interface Department {
  id: string;
  hospital_id: string;
  name: string;
  status: string;
}

export const fetchDepartments = async (
  hospitalId?: string
): Promise<Department[]> => {
  const res = await api.get("/departments", {
    params: hospitalId ? { hospital_id: hospitalId } : undefined,
  });

  return res.data;
};

/* ---------------- RESOURCES ---------------- */

export interface Resource {
  id: string;
  department_id: string;
  resource_type: string;
  name: string;
  total_quantity: number;
  available_quantity: number;
  status: string;
}

export const fetchResources = async (
  departmentId?: string,
  resourceType?: string
): Promise<Resource[]> => {
  const res = await api.get("/resources", {
    params: {
      ...(departmentId ? { department_id: departmentId } : {}),
      ...(resourceType ? { resource_type: resourceType } : {}),
    },
  });

  return res.data;
};

export const updateResource = async (
  resourceId: string,
  data: Partial<
    Pick<
      Resource,
      | "resource_type"
      | "name"
      | "total_quantity"
      | "available_quantity"
      | "status"
    >
  >
): Promise<Resource> => {
  const res = await api.put(`/resources/${resourceId}`, data);
  return res.data;
};

/* ---------------- BEDS ---------------- */

export interface Bed {
  id: string;
  department_id: string;
  bed_number: string;
  bed_type: string;
  status: string;
}

export const fetchBeds = async (
  departmentId?: string,
  bedType?: string,
  statusFilter?: string
): Promise<Bed[]> => {
  const res = await api.get("/beds", {
    params: {
      ...(departmentId ? { department_id: departmentId } : {}),
      ...(bedType ? { bed_type: bedType } : {}),
      ...(statusFilter ? { status_filter: statusFilter } : {}),
    },
  });

  return res.data;
};

export const updateBed = async (
  bedId: string,
  data: Partial<Pick<Bed, "bed_number" | "bed_type" | "status">>
): Promise<Bed> => {
  const res = await api.put(`/beds/${bedId}`, data);
  return res.data;
};

/* ---------------- BLOOD ---------------- */

export interface BloodInventory {
  id: string;
  hospital_id: string;
  blood_type: string;
  available_units: number;
  minimum_units: number;
}

export const fetchBloodInventory = async (
  hospitalId?: string,
  bloodType?: string
): Promise<BloodInventory[]> => {
  const res = await api.get("/blood", {
    params: {
      ...(hospitalId ? { hospital_id: hospitalId } : {}),
      ...(bloodType ? { blood_type: bloodType } : {}),
    },
  });

  return res.data;
};

/* ---------------- EMERGENCY ---------------- */

export interface EmergencyMatchRequest {
  patient_condition: string;
  severity: "low" | "moderate" | "high" | "critical";
  latitude: number;
  longitude: number;
  required_specialties: string[];
  blood_type_needed?: string;
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

export interface EmergencyMatchResponse {
  emergency_id: string;
  patient_condition: string;
  severity: "low" | "moderate" | "high" | "critical";
  status: "pending" | "matched" | "dispatched" | "arrived" | "cancelled";
  created_at: string;
  matches: HospitalMatchResult[];
}

export interface Emergency {
  id: string;
  patient_condition: string;
  severity: "low" | "moderate" | "high" | "critical";
  status: "pending" | "matched" | "dispatched" | "arrived" | "cancelled";
  latitude: number;
  longitude: number;
  required_specialties: string[];
  blood_type_needed: string | null;
  selected_hospital_id: string | null;
  created_at: string;
}

export const createEmergency = async (
  payload: EmergencyMatchRequest
): Promise<EmergencyMatchResponse> => {
  const res = await api.post("/emergency", payload);
  return res.data;
};

export const fetchEmergencies = async (): Promise<Emergency[]> => {
  const res = await api.get("/emergency");
  return res.data;
};

export const fetchEmergency = async (
  emergencyId: string
): Promise<Emergency> => {
  const res = await api.get(`/emergency/${emergencyId}`);
  return res.data;
};

/* ---------------- DISPATCH ---------------- */

export interface DispatchRequest {
  emergency_id: string;
  selected_hospital_id: string;
  ambulance_unit: string;
  notes?: string;
}

export interface Dispatch {
  dispatch_id: string;
  emergency_id: string;
  selected_hospital_id: string;
  hospital_name: string;
  ambulance_unit: string;
  reservation_id: string;
  status: string;
  dispatched_at: string;
  estimated_arrival_minutes: number;
  notes: string | null;
}

export const createDispatch = async (
  payload: DispatchRequest
): Promise<Dispatch> => {
  const res = await api.post("/dispatch", payload);
  return res.data;
};

export const fetchDispatches = async (): Promise<Dispatch[]> => {
  const res = await api.get("/dispatch");
  return res.data;
};

/* ---------------- TRANSFERS ---------------- */

export interface TransferRequest {
  origin_hospital_id: string;
  destination_hospital_id: string;
  patient_id: string;
  reason: string;
  department_needed: string;
  required_specialty?: string;
}

export interface Transfer {
  transfer_id: string;
  origin_hospital_id: string;
  origin_hospital_name: string;
  destination_hospital_id: string;
  destination_hospital_name: string;
  patient_id: string;
  reason: string;
  department_needed: string;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "in_transit"
    | "completed"
    | "cancelled";
  response_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const fetchTransfers = async (
  hospitalId?: string
): Promise<Transfer[]> => {
  const res = await api.get("/transfers", {
    params: hospitalId ? { hospital_id: hospitalId } : undefined,
  });

  return res.data;
};

export const requestTransfer = async (
  payload: TransferRequest
): Promise<Transfer> => {
  const res = await api.post("/transfers", payload);
  return res.data;
};

export const updateTransferStatus = async (
  transferId: string,
  status: Transfer["status"],
  responseNotes?: string
): Promise<Transfer> => {
  const res = await api.put(`/transfers/${transferId}/status`, {
    status,
    response_notes: responseNotes,
  });

  return res.data;
};

/* ---------------- ANALYTICS ---------------- */

export interface UtilizationMetrics {
  hospital_id: string;
  total_capacity: number;
  occupied_beds: number;
  overall_utilization_pct: number;
  department_breakdown: {
    department: string;
    total: number;
    occupied: number;
    utilization_pct: number;
  }[];
  blood_stock_summary: Record<string, number | string[]>;
}

export interface ResponseTimeMetrics {
  average_dispatch_seconds: number;
  average_eta_minutes: number;
  average_arrival_minutes: number;
  dispatches_today: number;
  successful_arrivals: number;
  active_dispatches: number;
}

export const fetchUtilizationMetrics =
  async (): Promise<UtilizationMetrics> => {
    const res = await api.get("/analytics/utilization");
    return res.data;
  };

export const fetchResponseTimeMetrics =
  async (): Promise<ResponseTimeMetrics> => {
    const res = await api.get("/analytics/response-times");
    return res.data;
  };

export const fetchForecasting = async (
  hospitalId?: string,
  hoursAhead = 4
) => {
  const res = await api.get("/analytics/forecasting", {
    params: {
      ...(hospitalId ? { hospital_id: hospitalId } : {}),
      hours_ahead: hoursAhead,
    },
  });

  return res.data;
};