// Service Bus Module

@description('Service Bus namespace name')
param name string

@description('Azure region')
param location string

@description('Resource tags')
param tags object

@description('Key Vault name for storing connection string')
param keyVaultName string

resource serviceBusNamespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// Queues for FOP System
resource applicationSubmittedQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'application-submitted'
  properties: {
    maxDeliveryCount: 10
    defaultMessageTimeToLive: 'P14D'
    lockDuration: 'PT5M'
    enablePartitioning: false
    deadLetteringOnMessageExpiration: true
  }
}

resource documentUploadedQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'document-uploaded'
  properties: {
    maxDeliveryCount: 10
    defaultMessageTimeToLive: 'P14D'
    lockDuration: 'PT5M'
    enablePartitioning: false
    deadLetteringOnMessageExpiration: true
  }
}

resource paymentProcessedQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'payment-processed'
  properties: {
    maxDeliveryCount: 10
    defaultMessageTimeToLive: 'P14D'
    lockDuration: 'PT5M'
    enablePartitioning: false
    deadLetteringOnMessageExpiration: true
  }
}

resource insuranceExpiryQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'insurance-expiry-notification'
  properties: {
    maxDeliveryCount: 10
    defaultMessageTimeToLive: 'P14D'
    lockDuration: 'PT5M'
    enablePartitioning: false
    deadLetteringOnMessageExpiration: true
  }
}

resource emailNotificationQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'email-notification'
  properties: {
    maxDeliveryCount: 10
    defaultMessageTimeToLive: 'P14D'
    lockDuration: 'PT5M'
    enablePartitioning: false
    deadLetteringOnMessageExpiration: true
  }
}

// Authorization rule for sending/receiving
resource sendListenRule 'Microsoft.ServiceBus/namespaces/AuthorizationRules@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'SendListenPolicy'
  properties: {
    rights: [
      'Send'
      'Listen'
    ]
  }
}

// Store connection string in Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

resource serviceBusConnectionStringSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'ServiceBusConnectionString'
  properties: {
    value: sendListenRule.listKeys().primaryConnectionString
  }
}

output namespace string = serviceBusNamespace.name
output id string = serviceBusNamespace.id
