resource "azurerm_kubernetes_cluster" "this" {
  name                = "aks-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = var.dns_prefix
  kubernetes_version  = var.kubernetes_version

  private_cluster_enabled = false

  default_node_pool {
    name                = "system"
    vm_size             = var.node_vm_size
    node_count          = var.node_count
    vnet_subnet_id      = var.aks_subnet_id
    enable_auto_scaling = true
    min_count           = var.min_node_count
    max_count           = var.max_node_count

    only_critical_addons_enabled = false
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin    = "azure"
    network_policy    = "azure"
    load_balancer_sku = "standard"
    outbound_type     = "loadBalancer"
  }

  role_based_access_control_enabled = true

  tags = var.tags
}
