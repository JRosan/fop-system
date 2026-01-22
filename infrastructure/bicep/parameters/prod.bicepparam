using './main.bicep'

param environment = 'prod'
param baseName = 'fopsystem'
param appServiceSku = 'P1v3'
param sqlDatabaseSku = 'S2'

// These should be provided at deployment time
param sqlAdminLogin = ''
param sqlAdminPassword = ''
