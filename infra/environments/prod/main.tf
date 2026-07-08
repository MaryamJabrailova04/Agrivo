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
