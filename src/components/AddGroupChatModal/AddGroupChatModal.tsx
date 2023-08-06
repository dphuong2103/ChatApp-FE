import { Button, IconButton, Modal, TextField, Typography } from '@mui/material';
import styles from '../../styles/AddGroupChatModal.module.scss';
import { X } from 'phosphor-react';
import SearchBar from '../SearchBar';
import { useEffect, useState } from 'react';
import Partner from './Partner';
import { AddMembersToChatGroup, NewChatRoom, NewChatRoomAndUserList, User as TUser, User } from '../../types/dataType';
import { useAppSelector } from '../../redux/store';
import SelectedPartner from './SelectedPartner';
import { useChatRoomSummaryContext, useCurrentChatRoomContext } from '../../helper/getContext';
import { stringContains } from '../../helper/checkString';
import { ChatRoomAPI, UserChatRoomAPI } from '../../api';
import { generateClassName } from '../../utils/generateClassName';
import { isChatRoomSummary } from '../../helper/checkType';

function AddGroupChatModal({ open, onClose, members, type }: AddGroupChatModalProps) {
    const [searchValue, setSearchValue] = useState('');
    const currentUser = useAppSelector(state => state.auth.user);
    const { currentChatRoomSummary, handleSetCurrentChatRoomSummary } = useCurrentChatRoomContext();
    const [partners, setPartners] = useState<TUser[]>([]);
    const { chatRoomSummaries } = useChatRoomSummaryContext();
    const [selectedPartners, setSelectedPartners] = useState<TUser[]>([]);
    const [filteredPartners, setFilteredPartners] = useState<TUser[]>([]);
    const [chatRoomName, setChatRoomName] = useState('');

    useEffect(() => {
        setPartners([...getPartnertIds()]);
        function getPartnertIds() {
            const partnerUsers: TUser[] = [];
            if (!currentUser) return partnerUsers;
            chatRoomSummaries.forEach(crSummary => {
                if (crSummary.chatRoom.chatRoomType === 'ONE') {
                    const partnerUser = crSummary.users.find(user => user.id !== currentUser.id);
                    if (partnerUser) {
                        partnerUsers.push(partnerUser);
                    }
                }
            });
            return partnerUsers
        }
    }, [chatRoomSummaries])

    function handleOnClose() {
        setSelectedPartners([]);
        setSearchValue('');
        setChatRoomName('');
        onClose()
    }

    useEffect(() => {
        handleFilterPartners();

        function handleFilterPartners() {
            if (!searchValue) {
                setFilteredPartners([...partners]);
                return;
            }
            let filter = partners.filter(partner => stringContains(partner.displayName, searchValue) || stringContains(partner.email, searchValue));
            setFilteredPartners([...filter])
        }
    }, [searchValue, partners])

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchValue(e.target.value);
    }

    function handlePartnerSelect(partner: TUser) {
        setSelectedPartners(prev => {
            var partnerIndex = prev.findIndex(p => p.id === partner.id);
            if (partnerIndex === -1) {
                return [...prev, partner];
            }
            else {
                return [...prev.filter(p => p.id !== partner.id)]
            }
        })
    }

    function handleDelectPartner(partner: TUser) {
        setSelectedPartners(prev => [...prev.filter(p => p.id !== partner.id)]);
    }

    async function handleSubmitCreateGroup() {
        type === 'AddMember' ? await handleAddMembers() : await handleCreateNewGroup();
        handleOnClose();
    }

    async function handleCreateNewGroup() {
        try {
            const newChatRoom: NewChatRoom = {
                chatRoomType: 'MANY',
                creatorId: currentUser!.id,
                name: chatRoomName
            }
            let userIds = selectedPartners.map(p => p.id);
            userIds.push(currentUser!.id);
            const newChatRoomAndUserList: NewChatRoomAndUserList = {
                newChatRoom: newChatRoom,
                userIds: userIds
            }
            var chatRoomSummary = (await ChatRoomAPI.addNewChatRoomGroup(newChatRoomAndUserList)).data;
            if (isChatRoomSummary(chatRoomSummary)) {
                handleSetCurrentChatRoomSummary(chatRoomSummary, true);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handleAddMembers() {
        if (!currentChatRoomSummary) return;
        try {
            const newMemberRequest: AddMembersToChatGroup = {
                chatRoomId: currentChatRoomSummary.chatRoom.id,
                userIds: selectedPartners.map(p => p.id)
            }
            await UserChatRoomAPI.addMembersToChatGroup(newMemberRequest);

        } catch (err) {
            console.error(err);
        }
    }

    return <Modal open={open} onClose={handleOnClose} className={styles['add-group-chat-modal-backdrop']}>
        <div className={styles['modal-container']}>
            <div className={styles['content-container']}>
                <div className={styles['title-container']}>
                    <Typography variant='h6'>
                        {
                            type === 'AddMember' ? 'Add Member' : 'Add Group'
                        }
                    </Typography>
                    <IconButton onClick={handleOnClose}>
                        <X />
                    </IconButton>
                </div>
                <div className={generateClassName(styles, ['group-general-info', ...type === 'AddMember' ? ['d-none'] : []])}>
                    <TextField required value={chatRoomName} onChange={(e) => setChatRoomName(e.target.value)} fullWidth variant='standard' label='Group name' sx={{ '& .MuiInputBase-root': { borderRadius: '10px' } }} placeholder='Enter group name...' />
                </div>
                <div className={styles['search-container']}>
                    <SearchBar value={searchValue} onChange={handleSearchChange} placeholder="Search for users' email, name" />
                </div>
                <div className={styles['add-people-container']}>
                    <div className={styles['selected-people-section']}>
                        <span>Selected</span>
                        <div className={styles['scrollable']}>
                            <div className={styles['container']}>
                                {
                                    selectedPartners.map(p => <SelectedPartner user={p} onClick={() => handleDelectPartner(p)} key={p.id} />)
                                }
                            </div>

                        </div>
                    </div>
                    <div className={styles['partnerts-container-scrollable']}>
                        <div className={styles['partners-container']}>
                            {
                                filteredPartners.map((partner) => <Partner
                                    onClick={() => handlePartnerSelect(partner)}
                                    partner={partner} key={partner.id}
                                    checked={selectedPartners.findIndex(p => p.id === partner.id) > -1}
                                    isMember={members ? members.findIndex(m => m.id === partner.id) > -1 : undefined}
                                />)
                            }
                        </div>
                    </div>


                </div>
            </div>

            <div className={styles['actions-container']}>
                <Button variant='text' onClick={onClose}>Cancel</Button>
                <Button variant='contained' onClick={handleSubmitCreateGroup} disabled={(type === "New" && !chatRoomName) || (type == "New" && selectedPartners.length < 2)
                    || (type == "AddMember" && selectedPartners.length < 1)
                }>
                    {type === 'AddMember' ? 'Add Member' : 'Add Group'}
                </Button>
            </div>
        </div>
    </Modal>
}

export default AddGroupChatModal;

type AddGroupChatModalProps = {
    open: boolean,
    onClose: () => void,
    type: 'New' | 'AddMember',
    members?: User[]
}
