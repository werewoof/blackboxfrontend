import { createSlice } from "@reduxjs/toolkit";
import { GetBannedUsers, GetGuilds, GetGuildSettings, GetGuildUsers, GetInvite, DeleteInvite, BanUser, KickUser, UnbanUser } from "../../api/guildApi";
import { DeleteAllGuildMsg, GetMsgs, SendMsgs } from "../../api/msgApi";

/*
format for guilds (guildInfo)
{
    Name : string,
    Icon : id, // will be unused for now so its 0
    Invite : "",
    Loaded : bool,
    MsgLimitReached : bool,
    InviteLoading : bool,
    BanKickLoading : bool,
    ClearMsgLoading : bool,
    //investigate additional solutions for data storage in EditMessage
    //use union when converting to typescript
    EditMessage : int | str, //must be set at default -1 to make space for non saved messages
    LastMessageRead : int, //stores last message read defualt 0 but should be set to last message id when received from guilds GET
    LastMesssageReadTime : int, //stores last message read time default 0 but should be set to last message time when received from guilds GET
    UnreadMsgCount : int, //stores unread message count default 0 but should be set to unread message count when received from guilds GET
    DoNotAutoRead : bool, //sets to no auto read if user is not in guild and then sets it back after user marks as read
    Users : [
        {
            Id : int,
            Username : string,
            Icon : int, //unused so its 0 old: profileId
        }
    ],
    Banned : [ //basically banned users
        {
            Id : int,
            Username : string,
            Icon : int.
        }
    ],
    Settings : {
        SaveChat : bool,
        Name : string, //not used
        Icon : int, // not used
    },
    MsgHistory : [
        {
            Id : int,
            RequestId : string, //only used when save chat is not enabled
            Author : {
                Id : int,
                Username : string,
                Icon : int, //unused so its 0 old: profileId

            },
            Content : string,
            Time : int,
            MsgSaved: bool,
            Edited : bool
            Loaded : bool, //could be changed to detect if Author dictionary exists or not
        },
        { //pending message
            RequestId : string,
            Content : string,
            Time : int,
            Failed: bool
        }
    ]
    
}
*/

/* dont mess around with failed and loaded in msg*/

const guildSlice = createSlice({
    name: "guilds",
    initialState: {
        guildInfo: {},
        guildOrder: [], //order list of guilds
        currentGuild: 0, //keep track of current guild in view
        isLoading: false, //keep track of whether or not we are loading from websocket
    }
    , reducers: {
        guildAdd: (state, action) => { //accepts guild : int
            state.guildInfo[action.payload.Id] = { //update the user list later i cant be fucked (backend and frontend)
                Name: action.payload.Name,
                Icon: action.payload.Icon,
                Owner: action.payload.Owner,
                InviteLoading: false,
                BanKickLoading: false,
                ClearMsgLoading: false,
                Loaded: false,
                MsgLimitReached: false,
                LastMsgRead : 0,
                LastMsgReadTime : 0,
                UnreadMsgCount : 0,
                DoNotAutoRead : true,
                EditMessage: -1,
                Invites: [],
                Users: [],
                Banned: [],
                Settings: {},
                MsgHistory: []
            };
            state.guildOrder.push(action.payload.Id);
        },
        guildRemove: (state, action) => { //accepts guild : int
            state.guildInfo[action.payload.Guild] = undefined;
            state.guildOrder = state.guildOrder.filter(guild => guild !== action.payload.Guild)
            state.currentGuild = state.currentGuild !== action.payload.Guild ? state.currentGuild : 0;
        },
        guildSet: (state, action) => { //accepts guildInfo : object<string : object>, guilds : array<int>
            state.guildInfo = action.payload.GuildInfo;
            state.guildOrder = action.payload.GuildOrder;
            //state.currentGuild = action.payload.currentGuild; //most likely will not be stored in database
        },
        guildChange: (state, action) => {
            console.log(action.payload)
            state.guildInfo[action.payload.Guild].Name = action.payload.Name;
            state.guildInfo[action.payload.Guild].Icon = action.payload.Icon;
            //will impliment later
            //state.guildInfo[action.payload.guild].Icon = action.payload.Icon;
        },
        guildReset: (state, action) => {
            state.guildInfo = {};
            state.guildOrder = [];
            state.currentGuild = 0;
        },
        guildSettingsChange: (state, action) => {
            console.log(action.payload);
            state.guildInfo[action.payload.Guild].Settings = action.payload.Settings;
        },
        guildSetInvite: (state, action) => { //accepts invite : string
            state.guildInfo[state.currentGuild].Invites = action.payload.Invite;
        },
        guildRemoveInvite: (state, action) => { //accepts invite : string
            state.guildInfo[state.currentGuild].Invites = state.guildInfo[state.currentGuild].Invites.filter(action.payload.Invite);
        },
        guildCurrentSet: (state, action) => { //accepts guild : int
            state.currentGuild = action.payload.Guild;
        },
        guildUpdateUserList: (state, action) => { //accepts guild : int, userList : array<int>
            state.guildInfo[action.payload.Guild].Users.push(action.payload.User)
        },
        guildRemoveUserList: (state, action) => { //accepts guild : int
            state.guildInfo[action.payload.Guild].Users = state.guildInfo[action.payload.Guild].Users.filter(user => user.Id !== action.payload.Id)
        },
        guildUpdateBannedList: (state, action) => {
            state.guildInfo[action.payload.Guild].Banned.push(action.payload.User);
        },
        guildRemoveBannedList: (state, action) => {
            state.guildInfo[action.payload.Guild].Banned = state.guildInfo[action.payload.Guild].Banned.filter(user => user.Id !== action.payload.Id);
        },
        msgAdd: (state, action) => { //accepts guild : int, msg : object
            const { Guild, RequestId } = action.payload;
            console.log(action.payload);
            console.log(RequestId);
            //idk why Guild in state.guildInfo 
            if (Guild in state.guildInfo) { //removes pending message
                state.guildInfo[Guild].MsgHistory = state.guildInfo[Guild].MsgHistory.filter(msg => msg?.RequestId !== RequestId);
            }
            if (Guild !== state.currentGuild) {
                state.guildInfo[Guild].DoNotAutoRead = true;
            }
            state.guildInfo[action.payload.Guild].MsgHistory.unshift({ ...action.payload, Loaded: true/*, RequestId : undefined*/ });
            state.guildInfo[action.payload.Guild].UnreadMsgCount++;
        },
        msgRemove: (state, action) => { //accepts guild : int, msg : object
            if (action.payload.Id !== 0) {
                state.guildInfo[action.payload.Guild].MsgHistory = state.guildInfo[action.payload.Guild]
                    .MsgHistory.filter(msg => msg.Id !== action.payload.Id);
            } else if (action.payload.RequestId !== "") { //if chat history nonexistant
                state.guildInfo[action.payload.Guild].MsgHistory = state.guildInfo[action.payload.Guild]
                    .MsgHistory.filter(msg => msg.RequestId !== action.payload.RequestId);
            } else { //possibly depreciated might be removed in the future not sure yet
                state.GuildInfo[action.payload.Guild].MsgHistory = state.guildInfo[action.payload.Guild]
                    .MsgHistory.filter(msg => msg.Author.Id !== action.payload.Author);
            }
        },
        msgEditSet: (state, action) => {
            state.guildInfo[state.currentGuild].EditMessage = action.payload.Id; //sets which message is currently being edited
        },
        msgSet: (state, action) => {
            if (action.payload.Id !== 0) {
                state.guildInfo[action.payload.Guild].MsgHistory = state.guildInfo[action.payload.Guild].MsgHistory.map(
                    msg => msg?.Id === action.payload.Id ? { ...msg, Content: action.payload.Content, Edited: true } : msg
                );
            } else if (action.payload.RequestId !== "") {
                state.guildInfo[action.payload.Guild].MsgHistory = state.guildInfo[action.payload.Guild].MsgHistory.map(
                    msg => msg?.RequestId === action.payload.RequestId ? { ...msg, Content: action.payload.Content, Edited: true } : msg
                );
            } else {
                console.log("edited failed")
            }
        },
        msgReadSet : (state, action) => {
            state.guildInfo[state.currentGuild].LastMsgRead = state.guildInfo[state.currentGuild]?.MsgHistory[0]?.Id;
            state.guildInfo[state.currentGuild].UnreadMsgCount = 0;
            state.guildInfo[state.currentGuild].LastMsgReadTime = state.guildInfo[state.currentGuild]?.MsgHistory[0]?.Time;
            state.guildInfo[state.currentGuild].DoNotAutoRead = false;
        },
        msgIncrementUnread : (state, action) => {
            state.guildInfo[action.payload.Guild].UnreadMsgCount++;
        },
        msgSetDoNotAutoRead : (state, action) => {
            state.guildInfo[state.currentGuild].DoNotAutoRead = action.payload.DoNotAutoRead;
        },
        msgRemoveFailed: (state, action) => {
            state.guildInfo[state.currentGuild].MsgHistory = state.guildInfo[state.currentGuild].MsgHistory.filter(msg => msg?.RequestId !== action.payload.requestId);
        },
        msgClearUser: (state, action) => {
            state.guildInfo[action.payload.Guild].MsgHistory = state.guildInfo[action.payload.Guild].MsgHistory.filter(msg => msg?.Author.Id !== action.payload.Id);
        },
        msgClearGuild: (state, action) => {
            state.guildInfo[action.payload.Guild].MsgHistory = [];
        },
        inviteAdd: (state, action) => {
            state.guildInfo[action.payload.Guild].Invites.push(action.payload.Invite);
        },
        inviteRemove: (state, action) => {
            state.guildInfo[action.payload.Guild].Invites = state.guildInfo[action.payload.Guild].Invites.filter(invite => invite !== action.payload.Invite);
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        }
        /*
        msgEdit : (state, action) => { //accepts guild : int, msg : object
            state.guildInfo[action.payload.guild].MsgHistory.filter
        },*/
    },
    extraReducers: (builder) => {
        builder.addCase(GetGuilds.fulfilled, (state, action) => {
            console.log(action.payload)
            action.payload.forEach(guild => {
                state.guildInfo[guild.Id] = {
                    Name: guild.Name,
                    Icon: guild.Icon,
                    Owner: guild.Owner,
                    InviteLoading: false,
                    BanKickLoading: false,
                    ClearMsgLoading: false,
                    Loaded: false,
                    MsgLimitReached: false,
                    LastMsgRead : guild.Unread.Id,
                    UnreadMsgCount : guild.Unread.Count,
                    LastMsgReadTime : guild.Unread.Time,
                    DoNotAutoRead : true,
                    EditMessage: -1,
                    Invites: [],
                    Users: [],
                    Settings: {},
                    Banned: [],
                    MsgHistory: []
                };
                state.guildOrder.push(guild.Id);
            });
            state.currentGuild = state.guildOrder[0] ? state.guildOrder[0] : 0;
        })
            .addCase(GetMsgs.fulfilled, (state, action) => {// using unshift since we are also grabbing info from guilds not loaded in
                console.log(action.payload);
                action.payload.map(msg => {
                    msg.Loaded = true;
                    state.guildInfo[state.currentGuild].MsgHistory.push(msg);
                });
                if (action.payload.length < 50) {
                    console.log("msg limit reached");
                    state.guildInfo[state.currentGuild].MsgLimitReached = true;
                }
            })
            .addCase(SendMsgs.pending, (state, action) => {
                console.log("pending", action);
                const { requestId } = action.meta;
                const { msg, guild } = action.meta.arg;
                state.guildInfo?.[guild].MsgHistory.unshift({
                    RequestId: requestId,
                    Loaded: false,
                    Content: msg,
                    Time: Date.now(),
                    Failed: false

                });
            })
            /*
            .addCase(SendMsgs.fulfilled, (state, action) => {
                console.log("fulfilled", action);
                const {requestId} = action.meta;
                const {guild} = action.meta.arg;
                if (guild in state.guildInfo) {
                    state.guildInfo[guild].MsgHistory = state.guildInfo[guild].MsgHistory.filter(msg => msg?.RequestId !== requestId);
                }
            })
            */
            .addCase(SendMsgs.rejected, (state, action) => {
                console.log("rejected", action);
                const { requestId } = action.meta;
                const { guild } = action.meta.arg;
                const index = state.guildInfo[guild].MsgHistory.findIndex(msg => msg?.RequestId === requestId);
                if (guild in state.guildInfo) {
                    state.guildInfo[guild].MsgHistory[index].Failed = true;
                }
            })
            .addCase(DeleteInvite.pending, (state, action) => {
                const { guild } = action.meta.arg;
                if (guild in state.guildInfo) {
                    state.guildInfo[guild].InviteLoading = true;
                }
            })
            .addCase(DeleteInvite.fulfilled, (state, action) => {
                const { guild } = action.meta.arg;
                if (guild in state.guildInfo) {
                    state.guildInfo[guild].InviteLoading = false;
                }
            })
            .addCase(BanUser.pending, (state, action) => {
                const { guild } = action.meta.arg;
                if (guild in state.guildInfo) {
                    state.guildInfo[guild].BanKickLoading = true;
                }
            })
            .addCase(BanUser.fulfilled, (state, action) => {
                const { guild } = action.meta.arg;
                if (guild in state.guildInfo) {
                    state.guildInfo[guild].BanKickLoading = false;
                }
            })
            .addCase(KickUser.pending, (state, action) => {
                const { guild } = action.meta.arg;
                if (guild in state.guildInfo) {
                    state.guildInfo[guild].BanKickLoading = true;
                }
            })
            .addCase(KickUser.fulfilled, (state, action) => {
                const { guild } = action.meta.arg;
                if (guild in state.guildInfo) {
                    state.guildInfo[guild].BanKickLoading = false;
                }
            })
            .addCase(UnbanUser.pending, (state, action) => {
                const { guild } = action.meta.arg;
                if (guild in state.guildInfo) {
                    state.guildInfo[guild].BanKickLoading = true;
                }
            })
            .addCase(UnbanUser.fulfilled, (state, action) => {
                const { guild } = action.meta.arg;
                if (guild in state.guildInfo) {
                    state.guildInfo[guild].BanKickLoading = false;
                }
            })
            .addCase(GetGuildUsers.fulfilled, (state, action) => {
                state.guildInfo[state.currentGuild].Users = action.payload; //fixed double user list
                state.guildInfo[state.currentGuild].Loaded = true;
            })
            .addCase(GetBannedUsers.fulfilled, (state, action) => {
                console.log("banned", action.payload)
                action.payload.forEach(user => {
                    state.guildInfo?.[state.currentGuild]?.Banned.unshift(user);
                })
            })
            .addCase(GetInvite.fulfilled, (state, action) => {
                state.guildInfo[state.currentGuild].Invites = action.payload;
            })
            .addCase(GetGuildSettings.fulfilled, (state, action) => {
                state.guildInfo[state.currentGuild].Settings = action.payload;
            })
            .addCase(DeleteAllGuildMsg.pending, (state, action) => {
                state.guildInfo[state.currentGuild].ClearMsgLoading = true;
            })
            .addCase(DeleteAllGuildMsg.fulfilled, (state, action) => {
                state.guildInfo[state.currentGuild].ClearMsgLoading = false;
            });

    }

});
//use ellipsis later
export const { guildAdd, guildRemove, guildSet, guildChange, guildReset, guildSettingsChange, guildCurrentSet,
    guildSetInvite, guildRemoveInvite, guildUpdateUserList, msgAdd, msgRemove, msgEditSet, msgSet, msgRemoveFailed, msgClearUser, msgClearGuild, msgIncrementUnread, msgSetDoNotAutoRead, msgReadSet, guildRemoveUserList,
    guildRemoveBannedList, guildUpdateBannedList, inviteAdd, inviteRemove, setLoading } = guildSlice.actions;
export default guildSlice.reducer;