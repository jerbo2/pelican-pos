type DependencyType = 'self' | 'external';

interface Dependency {
    name: string;
    values: Record<string, number>;
}

type PricingConfig = {
    affectsPrice: boolean;
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
    category_name: string;
    configurations: Configuration[];
    quantity: number;
    price: number;
}

type Order = {
    id: number;
    status: string;
    created_at: string;
}

export type { Dependency, PricingConfig, FormValue, FormComponentConfig, Item, Category, CategoryWithItems, OrderItems, Order}