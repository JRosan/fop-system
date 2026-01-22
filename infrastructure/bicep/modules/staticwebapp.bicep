// Static Web App Module for React Frontend

@description('Static Web App name')
param name string

@description('Azure region')
param location string

@description('Resource tags')
param tags object

@description('API App URL for backend')
param apiAppUrl string

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      appLocation: '/frontend/apps/web'
      apiLocation: ''
      outputLocation: 'dist'
    }
  }
}

// App settings for the static web app
resource staticWebAppConfig 'Microsoft.Web/staticSites/config@2023-01-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    VITE_API_URL: apiAppUrl
  }
}

output name string = staticWebApp.name
output url string = 'https://${staticWebApp.properties.defaultHostname}'
output id string = staticWebApp.id
