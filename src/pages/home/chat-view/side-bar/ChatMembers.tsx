import { RemoveFromGroupChat, User } from '@data-type'
import styles from '@styles/ChatMembers.module.scss';
import ChatMember from './ChatMember';
import { generateClassName } from '@helper//generateClassName';
import AddGroupChatModal from '../../../../components/AddGroupChatModal/AddGroupChatModal';
import { useState } from 'react';
import MemberMenu from './MemberMenu';
import { useOutsideClick } from '../../../../hooks/useClickOutside';
import { UserChatRoomAPI } from '@api';
import { useCurrentChatRoomContext } from '@helper/getContext';
function ChatMembers({ users }: ChatMembersProps) {
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [menuContainerAnchorEl, setMenuContainerAnchorEl] = useState<HTMLElement | null>(null);
    const menuContainerRef = useOutsideClick(() => handleMenuClose(), menuContainerAnchorEl);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { currentChatRoomSummary } = useCurrentChatRoomContext();
    function handleMenuClick(e: HTMLElement, user: User) {
        if (e == menuContainerAnchorEl) {
            setMenuContainerAnchorEl(null);
            return;
        }
        setSelectedUser(user);
        setMenuContainerAnchorEl(e);

    }

    function handleMenuClose() {
        setSelectedUser(null);
        setMenuContainerAnchorEl(null)
    }

    async function handleRemoveFromChat() {
        if (!selectedUser || !currentChatRoomSummary) return;
        try {
            const request: RemoveFromGroupChat = {
                chatRoomId: currentChatRoomSummary.chatRoom.id,
                userId: selectedUser.id,
            }
            await UserChatRoomAPI.removeMemberFromGroupChat(request);
        }
        catch (err) {
            console.error(err)
        }
    }

    return (
        <div className={styles['chat-members-container']}>
            <div className={styles['btn-container']}>
                <button className={generateClassName(styles, ['btn', 'add-member'])} onClick={() => setShowAddMemberModal(true)}>Add member</button>
            </div>
            <div className={styles['members-container']}>

            </div>
            {
                users.map(user =>
                    <ChatMember user={user} key={user.id} onMenuClick={handleMenuClick} />
                )
            }

            <AddGroupChatModal open={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} members={users} type='AddMember' />
            <MemberMenu anchorEl={menuContainerAnchorEl} onClose={handleMenuClose} ref={menuContainerRef} onRemoveFromChatClick={handleRemoveFromChat} />
        </div >
    )
}

export default ChatMembers

type ChatMembersProps = {
    users: User[],
}
