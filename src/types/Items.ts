import { IAirdropParameter } from "./ILocationBase";

export interface Items {
    [id: string]: ItemDetails;
}

export interface ItemDetails {
    Name: string;
    ShortName: string;

    // Generic
    Type?: ItemDetailType;
    DetailLink?: string;
    Parent?: string;
    ParentID?: string;
    ParentDetailLink?: string;
    FleaBlacklisted?: boolean;
    QuestItem?: boolean;
    Weight?: number;

    // Ammo
    Caliber?: string;
    Damage?: number;
    ArmorDamage?: number;
    PenetrationPower?: number;

    // Traders
    Currency?: string;
    UnlockedByDefault?: boolean;

    // Customization Items
    Description?: string;
    BodyPart?: string;
    Sides?: string;
    IntegratedArmorVest?: boolean;
    AvailableAsDefault?: boolean;
    PrefabPath?: string;

    // Locations
    Id?: string;
    AirdropChance?: number;
    EscapeTimeLimit?: number;
    Insurance?: boolean;
    BossSpawns?: string;

    // Quests
    Trader?: string;
    TraderId?: string;
    TraderLink?: string;
    QuestType?: string;
}

export enum ItemDetailType {
    ITEM = "Item",
    AMMO = "Ammo",
    TRADER = "Trader",
    CUSTOMIZATION = "Customization",
    LOCATION = "Location",
    QUEST = "Quest",
}
