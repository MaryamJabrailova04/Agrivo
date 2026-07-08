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
