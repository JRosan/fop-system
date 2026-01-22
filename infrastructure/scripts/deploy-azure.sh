#!/bin/bash

# BVI FOP System - Azure Deployment Script
# This script deploys the infrastructure to Azure

set -e

# Configuration
ENVIRONMENT="${1:-dev}"
LOCATION="${2:-eastus}"
RESOURCE_GROUP="rg-fopsystem-${ENVIRONMENT}"

echo "=========================================="
echo "BVI FOP System - Azure Deployment"
echo "Environment: ${ENVIRONMENT}"
echo "Location: ${LOCATION}"
echo "Resource Group: ${RESOURCE_GROUP}"
echo "=========================================="

# Check if logged in to Azure
echo ""
echo "Checking Azure CLI login..."
az account show > /dev/null 2>&1 || { echo "Please login to Azure CLI first: az login"; exit 1; }

SUBSCRIPTION=$(az account show --query name -o tsv)
echo "Using subscription: ${SUBSCRIPTION}"

# Prompt for SQL credentials if not set
if [ -z "$SQL_ADMIN_LOGIN" ]; then
    read -p "Enter SQL Admin Login: " SQL_ADMIN_LOGIN
fi

if [ -z "$SQL_ADMIN_PASSWORD" ]; then
    read -s -p "Enter SQL Admin Password: " SQL_ADMIN_PASSWORD
    echo ""
fi

# Create resource group
echo ""
echo "Creating resource group..."
az group create \
    --name "${RESOURCE_GROUP}" \
    --location "${LOCATION}" \
    --tags Environment="${ENVIRONMENT}" Application="FOP System"

# Deploy Bicep template
echo ""
echo "Deploying infrastructure..."
DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group "${RESOURCE_GROUP}" \
    --template-file infrastructure/bicep/main.bicep \
    --parameters environment="${ENVIRONMENT}" \
    --parameters sqlAdminLogin="${SQL_ADMIN_LOGIN}" \
    --parameters sqlAdminPassword="${SQL_ADMIN_PASSWORD}" \
    --query properties.outputs -o json)

# Extract outputs
API_URL=$(echo $DEPLOYMENT_OUTPUT | jq -r '.apiAppUrl.value')
WEB_URL=$(echo $DEPLOYMENT_OUTPUT | jq -r '.webAppUrl.value')
KEY_VAULT=$(echo $DEPLOYMENT_OUTPUT | jq -r '.keyVaultName.value')
SQL_SERVER=$(echo $DEPLOYMENT_OUTPUT | jq -r '.sqlServerFqdn.value')

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo ""
echo "Resources created:"
echo "  Key Vault: ${KEY_VAULT}"
echo "  SQL Server: ${SQL_SERVER}"
echo "  API URL: ${API_URL}"
echo "  Web URL: ${WEB_URL}"
echo ""
echo "Next steps:"
echo "  1. Run database migrations"
echo "  2. Deploy API code"
echo "  3. Deploy web frontend"
echo ""
