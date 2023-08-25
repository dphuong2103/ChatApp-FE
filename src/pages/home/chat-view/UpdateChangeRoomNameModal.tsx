import { Button, Modal, TextField, Typography } from '@mui/material'
import { ChatRoom, ChatRoomIdAndName, ChatRoomInfo } from '@data-type'
import styles from '@styles/UpdateChatRoomNameModal.module.scss';
import Avatar from '../../../components/Avatar';
import { useEffect, useState } from 'react';
import { ChatRoomAPI } from '@api';
import LoadingButton from '@mui/lab/LoadingButton';
function UpdateChatRoomNameModal({ open, chatRoom, onClose, chatRoomInfo }: UpdateChatRoomNameModalProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (chatRoom?.name) {
            setName(chatRoom.name);
        }
    }, [chatRoom])

    function handleOnClose() {
        if (chatRoom?.name) setName(chatRoom.name);
        onClose()
    }

    async function handleSubmitUpdateName() {
        if (!chatRoom) return;
        try {
            setLoading(true);
            const request: ChatRoomIdAndName = {
                chatRoomId: chatRoom.id,
                name: name
            }
            await ChatRoomAPI.updateChatRoomName(request);
            onClose();
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal open={open} onClose={handleOnClose} className={styles['modal-backdrop']}>
            <div className={styles.container}>
                <div className={styles['title-container']}>
                    <Typography variant='h6'>Change chat name</Typography>
                </div>
                <div className={styles['content-container']}>
                    <div className={styles['avatar-container']}>
                        <Avatar name={chatRoomInfo?.name} imgUrl={chatRoomInfo?.imgUrl} size={5} />
                    </div>
                    <Typography>New chat room name will be visible to all users</Typography>
                    <TextField value={name} onChange={(e) => setName(e.target.value)} label='Chat name' required placeholder='Enter new chat name...' />
                </div>
                <div className={styles['actions-container']}>
                    <Button variant='text' onClick={handleOnClose}>
                        Cancel
                    </Button>
                    <LoadingButton variant='contained' disabled={!name} onClick={handleSubmitUpdateName} loading={loading}>
                        Update
                    </LoadingButton>
                </div>
            </div>
        </Modal>
    )
}

export default UpdateChatRoomNameModal


type UpdateChatRoomNameModalProps = {
    open: boolean,
    chatRoom?: ChatRoom,
    onClose: () => void,
    chatRoomInfo: ChatRoomInfo | null
}