terraform {
  backend "azurerm" {
    resource_group_name  = "rg-agrivo-tfstate"
    storage_account_name = "stagrivotfstate"
    container_name       = "tfstate"
    key                  = "dev.terraform.tfstate"
  }
}
