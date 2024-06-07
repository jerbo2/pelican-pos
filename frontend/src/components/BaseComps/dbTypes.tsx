import { Dayjs } from "dayjs";

interface Dependency {
    name: string;
    values: Record<string, number>;
}

type PricingConfig = {
    affectsPrice: boolean;
    isBasePrice?: boolean;
    dependsOn?: Dependency;
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

type Item = {
    name: string;
    form_cfg: FormComponentConfig[];
    category_id: number;
    id: number;
    tax_rate: number;
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

export type { Dependency, PricingConfig, FormValue, FormComponentConfig, Item, Category, CategoryWithItems, OrderItems, Order, AdditionalOrderInfo}