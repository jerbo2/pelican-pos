type FormComponentConfig = {
    label: string;
    type: string;
    order: number;
    options: string[];
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

export type { FormComponentConfig, Item, Category, CategoryWithItems }