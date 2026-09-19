import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { HospitalMatchResult } from "../../services/api";

interface AmbulanceMapProps {
  latitude: number;
  longitude: number;
  hospitals: HospitalMatchResult[];
  onLocationSelect?: (latitude: number, longitude: number) => void;
}

const ambulanceIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #166534;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(0,0,0,0.25);
      font-size: 18px;
    ">
      🚑
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const hospitalIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: white;
      border: 3px solid #15803d;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      color: #15803d;
      font-size: 14px;
      font-weight: 700;
    ">
      H
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const selectedLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #dc2626;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect?: (
    latitude: number,
    longitude: number
  ) => void;
}) {
  useMapEvents({
    click(event) {
      onLocationSelect?.(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

export default function AmbulanceMap({
  latitude,
  longitude,
  hospitals,
  onLocationSelect,
}: AmbulanceMapProps) {
  const ambulancePosition: [number, number] = [
    latitude,
    longitude,
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#DDE5DF] bg-white">
      {/* Header */}
      <div className="border-b border-[#E7ECE8] px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
          Live Location
        </p>

        <h2 className="mt-1 text-lg font-semibold text-[#172019]">
          Ambulance & Hospital Map
        </h2>

        <p className="mt-1 text-sm text-[#647067]">
          Click anywhere on the map to select an incident
          location.
        </p>
      </div>

      {/* Map */}
      <div className="h-[500px] w-full">
        <MapContainer
          center={ambulancePosition}
          zoom={13}
          scrollWheelZoom={true}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <MapClickHandler
            onLocationSelect={onLocationSelect}
          />

          {/* Ambulance */}
          <Marker
            position={ambulancePosition}
            icon={ambulanceIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Ambulance AMB-17</strong>

                <br />

                Current ambulance location
              </div>
            </Popup>
          </Marker>

          {/* Hospitals */}
          {hospitals.map((hospital) => {
            const hospitalPosition: [number, number] = [
              hospital.latitude,
              hospital.longitude,
            ];

            return (
              <div key={hospital.hospital_id}>
                <Marker
                  position={hospitalPosition}
                  icon={hospitalIcon}
                >
                  <Popup>
                    <div className="min-w-[190px]">
                      <p className="font-semibold text-[#172019]">
                        {hospital.hospital_name}
                      </p>

                      <div className="mt-2 space-y-1 text-xs text-[#647067]">
                        <p>
                          Match:{" "}
                          <strong className="text-green-700">
                            {hospital.match_score}%
                          </strong>
                        </p>

                        <p>
                          Distance: {hospital.distance_km} km
                        </p>

                        <p>
                          ETA:{" "}
                          {hospital.estimated_eta_minutes} min
                        </p>

                        <p>
                          ICU beds:{" "}
                          {hospital.available_icu_beds}
                        </p>

                        <p>
                          Available beds:{" "}
                          {hospital.total_available_beds}
                        </p>

                        <p>
                          Blood stock:{" "}
                          {hospital.has_blood_stock
                            ? "Available"
                            : "Unavailable"}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Route */}
                <Polyline
                  positions={[
                    ambulancePosition,
                    hospitalPosition,
                  ]}
                  pathOptions={{
                    color: "#15803D",
                    weight: 3,
                    opacity: 0.5,
                    dashArray: "7 7",
                  }}
                />
              </div>
            );
          })}

          {/* Selected incident location */}
          {onLocationSelect && (
            <Marker
              position={ambulancePosition}
              icon={selectedLocationIcon}
            />
          )}
        </MapContainer>
      </div>

      {/* Footer */}
      <div className="grid border-t border-[#E7ECE8] md:grid-cols-3">
        <div className="border-b border-[#E7ECE8] px-5 py-4 md:border-b-0 md:border-r">
          <p className="text-xs text-[#89938C]">
            Ambulance
          </p>

          <p className="mt-1 text-sm font-medium text-[#172019]">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>
        </div>

        <div className="border-b border-[#E7ECE8] px-5 py-4 md:border-b-0 md:border-r">
          <p className="text-xs text-[#89938C]">
            Hospitals Found
          </p>

          <p className="mt-1 text-sm font-medium text-[#172019]">
            {hospitals.length}
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs text-[#89938C]">
            Nearest Hospital
          </p>

          <p className="mt-1 text-sm font-medium text-green-700">
            {hospitals.length > 0
              ? hospitals.reduce((nearest, hospital) =>
                  hospital.distance_km <
                  nearest.distance_km
                    ? hospital
                    : nearest
                ).hospital_name
              : "No matches yet"}
          </p>
        </div>
      </div>
    </div>
  );
}