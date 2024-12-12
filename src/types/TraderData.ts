export interface ITraderBase {
    refreshTraderRagfairOffers: boolean;
    _id: string;
    availableInRaid: boolean;
    avatar: string;
    balance_dol: number;
    balance_eur: number;
    balance_rub: number;
    buyer_up: boolean;
    currency: string;
    customization_seller: boolean;
    discount: number;
    discount_end: number;
    gridHeight: number;
    sell_modifier_for_prohibited_items?: number;
    insurance: ITraderInsurance;
    items_buy: IItemBuyData;
    items_buy_prohibited: IItemBuyData;
    isCanTransferItems?: boolean;
    transferableItems?: IItemBuyData;
    prohibitedTransferableItems?: IItemBuyData;
    location: string;
    loyaltyLevels: ITraderLoyaltyLevel[];
    medic: boolean;
    name: string;
    nextResupply: number;
    nickname: string;
    repair: ITraderRepair;
    sell_category: string[];
    surname: string;
    unlockedByDefault: boolean;
}

export interface ITraderInsurance {
    availability: boolean;
    excluded_category: string[];
    max_return_hour: number;
    max_storage_time: number;
    min_payment: number;
    min_return_hour: number;
}

export interface IItemBuyData {
    category: string[];
    id_list: string[];
}

export interface ITraderLoyaltyLevel {
    buy_price_coef: number;
    exchange_price_coef: number;
    heal_price_coef: number;
    insurance_price_coef: number;
    minLevel: number;
    minSalesSum: number;
    minStanding: number;
    repair_price_coef: number;
}

export interface ITraderRepair {
    availability: boolean;
    currency: string;
    currency_coefficient: number;
    excluded_category: string[];
    excluded_id_list: string[];
    quality: number;
}
