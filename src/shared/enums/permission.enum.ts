export enum Pages {
  Dashboard = 'dashboard',
  StoreConfiguration = 'store_configuration',
  EmployeeRoleManagement = 'employee_role_management',
  InventoryManagement = 'inventory_management',
  ReportModule = 'report_module',
  Promotion = 'promotion',
  Customer = 'customer',
  Expenses = 'expenses',

  Store = 'store',
  Items = 'items',
  Category = 'category',
  Warehouse = 'warehouse',
  EmployeeManagement = 'employee_management',
  POS = 'pos',
  Settings = 'settings',
  RoleAndPermission = 'role_and_permission',
  Suppliers = 'suppliers',
  PurchaseOrder = 'purchase_order',
  TransferOrder = 'transfer_order',
  StockAdjustment = 'stock_adjustment',

  // Reports
  OrderReport = 'order_report',
  ItemSalesReport = 'item_sales_report',
  InventoryReport = 'inventory_report',
  PurchaseReport = 'purchase_report',
  FinancialReport = 'financial_report',
  ShiftManagement = 'shift_management',

  CompanySetting = 'company_setting',
}

export enum Actions {
  // Employee
  AddEmployee = 'add_employee',
  ViewEmployee = 'view_employee',
  DeleteEmployee = 'delete_employee',
  UpdateEmployee = 'update_employee',

  // Roles and Permissions
  AddRole = 'add_role',
  ViewRoles = 'view_roles',
  DeleteRole = 'delete_role',
  UpdateRole = 'update_role',

  // Store
  AddStore = 'add_store',
  ViewStore = 'view_store',
  DeleteStore = 'delete_store',
  UpdateStore = 'update_store',

  // warehouse
  AddWarehouse = 'add_warehouse',
  ViewWarehouse = 'view_warehouse',
  DeleteWarehouse = 'delete_warehouse',
  UpdateWarehouse = 'update_warehouse',

  // POS
  AddPosDevice = 'add_pos_device',
  ViewPosDevice = 'view_pos_device',
  DeletePosDevice = 'delete_pos_device',
  UpdatePosDevice = 'update_pos_device',

  // Category
  AddCategory = 'add_category',
  ViewCategory = 'view_category',
  DeleteCategory = 'delete_category',
  UpdateCategory = 'update_category',

  // Customer
  AddCustomer = 'add_customer',
  ViewCustomer = 'view_customer',
  DeleteCustomer = 'delete_customer',
  UpdateCustomer = 'update_customer',

  // Expenses
  AddExpense = 'add_expense',
  ViewExpense = 'view_expense',
  DeleteExpense = 'delete_expense',
  UpdateExpense = 'update_expense',

  // Suppliers
  AddSupplier = 'add_supplier',
  ViewSupplier = 'view_supplier',
  DeleteSupplier = 'delete_supplier',
  UpdateSupplier = 'update_supplier',

  // Item
  AddItem = 'add_item',
  ViewItem = 'view_item',
  DeleteItem = 'delete_item',
  UpdateItem = 'update_item',

  // Purchase Order
  AddPurchaseOrder = 'add_purchase_order',
  ViewPurchaseOrder = 'view_purchase_order',
  DeletePurchaseOrder = 'delete_purchase_order',
  UpdatePurchaseOrder = 'update_purchase_order',

  // Transfer Order
  AddTransferOrder = 'add_transfer_order',
  ViewTransferOrder = 'view_transfer_order',
  DeleteTransferOrder = 'delete_transfer_order',
  UpdateTransferOrder = 'update_transfer_order',

  // Stock Adjustment
  AddStockAdjustment = 'add_stock_adjustment',
  ViewStockAdjustment = 'view_stock_adjustment',
  UpdateStockAdjustment = 'update_stock_adjustment',

  // Company Setting
  ViewCompanySetting = 'view_company_setting',
  UpdateCompanySetting = 'update_company_setting',

  // Promotions
  ViewPromotion = 'view_promotion',
  AddPromotion = 'add_promotion',
  UpdatePromotion = 'update_promotion',
}

export const RolePermissions = {
  ...Pages,
  ...Actions,
};

export type RolePermissions =
  (typeof RolePermissions)[keyof typeof RolePermissions];

export const RestrictedPermissions = ['store', 'employee', 'role'];
