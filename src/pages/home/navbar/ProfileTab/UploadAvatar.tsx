import { Button, Modal } from '@mui/material';
import { useState } from 'react';
import Avatar from 'react-avatar-edit';
import styles from '../../../../styles/UploadAvatar.module.scss';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { ChatRoomAPI, UserAPI } from '../../../../api';
import { getDownloadURL } from 'firebase/storage';
import { updateUserProfile } from '../../../../redux/slices/auth';
import { User } from '../../../../types/dataType';
import { toast } from 'react-toastify';
import { useCurrentChatRoomContext } from '../../../../helper/getContext';
const prefixString = 'data:image/png;base64,';

function UploadAvatar({ open, handleClose, type }: UploadAvatarProps) {
    const [cropImg, setCropImg] = useState('');
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(state => state.auth.user);
    const { currentChatRoomSummary } = useCurrentChatRoomContext();

    async function handleUploadAvatar() {
        if (type === 'ChatRoomAvatar') {
            await handleUploadChatRoomAvatar()
        }
        else if (type === 'UserAvatar') {
            await handleUploadUserAvatar();
        }
    }

    async function handleUploadUserAvatar() {
        if (!currentUser || !currentUser.id || !cropImg) return;
        try {
            var uploadResult = await UserAPI.uploadUserAvatar(currentUser.id, cropImg)
            const downloadUrl = await getDownloadURL(uploadResult.ref);
            const updatedUser: User = { ...currentUser, photoUrl: downloadUrl }
            dispatch(updateUserProfile(updatedUser))
            handleClose();
            toast.success('Image uploaded successfully!')
        } catch (err) {
            console.error('Error uploading image', err);
            toast.error('Error uploading image, please try again!');
        }
    }

    async function handleUploadChatRoomAvatar() {
        try {
            await ChatRoomAPI.uploadChatRoomAvatar(currentChatRoomSummary!.chatRoom.id, cropImg);
            handleClose();
            toast.success('Image uploaded successfully!')
        } catch (err) {
            console.error('Error uploading image', err);
            toast.error('Error uploading image, please try again!');
        }
    }

    function handleCropImg(e: string) {
        e = e.replace(prefixString, '');
        setCropImg(e);
    }
    return (
        <Modal open={open} className={styles['modal-backdrop']}>
            <div className={styles['upload-avatar-container']}>
                <Avatar
                    height={300}
                    width={300}
                    onCrop={handleCropImg}
                    onClose={() => setCropImg('')}
                    exportQuality={1}

                />
                <div className={styles['actions-container']}>
                    <Button variant="text" onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleUploadAvatar}>Save</Button>
                </div>

            </div>

        </Modal>
    )
}

export default UploadAvatar

type UploadAvatarProps = {
    open: boolean,
    handleClose: () => void,
    type: 'UserAvatar' | 'ChatRoomAvatar'
}