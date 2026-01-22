// App Service Plan Module

@description('App Service Plan name')
param name string

@description('Azure region')
param location string

@description('Resource tags')
param tags object

@description('SKU name')
param sku string = 'B1'

var skuTier = sku == 'B1' ? 'Basic' : sku == 'S1' ? 'Standard' : 'PremiumV3'

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: name
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: sku
    tier: skuTier
    capacity: 1
  }
  properties: {
    reserved: true // Required for Linux
    zoneRedundant: false
  }
}

output name string = appServicePlan.name
output id string = appServicePlan.id
