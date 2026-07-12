output "resource_group_name" {
  description = "Resource group created for the dev environment."
  value       = module.network.resource_group_name
}

output "virtual_network_name" {
  description = "Virtual network created for the dev environment."
  value       = module.network.virtual_network_name
}

output "aks_subnet_id" {
  description = "AKS subnet ID for the dev environment."
  value       = module.network.aks_subnet_id
}

output "private_endpoint_subnet_id" {
  description = "Private endpoint subnet ID for the dev environment."
  value       = module.network.private_endpoint_subnet_id
}

output "aks_cluster_name" {
  description = "Name of the dev AKS cluster."
  value       = module.aks.cluster_name
}

output "aks_node_resource_group" {
  description = "Node resource group for dev AKS."
  value       = module.aks.node_resource_group
}

output "key_vault_csi_client_id" {
  value = module.aks.key_vault_secrets_provider_client_id
}

output "key_vault_name" {
  description = "Name of the dev Key Vault."
  value       = module.keyvault.key_vault_name
}

output "key_vault_uri" {
  description = "URI of the dev Key Vault."
  value       = module.keyvault.key_vault_uri
}

output "postgres_server_name" {
  description = "Name of the dev PostgreSQL server."
  value       = module.database.postgres_server_name
}

output "postgres_server_fqdn" {
  description = "FQDN of the dev PostgreSQL server."
  value       = module.database.postgres_server_fqdn
}

output "database_name" {
  description = "Name of the dev application database."
  value       = module.database.database_name
}
