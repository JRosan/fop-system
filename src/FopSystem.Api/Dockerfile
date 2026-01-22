FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files
COPY FopSystem.sln ./
COPY src/FopSystem.Domain/FopSystem.Domain.csproj src/FopSystem.Domain/
COPY src/FopSystem.Application/FopSystem.Application.csproj src/FopSystem.Application/
COPY src/FopSystem.Infrastructure/FopSystem.Infrastructure.csproj src/FopSystem.Infrastructure/
COPY src/FopSystem.Api/FopSystem.Api.csproj src/FopSystem.Api/

# Restore dependencies
RUN dotnet restore src/FopSystem.Api/FopSystem.Api.csproj

# Copy source code
COPY src/ src/

# Build and publish
WORKDIR /src/src/FopSystem.Api
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "FopSystem.Api.dll"]
