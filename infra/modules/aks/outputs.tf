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

output "kube_config" {
  description = "Kubeconfig for the AKS cluster."
  value       = azurerm_kubernetes_cluster.this.kube_config
  sensitive   = true
}
