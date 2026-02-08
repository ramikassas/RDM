
# High Demand Logic Analysis

## 1. Investigation Findings
A comprehensive search of the codebase reveals that "High Demand" is **not** a stored database field, but rather a dynamically calculated status displayed primarily on the frontend.

### A. Database Schema
*   **Table:** `public.domains`
*   **Columns:** There is **NO** column named `highDemand`, `high_demand`, `is_popular`, or similar.
*   **Related Tables:**
    *   `domain_interest_logs`: Stores `ip_address`, `domain_id`, and `view_duration`. This is the raw data source used to calculate demand.

### B. Code References

#### 1. `src/pages/DomainDetailPage.jsx`
This is the primary location where "High Demand" logic resides.

*   **Lines 111-122 (Tracking):**
    *   **Logic:** When the page loads, the component attempts to log the user's interest. It uses `sessionStorage` to prevent duplicate logging from the same session, but relies on `api.ipify.org` to get the IP address for the database log.
    *   **Code:**
        