// BVI Foreign Operator Permit (FOP) System - Azure Infrastructure
// Main Bicep template for deploying all Azure resources

targetScope = 'resourceGroup'

@description('Environment name (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Base name for resources')
param baseName string = 'fopsystem'

@description('SQL Server administrator login')
@secure()
param sqlAdminLogin string

@description('SQL Server administrator password')
@secure()
param sqlAdminPassword string

@description('App Service SKU')
param appServiceSku string = environment == 'prod' ? 'P1v3' : 'B1'

@description('SQL Database SKU')
param sqlDatabaseSku string = environment == 'prod' ? 'S2' : 'S0'

// Variables
var resourceSuffix = '${baseName}-${environment}-${uniqueString(resourceGroup().id)}'
var tags = {
  Environment: environment
  Application: 'FOP System'
  Department: 'BVI Civil Aviation'
}

// Key Vault
module keyVault 'modules/keyvault.bicep' = {
  name: 'keyVault'
  params: {
    name: 'kv-${resourceSuffix}'
    location: location
    tags: tags
  }
}

// Storage Account
module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    name: replace('st${resourceSuffix}', '-', '')
    location: location
    tags: tags
    keyVaultName: keyVault.outputs.name
  }
}

// Service Bus
module serviceBus 'modules/servicebus.bicep' = {
  name: 'serviceBus'
  params: {
    name: 'sb-${resourceSuffix}'
    location: location
    tags: tags
    keyVaultName: keyVault.outputs.name
  }
}

// SQL Server and Database
module sql 'modules/sql.bicep' = {
  name: 'sql'
  params: {
    serverName: 'sql-${resourceSuffix}'
    databaseName: 'sqldb-fop-${environment}'
    location: location
    tags: tags
    adminLogin: sqlAdminLogin
    adminPassword: sqlAdminPassword
    sku: sqlDatabaseSku
    keyVaultName: keyVault.outputs.name
  }
}

// Application Insights
module appInsights 'modules/appinsights.bicep' = {
  name: 'appInsights'
  params: {
    name: 'appi-${resourceSuffix}'
    location: location
    tags: tags
  }
}

// App Service Plan
module appServicePlan 'modules/appserviceplan.bicep' = {
  name: 'appServicePlan'
  params: {
    name: 'asp-${resourceSuffix}'
    location: location
    tags: tags
    sku: appServiceSku
  }
}

// API App Service
module apiApp 'modules/appservice.bicep' = {
  name: 'apiApp'
  params: {
    name: 'app-api-${resourceSuffix}'
    location: location
    tags: tags
    appServicePlanId: appServicePlan.outputs.id
    appInsightsInstrumentationKey: appInsights.outputs.instrumentationKey
    appInsightsConnectionString: appInsights.outputs.connectionString
    keyVaultName: keyVault.outputs.name
    appSettings: [
      {
        name: 'ASPNETCORE_ENVIRONMENT'
        value: environment == 'prod' ? 'Production' : 'Development'
      }
      {
        name: 'ConnectionStrings__DefaultConnection'
        value: '@Microsoft.KeyVault(VaultName=${keyVault.outputs.name};SecretName=SqlConnectionString)'
      }
      {
        name: 'AzureStorage__ConnectionString'
        value: '@Microsoft.KeyVault(VaultName=${keyVault.outputs.name};SecretName=StorageConnectionString)'
      }
      {
        name: 'ServiceBus__ConnectionString'
        value: '@Microsoft.KeyVault(VaultName=${keyVault.outputs.name};SecretName=ServiceBusConnectionString)'
      }
    ]
  }
}

// Web App Service (Static Web App for React)
module webApp 'modules/staticwebapp.bicep' = {
  name: 'webApp'
  params: {
    name: 'stapp-web-${resourceSuffix}'
    location: location
    tags: tags
    apiAppUrl: apiApp.outputs.url
  }
}

// Outputs
output keyVaultName string = keyVault.outputs.name
output keyVaultUri string = keyVault.outputs.uri
output storageAccountName string = storage.outputs.name
output serviceBusNamespace string = serviceBus.outputs.namespace
output sqlServerFqdn string = sql.outputs.serverFqdn
output sqlDatabaseName string = sql.outputs.databaseName
output appInsightsInstrumentationKey string = appInsights.outputs.instrumentationKey
output apiAppUrl string = apiApp.outputs.url
output webAppUrl string = webApp.outputs.url
