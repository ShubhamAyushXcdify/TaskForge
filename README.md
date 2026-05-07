# LearnTrack API

## Architecture
- **API** → Controllers
- **Application** → Business Logic & Interfaces
- **Core** → Entities & DTOs
- **Infrastructure** → Data Access & Services

## Tech Stack
- ASP.NET Core Web API
- Clean Architecture
- Entity Framework Core + PostgreSQL
- JWT Authentication
- Swagger UI

## Team Rules
- Do not push directly to `main`
- Always create a feature branch
- Create a Pull Request before merging

## Getting Started

### Backend
```bash
cd LearnTrackAPI
dotnet restore
dotnet build
dotnet run