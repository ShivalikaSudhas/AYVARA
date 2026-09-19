"""P3 — Resource demand prediction & forecasting service."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional


def predict_resource_utilization(
    hospital_id: Optional[str] = None,
    hours_ahead: int = 4
) -> Dict[str, Any]:
    """
    Simulates trend-based forecasting using resource snapshot history.
    Predicts bed utilization and generates capacity bottleneck alerts.
    """
    now = datetime.now(timezone.utc)
    target_time = now + timedelta(hours=hours_ahead)

    # Simulated snapshot baseline analytics
    current_icu_utilization = 82.5  # percentage
    current_general_utilization = 74.0
    hourly_icu_inflow_rate = 1.2  # beds/hr net gain

    predicted_icu_utilization = min(100.0, round(current_icu_utilization + (hourly_icu_inflow_rate * hours_ahead), 1))
    predicted_general_utilization = min(100.0, round(current_general_utilization + (0.8 * hours_ahead), 1))

    alerts: List[Dict[str, str]] = []
    if predicted_icu_utilization >= 90.0:
        alerts.append({
            "severity": "high",
            "department": "Intensive Care Unit (ICU)",
            "message": f"ICU bed utilization projected to reach {predicted_icu_utilization}% within {hours_ahead} hours."
        })

    if predicted_general_utilization >= 85.0:
        alerts.append({
            "severity": "medium",
            "department": "General Wards",
            "message": f"General bed occupancy expected to exceed 85% by {target_time.strftime('%H:%M UTC')}."
        })

    return {
        "hospital_id": hospital_id or "all_hospitals",
        "forecast_horizon_hours": hours_ahead,
        "target_time": target_time.isoformat(),
        "predictions": {
            "icu_utilization_pct": predicted_icu_utilization,
            "general_utilization_pct": predicted_general_utilization,
            "oxygen_demand_trend": "stable",
            "critical_blood_shortages": ["O_negative"]
        },
        "alerts": alerts
    }
