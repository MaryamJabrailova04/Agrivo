module "network" {
  source = "../../modules/network"

  project_name                             = var.project_name
  environment                              = var.environment
  location                                 = var.location
  address_space                            = var.address_space
  aks_subnet_address_prefixes              = var.aks_subnet_address_prefixes
  private_endpoint_subnet_address_prefixes = var.private_endpoint_subnet_address_prefixes
  tags                                     = var.tags
}

module "aks" {
  source = "../../modules/aks"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = module.network.resource_group_name
  kubernetes_version  = var.kubernetes_version
  dns_prefix          = "${var.project_name}-${var.environment}"
  aks_subnet_id       = module.network.aks_subnet_id
  node_vm_size        = var.node_vm_size
  node_count          = var.node_count
  min_node_count      = var.min_node_count
  max_node_count      = var.max_node_count
  tags                = var.tags
}

module "keyvault" {
  source = "../../modules/keyvault"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = module.network.resource_group_name
  tenant_id           = var.tenant_id
  admin_object_id     = var.admin_object_id
  reader_object_id    = module.aks.key_vault_secrets_provider_object_id

  secrets = {
    "DATABASE-URL" = var.database_url
    "JWT-SECRET"   = var.jwt_secret
  }

  tags = var.tags
}


module "database" {
  source = "../../modules/database"

  project_name            = var.project_name
  environment             = var.environment
  location                = var.location
  resource_group_name     = module.network.resource_group_name
  virtual_network_id      = module.network.virtual_network_id
  delegated_subnet_id     = module.network.database_subnet_id
  postgres_admin_username = var.postgres_admin_username
  postgres_admin_password = var.postgres_admin_password
  postgres_sku_name       = var.postgres_sku_name
  postgres_storage_mb     = var.postgres_storage_mb
  tags                    = var.tags
}
  module "network" {
  source = "../../modules/network"

  project_name                             = var.project_name
  environment                              = var.environment
  location                                 = var.location
  address_space                            = var.address_space
  aks_subnet_address_prefixes              = var.aks_subnet_address_prefixes
  private_endpoint_subnet_address_prefixes = var.private_endpoint_subnet_address_prefixes
  tags                                     = var.tags
}

module "aks" {
  source = "../../modules/aks"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = module.network.resource_group_name
  kubernetes_version  = var.kubernetes_version
  dns_prefix          = "${var.project_name}-${var.environment}"
  aks_subnet_id       = module.network.aks_subnet_id
  node_vm_size        = var.node_vm_size
  node_count          = var.node_count
  min_node_count      = var.min_node_count
  max_node_count      = var.max_node_count
  tags                = var.tags
}

module "keyvault" {
  source = "../../modules/keyvault"

  project_name        = var.project_name
  environment         = var.environment
  location            = var.location
  resource_group_name = module.network.resource_group_name
  tenant_id           = var.tenant_id
  admin_object_id     = var.admin_object_id
  reader_object_id    = module.aks.key_vault_secrets_provider_object_id

  secrets = {
    "DATABASE-URL" = var.database_url
    "JWT-SECRET"   = var.jwt_secret
  }

  tags = var.tags
}


module "database" {
  source = "../../modules/database"

  project_name            = var.project_name
  environment             = var.environment
  location                = var.location
  resource_group_name     = module.network.resource_group_name
  virtual_network_id      = module.network.virtual_network_id
  delegated_subnet_id     = module.network.database_subnet_id
  postgres_admin_username = var.postgres_admin_username
  postgres_admin_password = var.postgres_admin_password
  postgres_sku_name       = var.postgres_sku_name
  postgres_storage_mb     = var.postgres_storage_mb
  tags                    = var.tags
}
  
