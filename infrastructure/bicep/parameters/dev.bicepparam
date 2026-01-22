using './main.bicep'

param environment = 'dev'
param baseName = 'fopsystem'
param appServiceSku = 'B1'
param sqlDatabaseSku = 'S0'

// These should be provided at deployment time
param sqlAdminLogin = ''
param sqlAdminPassword = ''
