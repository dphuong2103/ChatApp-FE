import { createContext, useEffect, useState } from 'react';
import { HttpTransportType, HubConnectionBuilder, LogLevel, HubConnection as HubConnectionType } from '@microsoft/signalr';
import { ConnectionFunction, ContextChildren, InvokeServerFunction } from '../types/dataType';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { BASEURL } from '../api/config';
import { toast } from 'react-toastify';
import { logOut } from '../redux/slices/auth';
import { closeLoadingSpinner, showLoadingSpinner } from '../redux/slices/loadingSpinner';

export const HubConnectionContext = createContext({} as HubConnectionProps);


export default function HubConnection({ children }: ContextChildren) {
    const [connection, setConnection] = useState<HubConnectionType | null>(null);
    const [connectionId, setConnectionId] = useState('');
    const currentUserId = useAppSelector(state => state.auth.user?.id);
    const [reconnecting, setReconnecting] = useState(false);
    const dispatch = useAppDispatch();
    useEffect(() => {
        connectionSignalR();

        async function connectionSignalR() {
            if (!connection) {
                try {
                    const newConnection = new HubConnectionBuilder()
                        .withUrl(`${BASEURL}/chathub`, { skipNegotiation: true, transport: HttpTransportType.WebSockets, withCredentials: true })
                        .configureLogging(LogLevel.Information)
                        .withAutomaticReconnect()
                        .build();
                    newConnection.on(ConnectionFunction.UpdateConnectionId, (connectionId: string) => { setConnectionId(connectionId) });
                    newConnection.onclose((e) => {
                        setConnection(null);
                        toast.error('Cannot connect to the server, please login later!');
                        console.warn("Connection closed:", e);
                        setReconnecting(false);
                        dispatch(closeLoadingSpinner());
                        dispatch(logOut());
                    })

                    await newConnection.start().then(() => {
                        console.info('Hub connection established')
                    });

                    if (!currentUserId) {
                        console.error(' User id is null')
                    } else {
                        await newConnection.invoke(InvokeServerFunction.UserOnline, currentUserId)
                    }

                    newConnection.onreconnecting(() => {
                        setReconnecting(true);
                        console.info('reconnecting')
                        dispatch(showLoadingSpinner());
                    });

                    newConnection.onreconnected(async (connectionId) => {
                        setReconnecting(false);
                        if (connectionId) setConnectionId(connectionId);
                        await newConnection.invoke(InvokeServerFunction.UserOnline, currentUserId)
                        setConnection(newConnection);
                        dispatch(closeLoadingSpinner());
                    });

                    setConnection(newConnection);
                }
                catch (err) {
                    console.error('error connecting to hub server', err);
                }
            }
        }
        return () => {
            connection?.stop();
            setConnection(null);
            setConnectionId('');
        }
    }, [])


    return (
        <HubConnectionContext.Provider value={{ connection, connectionId, reconnecting }}>{children}</HubConnectionContext.Provider>
    )
}



type HubConnectionProps = {
    connection: HubConnectionType | null,
    connectionId: string,
    reconnecting: boolean
}