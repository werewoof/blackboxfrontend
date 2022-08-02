import { createAsyncThunk, current } from "@reduxjs/toolkit";
import { putApi, getApi, postApi, deleteApi } from "./client";

const GetGuilds = createAsyncThunk("guilds/get", async (args, api) => {
    const response = await getApi("guild", {}, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    });
    return response;
});

const GetGuildUsers = createAsyncThunk("guilds/users/get", async (args, api) => {
    const response = await getApi("guild/users", {
        guild: api.getState().guilds.currentGuild
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    }) //figure out how to make fetching users work later with ws
    return response;
    //probs filter existing users recieved from ws with users list in websocket (inefficent?)
});

const CreateGuild = createAsyncThunk("guilds/post", async (args, api) => {
    //const {icon, name} = args; //uncomment when implement profile picture uploading
    await postApi("guild", {
        name: args.name,
        //icon : icon,
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    }); /* return is unnessary this will be handled in the websockets*/
});

const ChangeGuild = createAsyncThunk("guilds/update", async (args, api) => {
    await putApi("guild", {
        guild: args.guildId,
        name: args.name,
        icon: 0, //placeholder
        keepHistory: false, //placeholder
        public: false, //placeholder
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    });
    //no need can use websockets to broadcast for all users
    //    return response
});

const JoinGuild = createAsyncThunk("guilds/join/get", async (args, api) => {
    await postApi("guild/join", {
        invite: args.invite
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    });
});

const LeaveGuild = createAsyncThunk("guilds/leave/post", async (args, api) => {
    await postApi("guild/leave", {
        guild: api.getState().guilds.currentGuild
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    })
});

const GenInvite = createAsyncThunk("guilds/invite/post", async (args, api) => {
    await postApi("invite", {
        guild: api.getState().guilds.currentGuild
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    });
});

const GetInvite = createAsyncThunk("guilds/invite/get", async (args, api) => {
    const response = await getApi("invite", {
        guild: api.getState().guilds.currentGuild
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    });
    return response;
});

const DeleteInvite = createAsyncThunk("guilds/invite/delete", async (args, api) => {
    await deleteApi("invite", {
        guild: api.getState().guilds.currentGuild,
        invite: args.invite
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    })
});

const BanUser = createAsyncThunk("guilds/users/ban", async (args, api) => {
    await postApi("guild/ban", {
        guild: api.getState().guilds.currentGuild,
        id: args.id
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    }
    );
});

const KickUser = createAsyncThunk("guilds/users/kick", async (args, api) => {
    await postApi("guild/kick", {
        guild: api.getState().guilds.currentGuild,
        id: args.id
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    }
    );
});

const GetBannedUsers = createAsyncThunk("guilds/users/ban/get", async (args, api) => {
    const currentGuild = api.getState().guilds.currentGuild
    //if user is not owner skip
    if (api.getState().guilds.guildInfo[currentGuild].Owner !== api.getState().auth.userId) {
        console.log("skipping")
        return [];
    }
    const response = await getApi("guild/ban", {
        guild: currentGuild
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    }
    );
    return response;
});


const UnbanUser = createAsyncThunk("guilds/users/ban/put", async (args, api) => {
    await putApi("guild/ban", {
        guild: api.getState().guilds.currentGuild,
        id: args.id
    }, {
        headers: {
            "Auth-Token": api.getState().auth.token
        }
    });
});


export { GetGuilds, GetGuildUsers, CreateGuild, ChangeGuild, JoinGuild,LeaveGuild, GenInvite, GetInvite, DeleteInvite, BanUser, KickUser, GetBannedUsers, UnbanUser };