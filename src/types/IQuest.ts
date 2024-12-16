export interface IQuest {
    QuestName?: string;
    _id: string;
    canShowNotificationsInGame: boolean;
    conditions: IQuestConditionTypes;
    description: string;
    failMessageText: string;
    name: string;
    note: string;
    traderId: string;
    location: string;
    image: string;
    type: QuestTypeEnum;
    isKey: boolean;
    restartable: boolean;
    instantComplete: boolean;
    secretQuest: boolean;
    startedMessageText: string;
    successMessageText: string;
    acceptPlayerMessage?: string;
    declinePlayerMessage: string;
    completePlayerMessage?: string;
    templateId?: string;
    rewards: object;
    /** Becomes 'AppearStatus' inside client */
    status?: string | number;
    KeyQuest?: boolean;
    changeQuestMessageText: string;
    /** "Pmc" or "Scav" */
    side: string;
    /** Status of quest to player */
    sptStatus?: object;
}

export interface IQuestConditionTypes {
    Started?: IQuestCondition[];
    AvailableForFinish: IQuestCondition[];
    AvailableForStart: IQuestCondition[];
    Success?: IQuestCondition[];
    Fail: IQuestCondition[];
}

export interface IQuestCondition {
    id: string;
    index?: number;
    compareMethod?: string;
    dynamicLocale: boolean;
    visibilityConditions?: object[];
    globalQuestCounterId?: string;
    parentId?: string;
    target?: string[] | string;
    value?: string | number;
    type?: boolean | string;
    status?: object[];
    availableAfter?: number;
    dispersion?: number;
    onlyFoundInRaid?: boolean;
    oneSessionOnly?: boolean;
    isResetOnConditionFailed?: boolean;
    isNecessary?: boolean;
    doNotResetIfCounterCompleted?: boolean;
    dogtagLevel?: number | string;
    traderId?: string;
    maxDurability?: number | string;
    minDurability?: number | string;
    counter?: object;
    plantTime?: number;
    zoneId?: string;
    countInRaid?: boolean;
    completeInSeconds?: number;
    isEncoded?: boolean;
    conditionType?: string;
}

export enum QuestTypeEnum {
    PICKUP = "PickUp",
    ELIMINATION = "Elimination",
    DISCOVER = "Discover",
    COMPLETION = "Completion",
    EXPLORATION = "Exploration",
    LEVELLING = "Levelling",
    EXPERIENCE = "Experience",
    STANDING = "Standing",
    LOYALTY = "Loyalty",
    MERCHANT = "Merchant",
    SKILL = "Skill",
    MULTI = "Multi",
    WEAPON_ASSEMBLY = "WeaponAssembly",
}
