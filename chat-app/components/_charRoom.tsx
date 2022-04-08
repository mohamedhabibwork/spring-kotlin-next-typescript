import React, {useState} from 'react';
import SockJS from 'sockjs-client';
import {Client, Message, over} from "stompjs";

let stompClient: Client;

const ChatRoom = (props:object) => {
    console.log(props)
    const [publicChats, setPublicChats] = useState([]);
    const [privateChats, setPrivateChats] = useState(new Map());
    const [tab, setTab] = useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: "",
        receiverName: "",
        connected: false,
        message: "",
    });

    const handleUserName = (e: any) => {
        setUserData({...userData, 'username': e.target.value});
    }

    const onPublicMessageReceived = (message: Message) => {
        const payloadData = JSON.parse(message.body);
        switch (payloadData.status) {
            case "JOIN":
                if (!privateChats.get(payloadData.senderName)) {
                    privateChats.set(payloadData.senderName, [payloadData]);
                    setPrivateChats(new Map(privateChats));
                }
                break
            case "MESSAGE":
                // @ts-ignore
                publicChats.push(payloadData)
                setPublicChats([...publicChats])
                break
            default:
                break;
        }
    }
    const onPrivateMessageReceived = (message: Message) => {
        const payloadData = JSON.parse(message.body);
        if (privateChats.get(payloadData.senderName)) {
            privateChats.get(payloadData.senderName).push(payloadData);
        } else {
            privateChats.set(payloadData.senderName, [payloadData]);
            setPrivateChats(new Map(privateChats));
        }
    }

    const onConnected = () => {
        setUserData({...userData, connected: true})
        stompClient.subscribe('/chatroom/public', onPublicMessageReceived)
        stompClient.subscribe(`/user/${userData.username}/private`, onPrivateMessageReceived)
        console.log(userData.connected);
    }

    const onError = () => {
        console.log('ERRRORR')
    }
    const registerUser = (e: any) => {
        e.preventDefault();
        const socket = new SockJS("http://localhost:8080/ws");
        stompClient = over(socket);
        stompClient.connect({}, onConnected, onError)
    }

    const sendPublicMessage = () => {
        if (stompClient?.connected) {
            const chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status: 'MESSAGE',
            };
            stompClient.send('/app/message',{},JSON.stringify(chatMessage));
            userData.message = "";
            setUserData(userData);
        }
    }

    const sendPrivateMessage = () => {
        if (stompClient?.connected) {
            const chatMessage = {
                senderName: userData.username,
                receiverName:tab,
                message: userData.message,
                status: 'MESSAGE',
            };
            if (userData.username !== tab ){
                privateChats.get(tab).push(chatMessage);
                setPrivateChats(new Map(privateChats));
            }
            stompClient.send('/app/message',{},JSON.stringify(chatMessage));
            userData.message = "";
            setUserData(userData);
        }
    }

    const handleValue = (e: any) => {
        setUserData({...userData,message: e.target.value})
    }

    return (
        <div className="container">
            {
                userData.connected ?
                    <div className="chat-box">
                        <div className="member-list">
                            <ul>
                                <li onClick={() => setTab("CHATROOM")}
                                    className={`member ${tab === "CHATROOM" && 'active'}`}>Chat Room
                                </li>
                                {[...privateChats.keys()].map((name, index) => (
                                    <li onClick={() => setTab(name)}
                                        key={`member-${index} ${tab === "CHATROOM" && 'active'}`}
                                        className="member">{name}</li>
                                ))}
                            </ul>
                        </div>
                        {tab === "CHATROOM" && <div className="chat-content">
                            <ul className="chat-messages">
                                {publicChats.map((chat, index) => {
                                    const {senderName, message} = chat;
                                    return (
                                        <li className="message" key={`chat-${index}`}>
                                            {senderName !== userData.username && (
                                                <div className="avatar">{senderName}</div>)}
                                            <div className="message-data">{message}</div>
                                            {senderName === userData.username && (
                                                <div className="avatar">{senderName}</div>)}
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="send-message">
                                <input type="text" name="message" id="message" placeholder="Enter Message" value={userData.message}
                                       onChange={handleValue}/>
                                <button type="button" className="send-button" onClick={sendPublicMessage}>Send</button>
                            </div>
                        </div>}
                        {tab !== "CHATROOM" && <div className="chat-content">
                            <ul className="chat-messages">
                                {[...privateChats.get(tab)].map((chat, index) => {
                                    const {senderName, message} = chat;
                                    return (
                                        <li className="message" key={`chat-${index}`}>
                                            {senderName !== userData.username && (
                                                <div className="avatar">{senderName}</div>)}
                                            <div className="message-data">{message}</div>
                                            {senderName === userData.username && (
                                                <div className="avatar">{senderName}</div>)}
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="send-message">
                                <input type="text" name="message" id="message" placeholder={`Enter Message for ${tab}`}  value={userData.message}
                                       onChange={handleValue}/>
                                <button type="button" className="send-button" onClick={sendPrivateMessage}>Send</button>
                            </div>
                        </div>}
                    </div>
                    :
                    <div className="register">
                        <input type="text" name="username" id="user-name" placeholder="Enter the username"
                               value={userData.username} onChange={handleUserName}/>
                        <button type="button" onClick={registerUser}>connect</button>
                    </div>
            }
        </div>
    );
};

export default ChatRoom;

