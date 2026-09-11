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