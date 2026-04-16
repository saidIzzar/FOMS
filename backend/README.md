# FOMS MES Backend - Industrial Factory Operations Management System

## 🚀 Quick Start

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Server
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Or use the batch file
```bash
run.bat
```

## 📡 API Endpoints

### Health
- `GET /health` - Health check
- `GET /` - API info

### Machine Specs (Industrial Catalog)
- `GET /api/v1/machine-specs` - Get all machine specifications
- `POST /api/v1/machine-specs/seed` - Seed machine specs catalog

### Machines
- `POST /api/v1/machines` - Create machine instance
- `GET /api/v1/machines` - Get all machines
- `GET /api/v1/machines/{id}` - Get machine details
- `GET /api/v1/machines/branch/{branch_id}` - Get machines by branch
- `PATCH /api/v1/machines/{id}/status` - Update machine status

### Molds
- `POST /api/v1/molds` - Create mold
- `GET /api/v1/molds` - Get all molds
- `GET /api/v1/molds/{id}` - Get mold details
- `PATCH /api/v1/molds/{id}` - Update mold

### Branches
- `POST /api/v1/branches` - Create branch
- `GET /api/v1/branches` - Get all branches

### Production Runs
- `POST /api/v1/production-runs` - Start production
- `GET /api/v1/production-runs` - Get all runs

### Compatibility Engine
- `POST /api/v1/compatibility/check` - Check machine-mold compatibility
- `GET /api/v1/compatibility/machines/{mold_id}` - Find compatible machines

### AI Recommender
- `POST /api/v1/ai/recommend` - Recommend best machine
- `GET /api/v1/ai/best-machine?required_tonnage=X` - Find smallest valid machine

### Efficiency
- `POST /api/v1/efficiency/machine` - Calculate machine efficiency
- `GET /api/v1/efficiency/all` - All machines efficiency
- `GET /api/v1/efficiency/average` - Average efficiency

### Factory Layout
- `GET /api/v1/factory/layout` - Optimize factory layout
- `GET /api/v1/factory/zones` - Zone distribution

## 🏭 Machine Specifications

The system includes 10 industrial machine classes:

| Class | Tonnage | Shot Volume | Ideal Cycle |
|-------|---------|------------|-------------|
| 90T   | 90T     | 127 cm³    | 10s         |
| 120T  | 120T    | 180 cm³    | 12s         |
| 160T  | 160T    | 270 cm³    | 14s         |
| 200T  | 200T    | 383 cm³    | 16s         |
| 250T  | 250T    | 519 cm³    | 18s         |
| 280T  | 280T    | 648 cm³    | 20s         |
| 380T  | 380T    | 916 cm³    | 24s         |
| 450T  | 450T    | 1290 cm³   | 28s         |
| 470T  | 470T    | 1465 cm³   | 30s         |
| 800T  | 800T    | 2800 cm³   | 40s         |

## ⚙️ Compatibility Rules

The system validates:
1. Machine tonnage >= mold required tonnage + 10% safety
2. Mold dimensions fit tie bar spacing
3. Machine shot volume >= required + 10% margin
4. Mold weight within ejector capacity

## 🎯 AI Recommender

Rules:
- Choose smallest valid machine (prevents over-sizing)
- Optimize energy efficiency
- Prefer idle machines
- Avoid over-sized machines

## 📊 Efficiency Formula

```
efficiency = (ideal_cycle_time / actual_cycle_time) * 100
```

Status:
- >= 85%: Excellent
- 70-84%: Good
- < 70%: Needs improvement

## 🏭 Factory Zones

- **HEAVY**: >= 380T (large molds)
- **MEDIUM**: 160T - 380T (standard)
- **LIGHT**: < 160T (precision)