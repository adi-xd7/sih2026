# DR Screening

## Project Structure

The project is divided into two main services:

- `backend/` — Spring Boot backend
- `ml-service/` — FastAPI / PyTorch machine learning service

```text
DR-SCREENING/
│
├── backend/                         ← Spring Boot
│   │
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   │
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/
│           │       └── dr/
│           │           └── dr_screening/
│           │               ├── controller/
│           │               ├── service/
│           │               ├── repository/
│           │               ├── entity/
│           │               ├── dto/
│           │               └── client/
│           │                   └── MlServiceClient.java
│           │
│           └── resources/
│               └── application.properties
│
│
└── ml-service/                      ← FastAPI / PyTorch
    │
    ├── main.py                      ← FastAPI code
    ├── dr_grading_model.pt          ← PUT THE .PT FILE HERE
    ├── requirements.txt
    │
    ├── models/
    │   └── ...
    │
    ├── preprocessing/
    │   └── ...
    │
    └── inference/
        └── ...

1. Frontend
cd D:\dr-screening\frontend
npx vite

Open: http://localhost:5173

2. Spring Boot backend
cd D:\dr-screening
.\mvnw.cmd spring-boot:run

Runs on: http://localhost:8080

3. ML / FastAPI service
cd D:\dr-screening\ml-service
.\venv\Scripts\activate
uvicorn main:app --reload --port 8000

Runs on: http://localhost:8000