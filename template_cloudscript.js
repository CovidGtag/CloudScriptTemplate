// TEMPLATE MADE BY COVID_GTAG AT 1/18/2025
// NOT FULLY TESTED SO EXPECT BUGS

/*
    NOTE: USE CTRL + F TO BETTER NAVIGATE THIS TEMPLATE

    Template layout:
        - Consts
        - Classes
        - Handlers
        - Functions
*/

// Consts
const STAFF = {
    "ID": {
        "name": "USERNAME",
        "type": "TYPE"
    },
};

const BAN_DURATIONS = {
    "Owner": 24,
    "Admin": 12,
    "Mod": 4,
    "TrialMod": 2
};

const MOTD = "TEMPLATE MADE BY COVID GTAG";
const VERSION = "VERSION CODE";
const SYNC = "30";

// Security
const API_KEY = "OC|"; // Enter Your Oculus Api Key

// Reporting
var lastReportTime = null;
const ALLOWED_TIME_BETWEEN_REPORTS = 1500; // Milliseconds

// Bans
const MAX_BAN_COUNT = 6; // Maximum amount of bans a player can have before being permanently banned.

const MAPS = ['city', 'forest', 'caves', 'mountains', 'metropolis', 'beach', 'canyon', 'clouds'];
const MODES = ['DEFAULT', 'MINIGAMES', 'COMPETITIVE'];
const GAMEMODES = ['CASUAL', 'INFECTION', 'HUNT', 'PAINTBRAWL', 'GUARDIAN'];

const PLAY_TIME_KEY = "PlayTime";
const LOBBY_JOINTIME_KEY = "LobbyJoinTime";
const LOBBY_LEAVE_KEY = "LobbyLeaveTime";
const LAST_TAG_TIME_KEY = "LastTagTime";
const LAST_TAGGED_TIME_KEY = "LastTaggedTime";
const LAST_REPORT_DATE_KEY = "LastReportDate";

// Color codes for logging
const AQUA = 1752220;
const BLUE = 3447003;
const GREEN = 5763719;
const PURPLE = 10181046;
const GOLD = 15844367;
const ORANGE = 15105570;
const RED = 15158332;
const GREY = 9807270;

// Classes

class Logger {
    constructor() {
        this.color_map = {
            "Error": RED,
            "Info": BLUE,
            "Warning": ORANGE
        }
        this.webhook_map = {
            "Error": "WEBHOOK URL",
            "Info": "WEBHOOK URL",
            "Warning": "WEBHOOK URL"
        }
        this.emoji_map = {
            "Error": "❌",
            "Info": "📝",
            "Warning": "⚠️"
        }
    }

    GetWebhook(type) {
        return this.webhook_map[type] || this.webhook_map["Info"];
    }
    
    GetEmoji(type) {
        return this.emoji_map[type] || this.emoji_map["Info"];
    }

    GetColor(type) {
        return this.color_map[type] || this.color_map["Info"];
    }

    // Add more log types here
    Info(message, fields = null) { this.log(message, fields, "Info"); }
    Error(message, fields = null) { this.log(message, fields, "Error"); }
    Warning(message, fields = null) { this.log(message, fields, "Warning"); }

    log(message, fields = null, type) {
        let webhook = this.GetWebhook(type);
        let emoji = this.GetEmoji(type);
        let color = this.GetColor(type);

        let payload = {
            "content": null,
            "embeds": [
                {
                    "color": color,
                    "fields": fields || [{
                        "name": "Log",
                        "value": message,
                        "inline": true
                    }],
                    "footer": {
                        "text": "Made by Covid_Gtag"
                    },
                    "timestamp": new Date().toISOString(),
                }
            ],
            "username": emoji + " " + type,
            "attachments": []
        }
        try {
            http.request(webhook, "POST", JSON.stringify(payload), "application/json", null);
        } catch {} // Ignore errors
    }
}

const logger = new Logger();

// Handlers
handlers.ReturnCurrentVersion = function (args) {
    return { "ResultCode": 0, "BannedUsers": "0", "MOTD": MOTD, "Version": VERSION, "SynchTime": SYNC, "Message": Version };
}

handlers.ReturnCurrentVersionNew = function (args) {
    return { "ResultCode": 0, "BannedUsers": "0", "MOTD": MOTD, "Version": VERSION, "SynchTime": SYNC, "Message": Version };
}

handlers.ReturnMyOculusHash = function () {
    let orgId = GetOrgId(currentPlayerId);
    let hashKey = "ORGHASH";
    let hashValue = HashValue(hashKey, orgId);
    return { oculusHash: hashValue || "" };
}

handlers.CheckDLCOwnership = function () {
    let dlcMap = {
        "EA": "LBAAE.",
    };
    let inventory = GetInventory(currentPlayerId);
    let hasDLC = false;
    for (const dlc in dlcMap) {
        if (inventory.includes(dlcMap[dlc])) {
            hasDLC = true;
            break;
        }
    }
    return { result: hasDLC };
}

handlers.CheckManyDLCOwnership = function (args) {
    let dlcMap = {
        "EA": "LBAAE.",
    };
    let playerIds = args.PlayFabIDs;
    let ownerShipMap = {};
    playerIds.forEach(playerId => {
        let inventory = GetInventory(playerId);
        let hasDLC = false;
        for (const dlc in dlcMap) {
            if (inventory.includes(dlcMap[dlc])) {
                hasDLC = true;
                break;
            }
        }
        ownerShipMap[playerId] = hasDLC;
    });
    return ownerShipMap;
}

handlers.AddOrRemoveDLCOwnership = function () {
    let dlcMap = {
        "EA": "LBAAE.",
    };
    let inventory = GetInventory(currentPlayerId);
    let hasDLC = false;
    for (const dlc in dlcMap) {
        if (inventory.includes(dlcMap[dlc])) {
            hasDLC = true;
            break;
        }
    }
    return { result: !hasDLC };
}

handlers.PlayerLoggedIn = function () {
    // May make this call security functions
}

handlers.RoomCreated = function (args) {
    ServerSided(args);
    PlayTimeManager("start");
    let Message;
    let fields = [];

    let (map, mode, gameMode) = ExtractProperties(args.CreateOptions.CustomProprties);
    
    let roomPrivate = map === "private";

    if (STAFF.hasOwnProperty(curerntPlayerId)) {
        Message = `Staff member ${STAFF[currentPlayerId].name} has created a room.`;
        fields = [{ 
            "name": "Details",
            "value": `Room Created\nInfo:\nPlayer: ${args.Nickname}\nCode: ${args.GameId}\nRegion: ${args.Region}\nMap: ${map}\nMode: ${mode}\nGame Mode: ${gameMode}\nIsPrivate: ${roomPrivate}`,
            "inline": true
        }, {
            "name": "Staff Member",
            "value": STAFF[currentPlayerId].name,
            "inline": true
        }];

        logger.Info(Message, fields);
    } else {
        Message = `Player ${args.Nickname} has created a room.`;
        fields = [{ 
            "name": "Details",
            "value": `Room Created\nInfo:\nPlayer: ${args.Nickname}\nCode: ${args.GameId}\nRegion: ${args.Region}\nMap: ${map}\nMode: ${mode}\nGame Mode: ${gameMode}\nIsPrivate: ${roomPrivate}`,
            "inline": true
        }];

        logger.Info(Message, fields);
    }
}

handlers.RoomJoined = function (args) {
    ServerSided(args); // CREDITS TO CYCY
    PlayTimeManager("start");
    let Message;
    let fields = [];

    let (map, mode, gameMode) = ExtractProperties(args.CreateOptions.CustomProprties);
    
    let roomPrivate = map === "private";

    if (STAFF.hasOwnProperty(curerntPlayerId)) {
        Message = `Staff member ${STAFF[currentPlayerId].name} has joined a room.`;
        fields = [{ 
            "name": "Details",
            "value": `Room Joined\nInfo:\nPlayer: ${args.Nickname}\nCode: ${args.GameId}\nRegion: ${args.Region}\nMap: ${map}\nMode: ${mode}\nGame Mode: ${gameMode}\nIsPrivate: ${roomPrivate}`,
            "inline": true
        }, {
            "name": "Staff Member",
            "value": STAFF[currentPlayerId].name,
            "inline": true
        }];

        logger.Info(Message, fields);
    } else {
        Message = `Player ${args.Nickname} has joined a room.`;
        fields = [{ 
            "name": "Details",
            "value": `Room Joined\nInfo:\nPlayer: ${args.Nickname}\nCode: ${args.GameId}\nRegion: ${args.Region}\nMap: ${map}\nMode: ${mode}\nGame Mode: ${gameMode}\nIsPrivate: ${roomPrivate}`,
            "inline": true
        }];

        logger.Info(Message, fields);
    }
}

handlers.RoomLeft = function (args) {
    ServerSided(args); // CREDITS TO CYCY
    PlayTimeManager("end");
    PlayTimeManager("update");
    let Message;
    let fields = [];

    let (map, mode, gameMode) = ExtractProperties(args.CreateOptions.CustomProprties);
    
    let roomPrivate = map === "private";

    if (STAFF.hasOwnProperty(curerntPlayerId)) {
        Message = `Staff member ${STAFF[currentPlayerId].name} has left a room.`;
        fields = [{ 
            "name": "Details",
            "value": `Room Left\nInfo:\nPlayer: ${args.Nickname}\nCode: ${args.GameId}\nRegion: ${args.Region}\nMap: ${map}\nMode: ${mode}\nGame Mode: ${gameMode}\nIsPrivate: ${roomPrivate}`,
            "inline": true
        }, {
            "name": "Staff Member",
            "value": STAFF[currentPlayerId].name,
            "inline": true
        }];

        logger.Info(Message, fields);
    } else {
        Message = `Player ${args.Nickname} has left a room.`;
        fields = [{ 
            "name": "Details",
            "value": `Room Left\nInfo:\nPlayer: ${args.Nickname}\nCode: ${args.GameId}\nRegion: ${args.Region}\nMap: ${map}\nMode: ${mode}\nGame Mode: ${gameMode}\nIsPrivate: ${roomPrivate}`,
            "inline": true
        }];

        logger.Info(Message, fields);
    }
}

handlers.RoomClosed = function (args) {
    ServerSided(args); // CREDITS TO CYCY
    PlayTimeManager("end");
    PlayTimeManager("update");
    let Message;
    let fields = [];

    let (map, mode, gameMode) = ExtractProperties(args.CreateOptions.CustomProprties);
    
    let roomPrivate = map === "private";

    if (STAFF.hasOwnProperty(curerntPlayerId)) {
        Message = `Staff member ${STAFF[currentPlayerId].name} has closed a room.`;
        fields = [{ 
            "name": "Details",
            "value": `Room Closed\nInfo:\nPlayer: ${args.Nickname}\nCode: ${args.GameId}\nRegion: ${args.Region}\nMap: ${map}\nMode: ${mode}\nGame Mode: ${gameMode}\nIsPrivate: ${roomPrivate}`,
            "inline": true
        }, {
            "name": "Staff Member",
            "value": STAFF[currentPlayerId].name,
            "inline": true
        }];

        logger.Info(Message, fields);
    } else {
        Message = `Player ${args.Nickname} has closed a room.`;
        fields = [{ 
            "name": "Details",
            "value": `Room Closed\nInfo:\nPlayer: ${args.Nickname}\nCode: ${args.GameId}\nRegion: ${args.Region}\nMap: ${map}\nMode: ${mode}\nGame Mode: ${gameMode}\nIsPrivate: ${roomPrivate}`,
            "inline": true
        }];

        logger.Info(Message, fields);
    }
}

handlers.RoomEventRaised = function (args) {
    let data = args.Data;
    let evCode = args.EvCode;

    switch (data.eventType) {
        default:
            logger.Info(`Room Event Raised\nEvent Type: ${data.eventType}\nData: ${JSON.stringify(data)}`);
            break;
    }
    switch (evCode) {
        case 2:
            let tagger = data[0];
            let tagged = data[1];
            let payload = {
                'type': 'update',
                'taggerId': tagger,
                'taggedId': tagged
            };
            MMRManager(payload); // Made By Covid_Gtag
            break;
        case 9:
            ServerSided(args, "ConcatUpdate");
            break;
        case 10:
        case 199:
            UpdatePlayerGroupCosmetics();
            break;
        case 50:
            // Reporting
            submitReport(currentPlayerId);
            if (STAFF.hasOwnProperty(currentPlayerId)) {
                banPlayer(data[0], "BANNED BY: " + GetUserNameFromPlayerId(currentPlayerId) + " FOR " + BanReason(data[1]), ROLE_DURATIONS[STAFF[currentPlayerId]['type']] || 2);
                logger.Info(`Staff member ${STAFF[currentPlayerId].name} has banned player ${GetUserNameFromPlayerId(data[0])} for ${BanReason(data[1])}`)
            }
            break;
        default:
            logger.Info(`Room Event Raised\nEvent Code: ${evCode}\nData: ${JSON.stringify(data)}`);
            break;
    }
}

handlers.CovidTagAuth = function() {
    let userResult;
    try {
        userResult = server.GetUserAccountInfo({ PlayFabId: currentPlayerId });
    } catch (error) {
        // Return early as this normally means the user is banned
        return;
    }

    const isBanned = userResult?.UserInfo?.TitleInfo?.isBanned ?? false;

    if (isBanned) {
        try {
            const banInfo = server.GetUserBans({ PlayFabId: currentPlayerId });
            if (banInfo.BanData && banInfo.BanData.Reason) {
                const banReason = banInfo.BanData.Reason;
                logger.Info(`Player ${currentPlayerId} is banned for reason: ${banReason}`);
                if (banReason.toString() === "SPAMMER") {
                    logger.Info(`Banning player ${currentPlayerId} for suspected spamming`);
                    banAndDeletePlayer(currentPlayerId, "BANNED FOR SUSPECTED PLAYFAB SPAM");
                    return;
                }
            } else {
                logger.Info(`No ban information found for player ${currentPlayerId}`);
            }
        } catch (error) {
            logger.Info("❌ Error handling player authentication.", error);
        }
    }

    if (userResult?.UserInfo?.CustomIdInfo?.CustomId) {
        const customId = userResult.UserInfo.CustomIdInfo.CustomId;

        if (customId.startsWith("OCULUS")) {
            const validChars = '0123456789';
            const isValidContent = /^[0-9]+$/.test(customId.substring(6));
            if (!isValidContent) {
                banAndDeletePlayer(currentPlayerId, "BANNED FOR INVALID CHARACTERS AFTER OCULUS");
                logger.Info(`❌ Player ${currentPlayerId} banned due to invalid CustomId`);
                return;
            }
        } else {
            banAndDeletePlayer(currentPlayerId, "BANNED FOR INVALID ID PREFIX");
            logger.Info(`❌ Player ${currentPlayerId} banned due to incorrect CustomId format`);
            return;
        }

        const maxLength = 23;
        const minLength = 20;
        if (customId.length <= minLength || customId.length >= maxLength) {
            banAndDeletePlayer(currentPlayerId, "BANNED FOR OUT OF RANGE CUSTOM ID LENGTH");
            logger.Info(`❌ Player ${currentPlayerId} banned for invalid CustomId length`);
            return;
        }

        switch (customId) {
            case "OCULUS0":
                banAndDeletePlayer(currentPlayerId, "BANNED FOR MODDING THE GAME");
                logger.Info(`Player ${currentPlayerId} banned for using lemon loader.`);
                break;
            default:
                break;
        }
    } else {
        banAndDeletePlayer(currentPlayerId, "BANNED FOR MISSING CUSTOM ID");
    }

    try {
        SetPlayerReadOnlyData(currentPlayerId, {"Verified": true});
    } catch (error) {
        logger.Info(`❌ Failed to update user data for player ${currentPlayerId}: ${error.message}`);
    }
};

handlers.CheckVerificationStatus = function() {
    try {
        const isVerified = GetPlayerReadOnlyData(currentPlayerId, "Verified")?.Verified?.Value;
        
        if (isVerified) {
            logger.Info(`✅ Player ${currentPlayerId} is verified.`);
        } else {
            logger.Info(`❌ Player ${currentPlayerId} is not verified.`);
            banAndDeletePlayer(currentPlayerId, "BANNED FOR NOT BEING VERIFIED");
            return;
        }

    } catch (error) {
        logger.Info(`Error checking verification status for player ${currentPlayerId}: ${error.message}`);
    }
};

handlers.VerifyOrgId = function() {
    let userResult;
    try {
        userResult = server.GetUserAccountInfo({ PlayFabId: currentPlayerId });
    } catch (error) {
        logger.Info(`❌ Failed to get user account info for player ${currentPlayerId}: ${error.message}`);
        return;
    }

    const customId = userResult.UserInfo.CustomIdInfo?.CustomId;
    var orgId = customId ? customId.slice(6) : null;

    ValidateOrgID(orgId);
};

handlers.TestReportSystem = function() {
    submitReport(currentPlayerId);
};

// Functions

// Helpers
function GetInventory(playerId) {
    let inventoryItems;
    try {
        inventoryItems = server.GetUerInventory({ PlayFabId: playerId }).Inventory;
    } catch (error) {
        logger.Info("Error in GetInventory: " + JSON.stringify(error));
        return "";
    }
    let inventoryString = inventoryItems.Reduce((acc, item) => {
        if (item.ItemId !== null && item.ItemId !== undefined) {
            acc += item.ItemId.toString();
        }
        return acc;
    }, "");
    return inventoryString;
};

function BanReason(index) {
    switch (index) {
        case 0:
            return "HATE SPEECH";
        case 1:
            return "CHEATING";
        case 2:
            return "TOXICITY";
        case 3:
            return "CANCEL";
        default:
            return "UNKNOWN";
    }
}

function GetOrgId(playerId) {
    let result;
    try {
        result = server.GetUserAccountInfo({ PlayFabId: playerId }).UserInfo.CustomIdInfo?.CustomId;
    } catch (error) {
        logger.Info("Error in GetOrgId: " + JSON.stringify(error));
        return null;
    }
    let orgId = result ? result.slice(6) : null;
    return orgId;
};

// Credits 
// https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0?permalink_comment_id=4466902#gistcomment-4466902

String.prototype.hashCode = function(){
    if (Array.prototype.reduce){
        return this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
    } 
    var hash = 0;
    if (this.length === 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var character  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+character;
        hash = hash & hash;
    }
    return hash;
}

function HashValue(value) {
    return String(value).hashCode();
}

function ExtractProperties(properties) {
    let finalValue = {};
    let value = properties["gameMode"];
    let currentMap;
    let currentMode;
    let currentGameMode;
    // go through each map and check if the value includes it
    MAPS.forEach(map => {
        if (value.includes(map)) {
            currentMap = map;
            finalValue["map"] = currentMap;
        } else if (value.includes("private")) {
            finalValue["map"] = "private";
        }
    })
    // go through each mode and check if the value includes it
    MODES.forEach(mode => {
        if (value.includes(mode)) {
            currentMode = mode;
            finalValue["mode"] = currentMode;
        }
    })
    // go through each gameMode and check if the value includes it
    GAMEMODES.forEach(gm => {
        if (value.includes(gm)) {
            currentGameMode = gm;
            finalValue["gameMode"] = currentGameMode;
        }
    })
    return finalValue;
}

function UpdatePlayerGroupCosmetics () {
    // CREDITS TO CYCY

    let groupID = currentPlayerId + "Inventory";

    try {
        server.GetSharedGroupData({
            SharedGroupId: groupID
        });
    } catch {
        server.CreateSharedGroup({
            SharedGroupId: groupID
        });
        server.AddSharedGroupMembers({
            SharedGroupId: groupID,
            PlayFabIds: [currentPlayerId]
        });
    } finally {
        server.UpdateSharedGroupData({
            SharedGroupId: groupID,
            Data: {
                "Inventory": handlers.GetPlayerInventory()
            },
            Permission: "Public"
        });
    }
    return;
}

function ServerSided (args, type = null) {
    // CREDITS TO CYCY
    var useNewSS = false;
    const groupID = args.GameId + args.Region.toUpperCase();
    let inventoryItems = GetInventory(currentPlayerId);
    let id = (useNewSS == false) ? currentPlayerId : args.ActorNr;

    switch (args.Type) {
        case "Create":
            server.CreateSharedGroup({
                "SharedGroupId": groupID
            });
            server.AddSharedGroupMembers({
                "PlayFabIds": [currentPlayerId],
                "SharedGroupId": groupID
            });
            server.UpdateSharedGroupData({
                "SharedGroupId": groupID,
                "Permission": "Public",
                "Data": {
                    [id]: items
                }
            });
            break;
        case "Join":
            server.AddSharedGroupMembers({
                "PlayFabIds": [currentPlayerId],
                "SharedGroupId": groupID
            });
            server.UpdateSharedGroupData({
                "SharedGroupId": groupID,
                "Permission": "Public",
                "Data": {
                    [id]: items
                }
            });
            break;
        case "ClientDisconnect":
        case "TimeoutDisconnect":
            server.UpdateSharedGroupData({
                "SharedGroupId": groupID,
                "Permission": "Public",
                "KeysToRemove": [id]
            });
            server.RemoveSharedGroupMembers({
                "PlayFabIds": [currentPlayerId],
                "SharedGroupId": groupID
            });
            break;
    }
    
    switch (type.toLowerCase()) {
        case "close":
            server.DeleteSharedGroup({
                "SharedGroupId": groupID
            });
            break;
        case "concatupdate":
            server.UpdateSharedGroupData({
                "SharedGroupId": groupID,
                "Permission": "Public",
                "Data": {
                    [id]: items
                }
            });
            break;
        default:
            break;
    }
}

function SetPlayerReadOnlyData(playerId, data) {
    server.UpdateUserReadOnlyData({
        PlayFabId: playerId,
        Data: data,
        Permission: "Private"
    });
}

function GetPlayerReadOnlyData(playerId, key) {
    return server.GetUserReadOnlyData({
        PlayFabId: playerId,
        Keys: [key]
    }).Data;
}

function GetUserName() {
    return server.GetUserAccountInfo({
        PlayFabId: currentPlayerId
    }).UserInfo.TitleInfo.DisplayName;
};

function GetUserNameFromPlayerId(playerId) {
    return server.GetUserAccountInfo({
        PlayFabId: playerId
    }).UserInfo.TitleInfo.DisplayName;
};

// Report Functions Made By Covid_Gtag
function getTimeComponents(date) {
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();

    return {
        seconds: seconds,
        milliseconds: milliseconds
    };
}

function updateReportData(playFabId, reportDate) {
    server.UpdateUserReadOnlyData({
        PlayFabId: playFabId,
        Data: {
			LastReportDate: reportDate.toISOString()
        }
    });
}

function handleUserReport(playFabId, lastReportTime, isFirstReport) {
    const currentTime = new Date();
    const timeComponentsCurrent = getTimeComponents(currentTime);
    const timeComponentsLastReport = getTimeComponents(lastReportTime);

    if (timeComponentsCurrent.seconds === timeComponentsLastReport.seconds && timeComponentsCurrent.milliseconds === timeComponentsLastReport.milliseconds) {
        return;
    }

    const combinedTimeCurrent = timeComponentsCurrent.seconds * 1000 + timeComponentsCurrent.milliseconds;
    const combinedTimeLastReport = timeComponentsLastReport.seconds * 1000 + timeComponentsLastReport.milliseconds;

    const timeDifferenceMs = Math.abs(combinedTimeCurrent - combinedTimeLastReport);

    const isBanned = server.GetUserAccountInfo({ PlayFabId: playFabId }).UserInfo.TitleInfo.isBanned;

    if (!isFirstReport && timeDifferenceMs < ALLOWED_TIME_BETWEEN_REPORTS && !isBanned) {
        logger.Info(`USER ${GetUserName()} BANNED FOR SPAM REPORTING`);
        IncrementalBan(playFabId, "SPAM REPORTING", 1);
    }

    lastReportTime = new Date();

    updateReportData(playFabId, lastReportTime);
}

function loadReports() {
    let reportDate = new Date();
    let isFirstReport = false;

    var userReportDataResponse = GetPlayerReadOnlyData(currentPlayerId, LAST_REPORT_DATE_KEY);

    if (!userReportDataResponse.LastReportDate) {
        reportDate = new Date();
        SetPlayerReadOnlyData(currentPlayerId, { LastReportDate: reportDate.toISOString() });
        isFirstReport = true;
    } else {
        reportDate = new Date(userReportDataResponse.LastReportDate.Value);
    }

    if (!reportDate.getTime()) {
        const defaultData = {
            LastReportDate: reportDate.toISOString()
        };
        SetPlayerReadOnlyData(currentPlayerId, defaultData);
        isFirstReport = true;
    }

    return { reportDate: reportDate, isFirstReport: isFirstReport };
}

function submitReport(playerId) {
    const { reportDate, isFirstReport } = loadReports();
    handleUserReport(playerId, reportDate, isFirstReport);
}

// MMR Functions Made By Covid_Gtag
function setMMR(playerId, mmr) {
    logger.Info(`Player ${GetUserNameFromPlayerId(playerId) ?? playerId} MMR set to ${mmr}`);
    SetPlayerReadOnlyData(playerId, {"MMR": mmr});
}

function getMMR(playerId) {
    let mmrData = GetPlayerReadOnlyData(playerId, "MMR");
    if (mmrData && mmrData.MMR && mmrData.MMR.Value) {
        return Number(mmrData.MMR.Value);
    } else {
        logger.Info(`No MMR data found for player ${playerId}, returning default value 5`);
        return 5; // Default MMR value
    }
}

function calculateMMRChange(taggerId, taggedId) {
    const taggerMMR = getMMR(taggerId);
    const taggedMMR = getMMR(taggedId);

    let mmrDifference = Math.abs(taggerMMR - taggedMMR); // Handle cases where tagged has more making the difference negative

    if (mmrDifference === 0 || mmrDifference === 1) {
        mmrDifference = 2;
    }

    let playTimeStr = GetPlayerReadOnlyData(taggerId, PLAY_TIME_KEY)?.PlayTime?.Value;
    const lastTaggedTime = GetPlayerReadOnlyData(taggerId, LAST_TAGGED_TIME_KEY)?.LastTaggedTime?.Value;

    // Handle cases where playTime is not set (should only happen when player joins a lobby for the first time)
    if (!playTimeStr) {
        playTimeStr = "00:00:00";
    }

    const playTime = playTimeStr.split(":").reduce((acc, time, index) => {
        return acc + (parseInt(time) * Math.pow(60, 2 - index));
    }, 1);

    // Handle cases where lastTaggedTime is not set
    if (!lastTaggedTime) {
        // If not lastTaggedTime isnt set give slightly more mmr as player hasnt been tagged yet
        let playtimeFactor;
        const threshold = 3600;
        if (playTime <= threshold) {
            playtimeFactor = 1;
        } else {
            playtimeFactor = Math.max(0.5, 1 - ((playTime - threshold) / (threshold * 2)));
        }
        
        let mmr = Math.floor((mmrDifference / 2) * playtimeFactor);
        return Math.max(0, Number(mmr));
    }

    const currentTime = Date.now();
    const timeSinceLastTag = (currentTime - lastTaggedTime) / (1000 * 60 * 60);

    let playtimeFactor;
    const threshold = 3600;
    if (playTime <= threshold) {
        playtimeFactor = 1;
    } else {
        playtimeFactor = Math.max(0.5, 1 - ((playTime - threshold) / (threshold * 2)));
    }
    
    const mmrChange = Math.floor((mmrDifference / 2) * playtimeFactor * (1 / (1 + timeSinceLastTag)));
    mmrChange = Math.max(0, mmrChange);

    return Number(mmrChange);
}

function updateMMR(taggerId, taggedId) {
    const taggerMMR = getMMR(taggerId);
    const taggedMMR = getMMR(taggedId);

    const mmrChange = calculateMMRChange(taggerId, taggedId);

    const newTaggerMMR = taggerMMR + mmrChange;
    const newTaggedMMR = Math.max(0, taggedMMR - mmrChange);

    setMMR(taggerId, newTaggerMMR);

    setMMR(taggedId, newTaggedMMR);
}

function MMRManager(args) {
    if (args.type) {
        switch (args.type.toLowerCase()) {
            case "update":
                updateMMR(args.taggerId, args.taggedId);
                break;
            default:
                logger.Info("MMRManager: Invalid type given.");
                break;
        }
    } else {
        logger.Info("MMRManager: No type given.");
    }
}

// Security Functions
function ValidateOrgID(orgId) {
    var url = `https://graph.oculus.com/${orgId}?access_token=${API_KEY}&fields=org_scoped_id`;
    var headers = {};
    var request = "GET";
    var contentType = "application/json";
    
    try {
        var response = http.request(url, request, null, contentType, headers);
        let responseJson;
        responseJson = JSON.parse(response);
        if (responseJson?.org_scoped_id === orgId) {
            logger.Info("✅ Player OrgID Valid");
        } else {
            logger.Info("❌ Player OrgID Invalid");
            banAndDeletePlayer(currentPlayerId, "INVALID ORGID");
        }
    } catch (e) {
        logger.Info(`❌ Error Authing Org ID: ${e.message}`, e.stack);
    }
}

// Ban Functions
function IncrementalBan(playerId, reason, duration) {
    let currentBanCountStr = GetPlayerReadOnlyData(playerId, "BanCount");

    if (!currentBanCountStr || currentBanCountStr?.BanCount === null || currentBanCountStr?.BanCount?.Value === null) {
        logger.Info("Ban count is null.");
        SetPlayerReadOnlyData(playerId, {"BanCount": 1});
    }

    let currentBanCount = Number(currentBanCountStr?.BanCount?.Value);

    if (isNaN(currentBanCount)) {
        currentBanCount = 0;
    }

    let newBanCount = currentBanCount + 1;

    SetPlayerReadOnlyData(playerId, {"BanCount": newBanCount});

    let baseDuration = isNaN(duration) ? 1 : duration;

    let maxDuration = 168;
    let newDuration = baseDuration * newBanCount * 2;

    if (newDuration > maxDuration) {
        newDuration = maxDuration;
    }

    if (newBanCount > MAX_BAN_COUNT) {
        newDuration = NaN; // Permanent ban
        reason = "WARNING FINAL BAN JOIN THE DISCORD TO APPEAL THIS BAN.\nREASON: " + reason;
        logger.Info(`Player: ${GetUserNameFromPlayerId(playerId)} has been permanently banned amount of bans: ${newBanCount}`);
        SetPlayerReadOnlyData(playerId, {"BanCount": 0});
    }

    let message = `${GetUserNameFromPlayerId(playerId)} banned for \nReason: ${reason}\nDuration: ${newDuration} hours`;

    banPlayer(playerId, reason, newDuration, message);
}

function banPlayer(playerId, reason, duration, message) {
	logger.Info(message);

	server.BanUsers({
		Bans: [{ PlayFabId: playerId, Reason: reason, DurationInHours: duration }]
	});
};

function fastBan(reason, duration) {
    server.BanUsers({
        Bans: [{
            PlayFabId: currentPlayerId,
            Reason: reason,
            DurationInHours: duration
        }]
    });
}

function fastUnBan() {
    server.RevokeAllBansForUser({
        PlayFabId: currentPlayerId
    });
}

function banAndDeletePlayer(playerId, reason) {
    logger.Info(`Banning Player: ${playerId} For Reason: ${reason}`);
    try{
        server.BanUsers({
            Bans: [{ PlayFabId: playerId, Reason: reason }]
        });
        server.DeletePlayer({ PlayFabId: playerId });
    }
    catch (error) {
        logger.Info("❌ Failed to ban player.");
    }
};