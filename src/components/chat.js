import React from 'react';
import * as Yup from 'yup';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import styles from './chat.module.css';
import { UserMenu, ServerMenu, Modal, CheckBox, InputBox, PictureSelector } from './modals';
import { startSocket } from '../api/websocket';
import { GetMsgs, SendMsgs } from '../api/msgApi';
import { GetGuilds, GetGuildUsers, GenInvite, GetInvite, CreateGuild, JoinGuild } from '../api/guildApi';
import { authClear } from '../app/reducers/auth';
import { GetUserInfo } from '../api/userInfoApi';
import { guildCurrentSet } from '../app/reducers/guilds';


function Msg(props) { //TODO add id to return in backend
    return (
        <div className={styles.msg}>
            <img src={props.img} width="50" height="50" alt="pfp" />
            <label>{props.username}</label>
            <p>{props.msg}</p>
        </div>
    );
}

function RenderChatMsgs() {
    const msgsList = useSelector(state => state.guilds.guildInfo?.[state.guilds.currentGuild]?.MsgHistory ?? []);
    return msgsList.map((msg, index) => <Msg key={index} img="/profileImg.png" username={msg.Author.Username} msg={msg.Content} />);
}

function User(props) {
    return (
        <div className={styles.userListChild}>
            <img src={props.img} width="50" height="50" alt="pfp" />
            <p>{props.username}</p>
        </div>
    );
}

function RenderUserList() {
    const userList = useSelector(state => state.guilds.guildInfo?.[state.guilds.currentGuild]?.Users ?? []);
    return userList.map((user,index) => <User key={index} img="/profileImg.png" username={user.Username} />);
}


function MenuOption(props) {
    return (
        <div className={styles.menuOption} onClick={props.function}>
            <p>{props.name}</p>
        </div>
    );
}

function Guild(props) {
    const dispatch = useDispatch();
    return (
        <div className={styles.guildContainer} onClick={() => dispatch(guildCurrentSet({Guild : props.guildId}))}>
            <div className={styles.guildOption}>
                <p>{props.name}</p>
            </div>
            <img src={props.img} alt="server pfp" />
        </div>
    );
}

function RenderGuilds() {
    const guildInfo = useSelector(state => state.guilds.guildInfo);
    const guildOrder = useSelector(state => state.guilds.guildOrder);
    return guildOrder.map((guild, index) => <Guild key={guild} guildId={guild} img="/profileImg.png" icon={guildInfo[guild].Icon} name={guildInfo[guild].Name} />);
}

function RenderChatName() {
    const guildName = useSelector(state => state.guilds.guildInfo?.[state.guilds.currentGuild]?.Name ?? "NO NAME");
    return guildName
}

function InviteModal(props) {
    const genInvite = useSelector(state => state.guilds.guildInfo?.[state.guilds.currentGuild]?.invite ?? "");
    const dispatch = useDispatch();
    return (
        <Modal show={props.show} height="250" width="400" buttons={[{ value: "Exit", function: props.exit }]}>
            <h1>Create Invite</h1>
            <div className={styles.inviteContainer}>
                <div className={styles.inviteBox}>
                    <label>Your Invite</label>
                    <input value={genInvite} type="text" readOnly />
                </div>
                <div>
                    <input type="button" value="Create" className={`default ${styles.genInviteButton}`} onClick={(() => dispatch(GenInvite()))} />
                </div>
            </div>
        </Modal>
    )
}

function Chat() { //might turn into class
    const [menu, setMenu] = React.useState(false); //show the settings?
    const [server, setServer] = React.useState(false); //show server settings / create invite?
    const [chat, setChat] = React.useState(false); //to determine if it should show dialog to invite or create chat
    const [create, setCreate] = React.useState(0); //for type in invite/create chat
    const [serverSettings, setServerSettings] = React.useState(false); //show server settings
    const [userList, setUserList] = React.useState(false); //for userlist
    const [invite, setInvite] = React.useState(false); //show invite dialog

    const [inviteTxt, setInviteTxt] = React.useState(""); //for type in invite
    const [chatTxt, setChatTxt] = React.useState(""); //for type in chat


    const [serverImage, setServerImage] = React.useState("/profileImg.png");

    const dummyMsgBottomRef = React.useRef(null); //used to scroll down to bottom of chat when new message appears (CHANGE LATER NOT GOOD DESIGN!!!)

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { expires, userId, token } = useSelector(state => state.auth);

    const { currentGuild } = useSelector(state => state.guilds);

    const messages = useSelector(state => state.guilds.guildInfo?.[state.guilds.currentGuild]?.MsgHistory); //maybe temp?
    const guildLoaded = useSelector(state => state.guilds.guildInfo?.[state.guilds.currentGuild]?.Loaded); //maybe temp?

    function GetData() {
        dispatch(GetGuildUsers()).then(() => dispatch(GetMsgs())).then(() => dispatch(GetInvite()));
    }

    const schemaCreateChat = Yup.object().shape({
        serverName : Yup.string()
            .required("Server name is required")
            .min(6, "Has to be at least 6 characters")
            .max(16, "Cannot be longer than 16 characters"),
        saveChat : Yup.bool()
    });

    const schemaJoinChat = Yup.object().shape({
        invite : Yup.string()
            .required("Invite is required")
            .test("len", "Must be exactly 10 characters", val => val.length === 10),
    })

    const { handleSubmit: handleSubmitC, register: registerC, setError: setErrorC, reset: resetC, formState: { errors: errorsC } } = useForm({
        resolver: yupResolver(schemaCreateChat)
    });

    const { handleSubmit: handleSubmitJ, register: registerJ, setError: setErrorJ, reset: resetJ, formState: { errors: errorsJ } } = useForm({
        resolver: yupResolver(schemaJoinChat)
    });

    function prepareSendMsg() {
        dispatch(SendMsgs({
            msg: chatTxt
        }));
        setChatTxt("");
    }

    React.useEffect(
        () => {
            if (Date.now() > expires) {
                dispatch(authClear());
            }
            if (![token, userId, expires].every(Boolean)) navigate("../login", { "replace": false });
            dispatch(GetGuilds()).then(() => dispatch(GetUserInfo()))

            dispatch(startSocket(token)); //start da websocket brah
        }, [dispatch, navigate, token, userId, expires])

    React.useEffect(
        () => {
            if (!guildLoaded) {
                console.log("loading data");
                GetData();
            }
        }
        , [dispatch, currentGuild]);

    

    React.useEffect( //maybe temp?
        () => {
            dummyMsgBottomRef.current?.scrollIntoView();
        }, [messages] 
    )

    const userInfo = useSelector(state => state.userInfo);

    function handleInviteChange(e) {
        setInviteTxt(e.target.value);
    }

    async function joinGuild(form) {
        const res = await dispatch(JoinGuild({
            invite : form.invite //being explicit for now
        }))
        if (res.error)
        {
            setErrorJ("invite", {type : "custom", message : res.error.message});
            return;
        }
        resetJ();
        setCreate(0);
        setChat(false);
    }

    async function createGuild(form) {
        const res = await dispatch(CreateGuild({
            name: form.serverName,
        }));
        if (res.error) {
            setErrorC("serverName", {type : "custom", message : res.error.message});
            return;
        }
        resetC();
        setCreate(0);
        setChat(false);
    }

    function exitCreateChat() {
        setCreate(0);
        setChat(false);
    }

    function changeServerImage(e) {
        setServerImage(e.target.files[0]);
    }

    return (
        <div className={styles.chatContainer}>
            <div className={styles.menuUserContainer}>
                <div className={styles.userModal}>
                    <div className={styles.userModalUsername}>
                        <p> {userInfo.username} </p>
                        <div>
                            <input type="button" value="settings" onClick={() => setMenu(true)} />
                        </div>
                    </div>
                    <div className={styles.userModalProfile}>
                        <img src="/profileImg.png" id="pfp" />
                    </div>
                </div>
                <div className={styles.menu}>
                    <MenuOption name="Games (Not Working yet)" function={() => 1} />
                    <MenuOption name="Create/Add Chat" function={() => setChat(true)} />
                    {
                        RenderGuilds()
                    }
                </div>
            </div>
            <div className={styles.chat}>
                <div className={styles.chatTopMenu}>
                    <div className={styles.topMenuServerName}>
                        <p>{RenderChatName()}</p> {/* REPLACE WITH SOME COOL ASS FUNCTION */}
                    </div>
                    <div className={styles.topMenuServerButton}>
                        <input type="button" value="Server" onClick={() => { setServer(!server); setUserList(false) }} />
                        <input type="button" value="User List" onClick={() => { setUserList(!userList); setServer(false) }} />
                    </div>
                </div>
                <div className={styles.chatContentContainer}>
                    <div className={styles.chatContent}>
                        {
                            RenderChatMsgs()
                        }
                        <div ref={dummyMsgBottomRef}></div> {/* used to scroll automatically down at bottom of chat lmao*/}
                    </div>
                    <div className={userList ? styles.chatUserList : styles.chatUserListHidden}>
                        {
                            RenderUserList()
                        }

                    </div>
                    <div className={server ? styles.serverMiniOptions : styles.serverMiniOptionsHidden}>
                        <input className="default" type="button" value="Create Invite" id="createInviteButton" onClick={() => { setInvite(true); setServer(false); }} />
                        <input className="default" type="button" value="Server Settings" id="serverSettingsButton" onClick={() => { setServerSettings(true); setServer(false) }} />
                        <input className="default" type="button" value="Leave Server" id="leaveServerButton" />
                    </div>
                </div>
                <div className={styles.chatControl}>
                    <div className={styles.userInput}>
                        <textarea placeholder="type here!" value={chatTxt} onChange={(e) => setChatTxt(e.target.value)} />
                        <input type="button" value="Send!" onClick={prepareSendMsg} />
                    </div>
                </div>
            </div>
            <ServerMenu show={serverSettings} exit={() => setServerSettings(false)} />
            <UserMenu show={menu} exit={() => setMenu(false)} />
            <Modal show={chat} buttons={create !== 0 && create !== -1 ? [{ value: "Back", function: () => { setCreate(-1) } }, { value: "Exit", function: () => { exitCreateChat() } }] : [{ value: "Exit", function: () => { exitCreateChat() } }]} width="500" height={create === 1 ? "450" : "350"} transition={create !== 0 ? "0.5s" : "0s"}>
                <div className={styles.addChatOptions}>
                    <p>Create/Add Chat</p>
                    <div className={create === 0 || create === -1 ? styles.chatOptionsContainer : `${styles.chatOptionsContainer} ${styles.hidden}`}>
                        <button onClick={() => setCreate(1)}><label>Create Chat</label></button>
                        <button onClick={() => setCreate(2)}><label>Join Chat</label></button>
                    </div>
                    <div className={create === 1 ? styles.chatCreateContainer : `${styles.chatCreateContainer} ${styles.hidden}`}>
                        <div className={styles.createInformation}>
                            <div className={styles.createInfoOption} id="publicServerOption">
                                <label >Public Server?</label><CheckBox disabled />
                            </div>
                            <div className={styles.createInfoOption} id="saveHistoryOption">
                                <label>Save Chat History?</label><CheckBox register={registerC("saveChat")}/>
                            </div>
                        </div>
                        <div className={styles.createAppearance}>
                            <div className={styles.createInfoOption} id="changeProfile">
                                {/*<div className={styles.changeProfile}>
                                    <img src="https://www.pngitem.com/pimgs/m/661-6619328_default-avatar-png-blank-person-transparent-png.png"/>
                                    <input type="file"/>
                                </div>
                                */}
                                <PictureSelector src={serverImage} height="150" width="150" />
                            </div>
                            <div className={styles.createInfoOption}>
                                <InputBox id="serverNameInput" label="Server Name" type="text" maxLength={16} register={registerC("serverName")} errorMessage={errorsC?.serverName?.message} />
                            </div>
                            <div className={styles.createInfoOption}>
                                <input className="default" type="button" value="Create" id="createChatButton" onClick={handleSubmitC(createGuild)}/>
                            </div>
                        </div>
                    </div>
                    <div className={create === 2 ? styles.chatJoinContainer : `${styles.hatJoinContainer} ${styles.hidden}`}>
                        <InputBox id="inviteInput" label="Invite Code" type="text" register={registerJ("invite")} errorMessage={errorsJ?.invite?.message}/>
                        <input className="default" type="button" value="Join" onClick={handleSubmitJ(joinGuild)} />
                    </div>
                </div>
            </Modal>
            <InviteModal show={invite} exit={() => setInvite(false)} />
            <div className={styles.pageChange}></div>
        </div>

    );
}

export default Chat;