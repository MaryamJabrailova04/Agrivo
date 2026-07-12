output "cluster_name" {
  description = "Name of the AKS cluster."
  value       = azurerm_kubernetes_cluster.this.name
}

output "cluster_id" {
  description = "ID of the AKS cluster."
  value       = azurerm_kubernetes_cluster.this.id
}

output "kubelet_identity_object_id" {
  description = "Object ID of the AKS kubelet identity."
  value       = azurerm_kubernetes_cluster.this.kubelet_identity[0].object_id
}

output "node_resource_group" {
  description = "Auto-created AKS node resource group."
  value       = azurerm_kubernetes_cluster.this.node_resource_group
}

output "key_vault_secrets_provider_client_id" {
  description = "Client ID used by the AKS Key Vault CSI provider."
  value       = azurerm_kubernetes_cluster.this.key_vault_secrets_provider[0].secret_identity[0].client_id
}

output "key_vault_secrets_provider_object_id" {
  description = "Object ID used to grant the AKS Key Vault CSI provider read access."
  value       = azurerm_kubernetes_cluster.this.key_vault_secrets_provider[0].secret_identity[0].object_id
}

output "kube_config" {
  description = "Kubeconfig for the AKS cluster."
  value       = azurerm_kubernetes_cluster.this.kube_config
  sensitive   = true
}
