export interface ICustomizationItem {
    _id: string;
    _name: string;
    _parent: string;
    _type: string;
    _props: IProps;
    _proto: string;
}

export interface IProps {
    Name: string;
    ShortName: string;
    Description: string;
    Game: string[];
    Side: string[];
    BodyPart: string;
    AvailableAsDefault?: boolean;
    Body: string;
    Hands: string;
    Feet: string;
    Prefab: IPrefab;
    WatchPrefab: IPrefab;
    IntegratedArmorVest: boolean;
    WatchPosition: object;
    WatchRotation: object;
}

export interface IPrefab {
    path: string;
    rcid: string;
}