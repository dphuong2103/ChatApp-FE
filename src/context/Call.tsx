import { createContext, useEffect, useReducer, useRef, useState } from 'react'
import { CallStatus, CallType, ChatRoomInfo, ChatRoomSummary, ChatRoomType, ConnectionFunction, ContextChildren, InvokeServerFunction, User } from '../types/dataType';
import { useChatRoomSummaryContext, useHubConnection } from '../helper/getContext';
import SimplePeer from 'simple-peer';
import { getChatRoomInfo, getChatRoomSummaryByChatRoomId } from '../helper/chatRoomHelper';
import ReceivingCallModal from '../components/ReceivingCallModal';
import CallWindow from '../components/CallWindow';
import { useAppSelector } from '../redux/store';
import { toast } from 'react-toastify';

export const CallContext = createContext({} as CallContextValue);
type CallAction = {
    type: CallActionType
}
const initialCallState: CallStatus = {
    calling: false,
    receivingCall: false,
    onCall: false
}

const callingState: CallStatus = {
    calling: true,
    receivingCall: false,
    onCall: false
}

const receivingCallState: CallStatus = {
    calling: false,
    receivingCall: true,
    onCall: false
}

const onCallState: CallStatus = {
    calling: false,
    receivingCall: false,
    onCall: true
}

const callReducer = (_state: CallStatus, action: CallAction) => {
    switch (action.type) {
        case CallActionType.INITIATECALL: return callingState;
        case CallActionType.ONCALLSTATE: return onCallState
        case CallActionType.RECEIVINGCALL: return receivingCallState
        case CallActionType.CALLDECLINED: return initialCallState
        case CallActionType.CALLENDED: return initialCallState

    }
}

export default function Call({ children }: ContextChildren) {
    const currentUser = useAppSelector(state => state.auth.user);
    const [currentChatRoomInfo, setCurrentChatRoomInfo] = useState<ChatRoomInfo | null>(null);
    const [callStatus, dispatchCallStatus] = useReducer(callReducer, initialCallState);
    const { connection } = useHubConnection();
    const [partnerMediaStream, setPartnerMediaStream] = useState<MediaStream | null>();
    const [callerData, setCallerData] = useState<CallData | null>(null);
    const partnerVideoRef = useRef<HTMLVideoElement | null>(null);
    const peer = useRef<SimplePeer.Instance | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const [callChatRoomAndUserList, setCallChatRoomAndUserList] = useState<ChatRoomSummary | null>(null);
    const { chatRoomSummaries } = useChatRoomSummaryContext();

    async function handleCall(callType: CallType, callChatRoomAndUserList: ChatRoomSummary | null) {
        if (callStatus.calling || callStatus.onCall || callStatus.receivingCall) {
            return;
        }
        if (callChatRoomAndUserList) {
            setCallChatRoomAndUserList({ ...callChatRoomAndUserList });
        }
        try {
            mediaStream.current = await navigator.mediaDevices.getUserMedia({ video: callType === CallType.VIDEOCALL });
            if (!mediaStream.current) {
                console.error("Error: getUserMedia returned undefined.");
                toast.error('Cannot get video or audio, please try again later');
                return;
            }
            peer.current = new SimplePeer({
                initiator: true,
                trickle: false,
                stream: mediaStream.current
            })

            peer.current.on('signal', (data: any) => {
                connection?.invoke(InvokeServerFunction.InitiateCall, { chatRoomId: callChatRoomAndUserList?.chatRoom.id, signalData: data, fromUser: currentUser, callType: callType })
            })

            peer.current.on('stream', stream => setPartnerMediaStream(stream))
            dispatchCallStatus({ type: CallActionType.INITIATECALL });
        }
        catch (err) {
            toast.error('Cannot start call, please try again later');
            console.error(err)
        }

        if (callerData?.signalData) {
            peer.current?.on('signal', (data: string | SimplePeer.SignalData) => {
                connection?.invoke(InvokeServerFunction.AcceptCall, data, callerData.fromConnectionID)
            })
            peer.current?.on('stream', stream => setPartnerMediaStream(stream));
            peer.current?.signal(callerData.signalData);
            dispatchCallStatus({ type: CallActionType.ONCALLSTATE });
        }

    }

    async function acceptCall() {
        if (callerData?.fromConnectionID && callerData.signalData) {
            mediaStream.current = await navigator.mediaDevices.getUserMedia({ video: callerData.callType === CallType.VIDEOCALL });
            peer.current = new SimplePeer({ initiator: false, trickle: false, stream: mediaStream.current });
            peer.current.on('signal', (data: string | SimplePeer.SignalData) => {
                connection?.invoke(InvokeServerFunction.AcceptCall, data, callerData?.fromConnectionID);
            })
            peer.current.signal(callerData?.signalData);
            dispatchCallStatus({ type: CallActionType.ONCALLSTATE });
            peer.current?.on('stream', stream => setPartnerMediaStream(stream))
        }
    }

    function declineCall() {
        dispatchCallStatus({ type: CallActionType.CALLDECLINED });
        connection?.invoke(InvokeServerFunction.DeclinedCall, callerData?.fromConnectionID);
    }

    function handleLeaveCall() {
        console.log('Leave call');
        handleEndCall();
        connection?.invoke(InvokeServerFunction.LeaveCall, callChatRoomAndUserList?.chatRoom.id, currentUser?.id)
    }

    function handleEndCall() {
        peer.current = null;
        setCallerData(null);
        setPartnerMediaStream(null);
        partnerVideoRef.current = null;
        setCallChatRoomAndUserList(null);
        mediaStream.current?.getTracks().forEach(track => {
            track.stop();
        });
        dispatchCallStatus({ type: CallActionType.CALLENDED });

    }

    useEffect(() => {
        if (connection) {
            connection.on(ConnectionFunction.ReceiveCall, (callData: CallData) => {
                setCallChatRoomAndUserList(getChatRoomSummaryByChatRoomId(chatRoomSummaries, callData.chatRoomID));
                setCallerData(callData);
                dispatchCallStatus({ type: CallActionType.RECEIVINGCALL })
            })
        }
    }, [connection])

    useEffect(() => {
        if (callChatRoomAndUserList) {
            setCurrentChatRoomInfo(getChatRoomInfo(callChatRoomAndUserList))
        }
    }, [callChatRoomAndUserList])

    useEffect(() => {
        if (partnerVideoRef?.current && partnerMediaStream) {
            partnerVideoRef.current.srcObject = partnerMediaStream;
            partnerVideoRef.current.play();
        }
    }, [partnerMediaStream])

    useEffect(() => {
        if (callStatus.onCall || callStatus.receivingCall) {
            connection?.on(ConnectionFunction.LeavedCall, (userId: string) => {
                console.log(userId, 'leave called');
                if (callChatRoomAndUserList?.chatRoom.chatRoomType === ChatRoomType.ONE) {
                    handleEndCall();
                    setCallChatRoomAndUserList(null);
                    toast.info('Call Ended!', { toastId: 'CallEnded' })
                }
            })
        }

        if (callStatus.calling) {
            connection?.on(ConnectionFunction.CallAccepted, (partnerSignal: string | SimplePeer.SignalData) => {
                console.log('call accepted')
                peer.current?.signal(partnerSignal);
                peer.current?.on('stream', stream => setPartnerMediaStream(stream))
                dispatchCallStatus({ type: CallActionType.ONCALLSTATE });
            })

            connection?.on(ConnectionFunction.CallDeclined, () => {
                console.log('callled declined')
                dispatchCallStatus({ type: CallActionType.CALLDECLINED });
                toast.info('Your friend declined call!', { toastId: 'CallDeclined' })
            })
        }

        return () => {
            connection?.off(ConnectionFunction.LeavedCall);
            connection?.off(ConnectionFunction.CallDeclined);
            connection?.off(ConnectionFunction.CallAccepted);
        }
    }, [callStatus])

    return (
        <>
            <CallWindow
                callStatus={callStatus}
                ref={partnerVideoRef}
                onUnload={handleLeaveCall}
                actions={{ endCall: handleLeaveCall }}
                callInfo={{ chatRoomInfo: currentChatRoomInfo, callType: callerData?.callType }}

            />
            <ReceivingCallModal open={callStatus.receivingCall} handleAcceptCallClick={acceptCall} handleDeclineCallClick={declineCall} />
            <CallContext.Provider value={{ handleCall, acceptCall, declineCall }}>{children}</CallContext.Provider>
        </>
    )
}

enum CallActionType {
    INITIATECALL = 'INITITATECALL',
    RECEIVINGCALL = 'RECEIVINGCALL',
    ONCALLSTATE = 'ONCALLSTATE',
    CALLDECLINED = 'CALLDECLINED',
    CALLENDED = 'CALLENDED'
}


type CallData = {
    chatRoomID: string;
    signalData: string | SimplePeer.SignalData;
    fromUser: User;
    fromConnectionID?: string;
    callType: CallType
}

type CallContextValue = {
    handleCall: (callType: CallType, callChatRoomAndUserList: ChatRoomSummary | null) => Promise<void>,
    acceptCall: () => void,
    declineCall: () => void,
}