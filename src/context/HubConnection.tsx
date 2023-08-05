import { createContext, useEffect, useState } from 'react';
import { HttpTransportType, HubConnectionBuilder, LogLevel, HubConnection as HubConnectionType } from '@microsoft/signalr';
import { ConnectionFunction, ContextChildren, InvokeServerFunction } from '../types/dataType';
import { useAppSelector } from '../redux/store';
import { BASEURL } from '../api/config';

export const HubConnectionContext = createContext({} as HubConnectionProps);


export default function HubConnection({ children }: ContextChildren) {
    const [connection, setConnection] = useState<HubConnectionType | null>(null);
    const [connectionId, setConnectionId] = useState('');
    const currentUserId = useAppSelector(state => state.auth.user?.id);

    useEffect(() => {
        connectionSignalR();

        async function connectionSignalR() {
            if (!connection) {
                try {
                    const newConnection = new HubConnectionBuilder()
                        .withUrl(`${BASEURL}/chathub`, { skipNegotiation: true, transport: HttpTransportType.WebSockets, withCredentials: true })
                        .configureLogging(LogLevel.Information).build();


                    newConnection.on(ConnectionFunction.UpdateConnectionId, (connectionId: string) => { setConnectionId(connectionId) });

                    newConnection.onclose((e) => {
                        setConnection(null);
                        console.warn("Connection closed:", e);
                    })

                    await newConnection.start().then(() => {
                        console.info('Hub connection established')
                    });

                    if (!currentUserId) {
                        console.error(' User id is null')
                    } else {
                        await newConnection.invoke(InvokeServerFunction.UserOnline, currentUserId)
                    }

                    setConnection(newConnection);
                }
                catch (err) {
                    console.error(err);
                }
            }
        }
        return () => {
            connection?.stop();
            setConnection(null);
        }
    }, [])

    async function openChatRoom(newChatRoomId: string, oldChatRoomId?: string,) {
        if (!connection) {
            console.warn('No connection')
            return;
        }
        try {
            if (oldChatRoomId) connection.invoke(InvokeServerFunction.CloseChatRoom, oldChatRoomId)
            connection.invoke(InvokeServerFunction.OpenChatRoom, newChatRoomId)
        } catch (err) {

            console.error('Cannot call server function: ', err)
        }
    }

    return (
        <HubConnectionContext.Provider value={{ connection, openChatRoom, connectionId }}>{children}</HubConnectionContext.Provider>
    )
}



type HubConnectionProps = {
    connection: HubConnectionType | null,
    openChatRoom: (newChatRoomId: string, oldChatRoomId?: string) => Promise<void>,
    connectionId: string
}