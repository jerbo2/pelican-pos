import { Dayjs } from "dayjs";

interface PricingDependency {
    name: string;
    values: Record<string, Record<string, string>>;
}

type PricingConfig = {
    affectsPrice: boolean;
    isBasePrice?: boolean;
    dependsOn: PricingDependency;
    priceFactor?: string;
    priceBy?: string;
    constantValue?: string;
    perOptionMapping?: Record<string, string>;
}

type FormValue = {
    label: string,
    value: string
}

type FormComponentConfig = {
    label: string;
    type: string;
    order: number;
    options: string[];
    pricing_config: PricingConfig;
}

interface InventoryDependency {
    name: string;
    amounts: Record<string, string>;
}

interface InventoryDecrementDependency {
    names: Array<string>;
    amounts: Record<string, string | Record<string, string>>;
}

type InventoryConfig = {
    manageItemInventory: boolean;
    dependsOn: InventoryDependency;
    decrementDependsOn: InventoryDecrementDependency;
    decrementer: string;
}

type Item = {
    name: string;
    form_cfg: FormComponentConfig[];
    category_id: number;
    id: number;
    tax_rate: number;
    inventory_config: InventoryConfig;
}

type Category = {
    id: number;
    name: string;
    proper_name: string
}

interface CategoryWithItems extends Category {
    items: Item[];
}

type Configuration = {
    label: string;
    value: string;
}

type OrderItems = {
    id: number,
    item_name: string;
    item_id: number;
    category_name: string;
    configurations: Configuration[];
    quantity: number;
    price: number;
    tax: number;
    printed: boolean;
}

interface AdditionalOrderInfo {
    customer_name?: string;
    customer_phone_number?: string;
    complete_at?: Dayjs | null;
}

interface Transaction {
    id?: number;
    payment_method?: string;
    total_non_taxable?: number;
    total_taxable?: number;
    collected_tax?: number;
    total_amount?: number;
    cash_given?: number;
    change_given?: number;
    transaction_date?: string;
  }
  

type Order = AdditionalOrderInfo & {
    id: number;
    status: string;
    created_at: string;
    transaction: Transaction;
}

export type { PricingDependency, PricingConfig, FormValue, FormComponentConfig, Item, Category, CategoryWithItems, OrderItems, Order, AdditionalOrderInfo, Transaction, InventoryConfig, InventoryDependency, InventoryDecrementDependency}