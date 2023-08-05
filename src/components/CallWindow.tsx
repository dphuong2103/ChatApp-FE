import NewWindow from 'react-new-window'
import { CallStatus, CallType, ChatNameAndPhoto } from '../types/dataType'
import { forwardRef, useState } from 'react'
import Avatar from './Avatar'
import styles from '../styles/CallWindow.module.scss'
import { IconButton, Typography } from '@mui/material'
import { Microphone, MicrophoneSlash, PhoneX } from 'phosphor-react'
import { generateClassName } from '../utils/generateClassName'
type CallWindowProps = {
    callInfo: {
        chatNameAndPhoto: ChatNameAndPhoto | null,
        callType?: CallType
    }
    callStatus: CallStatus,
    onUnload: () => void,
    actions: CallAction
}
const CallWindow = forwardRef<HTMLVideoElement, CallWindowProps>(({ callStatus, callInfo, onUnload, actions }, ref) => {
    const [muted, setMuted] = useState(false);
    if(!callStatus.calling && !callStatus.onCall) return null;
    return <NewWindow center='screen' copyStyles onUnload={onUnload}>
        <div className={styles.container}>
            {callStatus.calling &&
                <>
                    <div className={styles['calling-container']}>
                        <Avatar name={callInfo.chatNameAndPhoto?.name} imgUrl={callInfo.chatNameAndPhoto?.imgUrl} />
                        <Typography color='white' variant='h5'>{callInfo.chatNameAndPhoto?.name}</Typography>
                        <Typography color='white' variant='body1'>Calling...</Typography>
                        <div className={styles['actions-container']}>
                            <IconButton className={styles.action}>
                                <Microphone size={30} />
                            </IconButton>
                            <IconButton className={generateClassName(styles, ['action', 'decline'])}>
                                <PhoneX size={30} />
                            </IconButton>
                        </div>
                    </div>
                </>
            }
            {
                callStatus.onCall && <>
                    <div className={styles['oncall-container']}>
                        <video ref={ref} autoPlay muted={muted} />
                        <div className={styles['actions-container']}>
                            <IconButton className={styles.action} onClick={() => setMuted(prev => !prev)}>
                                {
                                    muted ? <MicrophoneSlash size={30} /> : <Microphone size={30} />
                                }
                            </IconButton>
                            <IconButton className={generateClassName(styles, ['action', 'decline'])} onClick={actions.endCall}>
                                <PhoneX size={30} />
                            </IconButton>
                        </div>
                    </div>
                </>
            }
        </div>

    </NewWindow>
})

export default CallWindow

type CallAction = {
    endCall: () => void,
}