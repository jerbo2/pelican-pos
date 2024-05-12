type PricingConfig = {
    affectsPrice: boolean;
    priceFactor?: string;
    priceBy?: string;
    constantValue?: string;
    perOptionMapping?: Record<string, string>;
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

export type { PricingConfig, FormComponentConfig, Item, Category, CategoryWithItems }