import { IconButton, Typography } from '@mui/material'
import styles from '../../../../styles/ActionBar.module.scss';
import { Microphone, PaperPlaneRight, Paperclip, Smiley, } from 'phosphor-react'
import { useEffect, useRef, useState } from 'react';
import { ChatRoomAPI, MessageAPI } from '@api';
import { ChatRoomType, NewChatRoomAndUserList, NewMessage, NewMessageForAudioRecord, NewMessageForFileUpload } from '@data-type';
import { useChatContext, useCurrentChatRoomContext } from '@helper/getContext';
import { useAppSelector } from '../../../../redux/store';
import { useOutsideClick } from '../../../../hooks/useClickOutside';
import { generateClassName } from '@helper/generateClassName';
import CancelIcon from '@mui/icons-material/Cancel';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AttachedFiles from './AttachedFiles';
import FileIcon from '../../../../components/FileIcon';
import { getExtensionFromName, isImageFromFileName } from '@helper/getFileExtensionImage';
import RecordAudio from './RecordAudio';
import { apiRequest } from '@hooks/useApi';

const maxHeight = 100;
const maxFileSizeMb = 8;
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;
function ActionBar() {
    const [textInput, setTextInput] = useState('');
    const navigate = useNavigate();
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const formRef = useRef<HTMLFormElement>(null);
    const { handleAddMessageForFileUpload, currentChatRoomSummary, newChat, currentChatRoomInfo, handleSetCurrentChatRoomSummary } = useCurrentChatRoomContext();
    const messageInputRef = useRef<HTMLTextAreaElement>(null);
    const { handleSetReplyToMessage, replyToMessage } = useChatContext();
    const currentUserId = useAppSelector(state => state.auth.user?.id);
    const iconButtonRef = useRef<HTMLButtonElement>(null);
    const attachFileRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    function handleOnTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setTextInput(e.target.value);
    }

    const emojiPickerContainerRef = useOutsideClick(() => {
        setShowEmojiPicker(false)
    }, iconButtonRef.current);

    async function handleSubmitMessage(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (newChat) {
            await handleCreateChatRoom();
        } else {
            await sendMessage();
        }
        messageInputRef.current?.focus();
        messageInputRef.current?.scrollIntoView();
    }

    async function handleCreateChatRoom() {
        if ((currentChatRoomInfo?.partners.length === 0)) return;
        const newChatRoomAndUserList: NewChatRoomAndUserList = {
            newChatRoom: {
                chatRoomType: ChatRoomType.ONE,
                creatorId: currentUserId ?? '',
            },
            userIds: [currentUserId!, currentChatRoomInfo!.partners[0].id]
        }
        const { data: newChatRoomSummary } = await apiRequest({
            request: () => ChatRoomAPI.addNewChatRoom(newChatRoomAndUserList),
            onError: () => toast.error('Error creating new chat, please try again!')
        });
        if (newChatRoomSummary) {
            handleSetCurrentChatRoomSummary(newChatRoomSummary, true)
            const message: NewMessage = {
                chatRoomId: newChatRoomSummary.chatRoom.id,
                messageText: textInput,
                senderId: currentUserId!,
                replyToMessageId: replyToMessage ? replyToMessage.id : undefined,
            }
            await MessageAPI.addMessage(message);
            setTextInput('');
            navigate('/home/chatlist/chatrooms');
        }
    }
    async function sendMessage() {
        if (selectedFile) {
            await handleSendMessageWithFiles();
        }
        else {
            await handleSendPlainMessage();
        }
    }

    async function handleSendPlainMessage() {
        if (textInput === '') return;
        const trimText = textInput.trim();
        if (!currentUserId || !currentChatRoomSummary?.chatRoom) {
            console.error('userId and chatroom is null');
            return;
        }
        const message: NewMessage = {
            chatRoomId: currentChatRoomSummary!.chatRoom.id,
            messageText: trimText,
            senderId: currentUserId!,
            replyToMessageId: replyToMessage ? replyToMessage.id : undefined,
        }
        await apiRequest({ request: () => MessageAPI.addMessage(message) });
        setTextInput('');
        handleSetReplyToMessage(undefined);
    }

    async function handleSendMessageWithFiles() {
        const trimText = textInput.trim();
        const newMessage: NewMessageForFileUpload = {
            chatRoomId: currentChatRoomSummary!.chatRoom.id,
            messageText: trimText,
            senderId: currentUserId!,
            replyToMessageId: replyToMessage ? replyToMessage.id : undefined,
            fileName: selectedFile!.name
        }
        const { data: message } = await apiRequest({
            request: () => MessageAPI.addNewMessageForFileUpload(newMessage),
            onError: () => toast.error('Error sending message, please try again!')
        });
        if (message && message.type === 'Files' && message.fileStatus === 'InProgress') {
            message.files = selectedFile!;
            handleAddMessageForFileUpload(message)
        }
        setTextInput('');
        setSelectedFile(null);
        handleSetReplyToMessage(undefined);
    }

    async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.submit
            formRef.current?.requestSubmit();
        }
    }

    function handleClickShowEmoji() {
        setShowEmojiPicker(prev => !prev)
    }

    function handleEmojiSelect(e: any) {
        setTextInput(prevText => prevText + e.native)
    }

    function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            if (e.target.files[0].size > maxFileSizeBytes) {
                toast.error('Please select file  size less than: ' + maxFileSizeMb + 'mb');
                return;
            }
            setSelectedFile(e.target.files[0])
        }
    }

    function handleDeselectFile() {
        setSelectedFile(null);
    }

    function startRecording() {
        setIsRecording(true)
    }

    function stopRecording() {
        setIsRecording(false);
    }

    async function handleSendAudioRecord(audio: Blob) {
        if (!currentUserId || !currentChatRoomSummary?.chatRoom) {
            console.error('userId and chatroom is null');
            return;
        }
        const newMessage: NewMessageForAudioRecord = {
            senderId: currentUserId,
            chatRoomId: currentChatRoomSummary.chatRoom.id
        }

        const { data: message } = await apiRequest({ request: () => MessageAPI.addNewMessageForAudioRecord(newMessage) });

        if (message && message.type === 'AudioRecord' && message.fileStatus === 'InProgress') {
            message.audio = audio;
            handleAddMessageForFileUpload(message);
        }
    }

    useEffect(() => {
        if (textInput !== '') {
            messageInputRef.current?.style.setProperty('height', '28px');
            messageInputRef.current?.style.setProperty('height', Math.min(messageInputRef.current?.scrollHeight, maxHeight) + 'px');
        }
        else {
            messageInputRef.current?.style.setProperty('height', '28px');
        }
    }, [textInput])

    useEffect(() => {
        if (replyToMessage) {
            messageInputRef.current?.focus();
        }
    }, [replyToMessage])

    useEffect(() => {
        document.addEventListener('keydown', handleEscapeKeyDown);

        function handleEscapeKeyDown(e: KeyboardEvent) {
            const { key } = e;
            if (key === 'Escape') {
                if (handleSetReplyToMessage) {
                    handleSetReplyToMessage(undefined);
                }
            }
        }
        return () => {
            document.removeEventListener('keydown', handleEscapeKeyDown);
        };
    }, []);

    function handleOnPasteCapture(e: React.ClipboardEvent<HTMLTextAreaElement>) {
        if (e.clipboardData.files.length > 0) {
            setSelectedFile(e.clipboardData.files[0])
            console.log(e.clipboardData.files[0])
        }
    }

    function handleDragFileOver(e: React.DragEvent<HTMLTextAreaElement>) {
        e.preventDefault();
    }
    function handleDropFile(e: React.DragEvent<HTMLTextAreaElement>) {
        e.preventDefault();
        if (e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0])
        }
    }

    useEffect(() => {
        setTextInput('')
        setSelectedFile(null);
        setIsRecording(false);
    }, [newChat, currentChatRoomSummary])

    if (isRecording) {
        return <RecordAudio isRecording={isRecording} stopRecording={stopRecording} onSubmit={handleSendAudioRecord} />
    }

    return (
        <form className={styles['action-bar-form']} ref={formRef} onSubmit={handleSubmitMessage}>
            <div className={generateClassName(styles, ['replied-message-wrapper', ...!replyToMessage ? ['d-none'] : []])}>
                <div className={generateClassName(styles, ['replied-message-container', ...!replyToMessage ? ['d-none'] : []])}>
                    <button className={styles.close} onClick={() => handleSetReplyToMessage(null)}>
                        <CancelIcon />
                    </button>
                    <Typography variant='body2' component='span' fontWeight='500'>Reply: {replyToMessage?.senderId !== currentUserId ? replyToMessage?.sender.displayName : ''}</Typography>
                    {
                        (replyToMessage?.type === 'Files' && replyToMessage.fileStatus === 'Done' && replyToMessage.fileName) && <>
                            {
                                isImageFromFileName(replyToMessage.fileName) ? <img src={replyToMessage.fileUrls} className={styles.image} /> : <FileIcon extension={getExtensionFromName(replyToMessage.fileName)} style={{ width: '3rem', height: '3rem' }} />
                            }

                        </>
                    }

                    {
                        replyToMessage?.type === 'AudioRecord' && replyToMessage.fileStatus === 'Done' && <div className={styles['audio-message-container']}>
                            <Microphone size={20} />
                            <span>Audio message</span>
                        </div>
                    }

                    {
                        replyToMessage?.type === 'PlainText' && <span className={styles['reply-message-text']}>{replyToMessage?.messageText}</span>
                    }
                </div>
            </div>

            <div className={styles['action-bar-container']}>
                <textarea
                    rows={1}
                    onChange={handleOnTextChange}
                    value={textInput}
                    placeholder='Enter message...'
                    onKeyDown={handleKeyDown}
                    ref={messageInputRef}
                    onPasteCapture={handleOnPasteCapture}
                    onDrop={handleDropFile}
                    onDragOver={handleDragFileOver}

                />
                <div className={styles['btn-container']}>
                    <IconButton type='button' ref={iconButtonRef} onClick={handleClickShowEmoji} >
                        <Smiley />
                    </IconButton>
                    <IconButton type='button' onClick={startRecording}>
                        <Microphone size={24} />
                    </IconButton>

                    <IconButton onClick={() => attachFileRef.current?.click()} type='button'>
                        <Paperclip size={24} />
                    </IconButton>

                    <input type='file' style={{ display: 'none' }} ref={attachFileRef} onChange={handleSelectFile} />
                    <IconButton className={styles.send} type='submit'>
                        <PaperPlaneRight />
                    </IconButton>
                    <div
                        ref={emojiPickerContainerRef}
                        className={generateClassName(styles, ['emoji-picker-container', ...!showEmojiPicker ? ['d-none'] : []])} style={{
                            bottom: window.innerHeight - (iconButtonRef.current?.offsetTop ?? 0) + 15,
                            right: window.innerWidth <= 330 ? 0 : 10,
                        }} >
                        <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                    </div>
                </div>
            </div>
            {
                selectedFile && <AttachedFiles file={selectedFile} onFileDeselect={handleDeselectFile} />
            }
        </form >

    )
}

export default ActionBar
