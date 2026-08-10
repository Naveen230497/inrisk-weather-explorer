# 🌩️ Weather Explorer (Ultra-Premium v2.0)

![Weather Explorer Header](https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=2000&auto=format&fit=crop)

> An enterprise-grade, full-stack weather analysis dashboard built by **InRisk Labs**. 

Weather Explorer is a modern web application that allows users to seamlessly search for global locations, ingest massive amounts of historical climate data via Open-Meteo, and visualize extreme weather trends using interactive, animated, glassmorphic UI components. 

## ✨ Key Features

- **🌍 Semantic Geocoding:** Type any city in the world (e.g., "Tokyo", "Guntur") and instantly resolve its coordinates via the Open-Meteo Geocoding API.
- **⚡ Hyper-Fast Caching Layer:** The backend utilizes an asynchronous LRU Cache (`cachetools` + `asyncache`). Identical requests are served in `<10ms`, bypassing external rate limits and conserving bandwidth.
- **📊 Automated Insight Extraction:** The dashboard automatically calculates key climate KPIs on the fly, including *Absolute Peak Heat*, *Deepest Cold*, *Daily Swings*, and *Freeze Risk*.
- **📈 Premium Visualizations:** Built with `Recharts` and `Framer Motion`, featuring SVG-gradient area charts and staggered bento-grid layout animations.
- **🗺️ Interactive Mapping:** A dynamic, dark-mode Leaflet map (`react-leaflet`) visually pinpoints your targeted coordinates using CartoDB Dark Matter tiles.
- **💾 Dual-Storage Engine:** Robust file storage architecture supporting local disk testing (`./data`) and production-ready S3-compatible cloud object storage (e.g., AWS S3, Cloudflare R2).
- **📥 Data Portability:** Researchers and scientists can download any analyzed dataset instantly in fully-formatted `.CSV` or `.JSON`.

---

## 🏗️ Architecture & Tech Stack

### Frontend (Client)
- **Framework:** Next.js 14+ (App Router, React 18)
- **Styling:** Tailwind CSS + Vanilla CSS (Glassmorphism aesthetics)
- **Animations:** Framer Motion
- **State & Fetching:** SWR (Stale-While-Revalidate)
- **Visuals & Icons:** Recharts, React-Leaflet, Lucide React
- **Notifications:** Sonner

### Backend (Server)
- **Framework:** FastAPI (Python 3.11+)
- **Validation:** Pydantic
- **Caching:** `asyncache` (TTL Memory Cache)
- **Network:** `httpx` (Asynchronous HTTP Client)
- **Storage:** `boto3` (AWS S3 SDK)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Python (v3.11+)
- npm or yarn

### 1. Backend Setup

Navigate to the backend directory and set up a virtual environment:

```bash
cd backend
python -m venv venv

# Activate the virtual environment (Windows)
.\venv\Scripts\Activate.ps1
# (Mac/Linux: source venv/bin/activate)

# Install dependencies
pip install -r requirements.txt
```

*(Optional)* If you wish to use S3/R2 storage instead of local storage, create a `.env` file in the `backend/` directory:
```env
R2_ENDPOINT_URL=https://<your-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=weather-data
```

Start the FastAPI server:
```bash
python -m uvicorn app.main:app --reload
```
*(The API will be available at http://127.0.0.1:8000/docs)*

### 2. Frontend Setup

Open a new terminal window, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
```

### 3. Usage
Open your browser and navigate to `http://localhost:3000`. 
1. Search for a city using the location input panel.
2. Select a custom date range (up to 31 days).
3. Click **Fetch & Store Data**.
4. Click on your generated dataset in the "Saved Datasets" panel to view the interactive visualizations!

---

## 🛡️ Security & Performance Notes

- **Path Traversal Protection:** The backend employs strict Regex validations (`^weather_[-0-9\.]+...`) to ensure file retrieval endpoints cannot be exploited to read unauthorized system files.
- **Float Rounding Optimization:** Latitude and Longitude coordinates are strictly rounded to 2 decimal places (`~1.1km` resolution) prior to cache hashing. This drastically mitigates memory bloat from hypersensitive coordinate drift and maximizes cache hit rates.
- **CORS Handling:** Configured for cross-device development via network IP (Note: `ALLOWED_ORIGINS` defaults to `*` for rapid local testing).

---

*Designed and engineered for maximum data fluidity and aesthetic impact.*
