resource "azurerm_resource_group" "this" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location
  tags     = var.tags

  lifecycle {
    # Resource groups can contain resources from other Azure regions. Keep an
    # existing group in place when the workload region must be changed.
    ignore_changes = [location]
  }
}

resource "azurerm_virtual_network" "this" {
  name                = "vnet-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = azurerm_resource_group.this.name
  address_space       = var.address_space
  tags                = var.tags
}

resource "azurerm_subnet" "aks" {
  name                 = "snet-aks-${var.environment}"
  resource_group_name  = azurerm_resource_group.this.name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = var.aks_subnet_address_prefixes

  lifecycle {
    # Recreate child subnets when a regional VNet replacement occurs. Azure
    # removes them with the old VNet even if their Terraform arguments match.
    replace_triggered_by = [azurerm_virtual_network.this.id]
  }
}

resource "azurerm_subnet" "database" {
  name                 = "snet-postgres-${var.environment}"
  resource_group_name  = azurerm_resource_group.this.name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = var.private_endpoint_subnet_address_prefixes

  delegation {
    name = "postgres-flexible-server"

    service_delegation {
      name    = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }

  lifecycle {
    # See the AKS subnet note above; this also prevents PostgreSQL from being
    # started against a stale subnet ID after a region migration.
    replace_triggered_by = [azurerm_virtual_network.this.id]
  }
}
