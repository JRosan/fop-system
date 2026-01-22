using './main.bicep'

param environment = 'staging'
param baseName = 'fopsystem'
param appServiceSku = 'S1'
param sqlDatabaseSku = 'S1'

// These should be provided at deployment time
param sqlAdminLogin = ''
param sqlAdminPassword = ''
