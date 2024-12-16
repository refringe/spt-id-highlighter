export interface ILocationBase {
    AccessKeys: string[];
    AccessKeysPvE: string[];
    AirdropParameters?: IAirdropParameter[];
    Area: number;
    AveragePlayTime: number;
    AveragePlayerLevel: number;
    Banners: object[];
    BossLocationSpawn: IBossLocationSpawn[];
    BotAssault: number;
    /** Weighting on how likely a bot will be Easy difficulty */
    BotEasy: number;
    /** Weighting on how likely a bot will be Hard difficulty */
    BotHard: number;
    /** Weighting on how likely a bot will be Impossible difficulty */
    BotImpossible: number;
    BotLocationModifier: object;
    BotMarksman: number;
    /** Maximum Number of bots that are currently alive/loading/delayed */
    BotMax: number;
    /** Is not used in 33420 */
    BotMaxPlayer: number;
    /** Is not used in 33420 */
    BotMaxTimePlayer: number;
    /** Does not even exist in the client in 33420 */
    BotMaxPvE: number;
    /** Weighting on how likely a bot will be Normal difficulty */
    BotNormal: number;
    /** How many bot slots that need to be open before trying to spawn new bots. */
    BotSpawnCountStep: number;
    /** How often to check if bots are spawn-able. In seconds */
    BotSpawnPeriodCheck: number;
    /** The bot spawn will toggle on and off in intervals of Off(Min/Max) and On(Min/Max) */
    BotSpawnTimeOffMax: number;
    BotSpawnTimeOffMin: number;
    BotSpawnTimeOnMax: number;
    BotSpawnTimeOnMin: number;
    /** How soon bots will be allowed to spawn */
    BotStart: number;
    /** After this long bots will no longer spawn */
    BotStop: number;
    Description: string;
    DisabledForScav: boolean;
    DisabledScavExits: string;
    Enabled: boolean;
    EnableCoop: boolean;
    GlobalLootChanceModifier: number;
    GlobalLootChanceModifierPvE: number;
    GlobalContainerChanceModifier: number;
    IconX: number;
    IconY: number;
    Id: string;
    Insurance: boolean;
    IsSecret: boolean;
    Locked: boolean;
    Loot: object[];
    MatchMakerMinPlayersByWaitTime: object[];
    MaxBotPerZone: number;
    MaxDistToFreePoint: number;
    MaxPlayers: number;
    MinDistToExitPoint: number;
    MinDistToFreePoint: number;
    MinMaxBots: object[];
    MinPlayers: number;
    MaxCoopGroup: number;
    Name: string;
    NonWaveGroupScenario: object;
    NewSpawn: boolean;
    OcculsionCullingEnabled: boolean;
    OldSpawn: boolean;
    OpenZones: string;
    Preview: object;
    PlayersRequestCount: number;
    RequiredPlayerLevel?: number;
    RequiredPlayerLevelMin?: number;
    RequiredPlayerLevelMax?: number;
    MinPlayerLvlAccessKeys: number;
    PmcMaxPlayersInGroup: number;
    ScavMaxPlayersInGroup: number;
    Rules: string;
    SafeLocation: boolean;
    Scene: object;
    SpawnPointParams: object[];
    UnixDateTime: number;
    _Id: string;
    doors: object[];
    EscapeTimeLimit: number;
    EscapeTimeLimitCoop: number;
    EscapeTimeLimitPVE: number;
    Events: object;
    exit_access_time: number;
    ForceOnlineRaidInPVE: boolean;
    exit_count: number;
    exit_time: number;
    exits: object[];
    filter_ex: string[];
    limits: object[];
    matching_min_seconds: number;
    GenerateLocalLootCache: boolean;
    maxItemCountInLocation: object[];
    sav_summon_seconds: number;
    tmp_location_field_remove_me: number;
    transits: object[];
    users_gather_seconds: number;
    users_spawn_seconds_n: number;
    users_spawn_seconds_n2: number;
    users_summon_seconds: number;
    waves: object[];
}

export interface IAirdropParameter {
    AirdropPointDeactivateDistance: number;
    MinPlayersCountToSpawnAirdrop: number;
    PlaneAirdropChance: number;
    PlaneAirdropCooldownMax: number;
    PlaneAirdropCooldownMin: number;
    PlaneAirdropEnd: number;
    PlaneAirdropMax: number;
    PlaneAirdropStartMax: number;
    PlaneAirdropStartMin: number;
    UnsuccessfulTryPenalty: number;
}

export interface IBossLocationSpawn {
    BossChance: number;
    BossDifficult: string;
    BossEscortAmount: string;
    BossEscortDifficult: string;
    BossEscortType: string;
    BossName: string;
    BossPlayer: boolean;
    BossZone: string;
    RandomTimeSpawn: boolean;
    Time: number;
    TriggerId: string;
    TriggerName: string;
    Delay?: number;
    DependKarma?: boolean;
    DependKarmaPVE?: boolean;
    ForceSpawn?: boolean;
    IgnoreMaxBots?: boolean;
    Supports?: object[];
    sptId?: string;
    spawnMode: string[];
}
