import { IconButton, ListItemIcon, ListItemText, MenuItem, MenuList, Typography } from '@mui/material';
import Avatar from '../../../components/Avatar';
import { useChatContext, useChatRoomSummaryContext, useCurrentChatRoomContext } from '../../../helper/getContext';
import styles from '../../../styles/ChatInfo.module.scss';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import { generateClassName } from '../../../utils/generateClassName';
import { ArrowLeft } from 'phosphor-react';
import { ChatRoomSummaryActionType, SetMutedDTO } from '../../../types/dataType';
import { UserChatRoomAPI } from '../../../api';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import AddGroupChatModal from '../../../components/AddGroupChatModal/AddGroupChatModal';
import { useEffect, useState } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ChatMembers from './ChatMembers';
import UpdateChatRoomNameModal from './UpdateChangeRoomNameModal';

function ChatInfo() {
  const { currentChatRoomSummary, currentChatRoomInfo } = useCurrentChatRoomContext();
  const { dispatchChatRoomSummary } = useChatRoomSummaryContext();
  const { showChatInfo, setShowChatInfo } = useChatContext();
  const [openAddPeopleToGroup, setOpenAddPeopleToGroup] = useState(false);
  const [showChatMembers, setShowChatMembers] = useState(false);
  const [openUpdateChatNameModal, setOpenUpdateChatNameModal] = useState(false);

  async function handleClickMute() {
    if (!currentChatRoomSummary) return;

    try {
      const mutedDTO: SetMutedDTO = {
        id: currentChatRoomSummary.userChatRoom.id,
        isMuted: !currentChatRoomSummary.userChatRoom.isMuted,
      }
      var userChatRoomResponse = await UserChatRoomAPI.setMuted(mutedDTO);
      dispatchChatRoomSummary({ type: ChatRoomSummaryActionType.USERTUSERCHATROOM, payload: userChatRoomResponse.data });
    }
    catch (err) {
      console.error(err);
    }
  }

  function handleLeave(_event: React.MouseEvent<HTMLLIElement, MouseEvent>): void {
    throw new Error('Function not implemented.');
  }

  function handleClickBack() {
    if (showChatMembers) {
      setShowChatMembers(false);
    }
    else {
      setShowChatInfo(false)
    }
  }

  useEffect(() => {
    setShowChatMembers(false);
  }, [currentChatRoomSummary?.chatRoom.id])

  return (
    <aside className={generateClassName(styles, ['chat-info-container', ...showChatInfo ? [] : ['d-none']])}>

      <div className={styles.navbar}>
        <IconButton onClick={handleClickBack}><ArrowLeft /></IconButton>
        <Typography className={styles.title} noWrap variant='h6'>{showChatMembers ? 'Chat members' : 'Chat information'}</Typography>
      </div>

      {
        showChatMembers ? <ChatMembers users={currentChatRoomSummary?.users ?? []} /> : <div className={styles['chat-info']}>

          <div className={styles['avatar-container']}>
            <Avatar imgUrl={currentChatRoomInfo?.imgUrl} name={currentChatRoomInfo?.name} size={5} />
          </div>

          <div className={styles['title-container']}>
            <span>{currentChatRoomInfo?.name}</span>
            {
              currentChatRoomSummary?.chatRoom.chatRoomType === 'MANY' && <>
                <IconButton onClick={() => setOpenUpdateChatNameModal(true)}>
                  <EditIcon />
                </IconButton>
                <UpdateChatRoomNameModal
                  open={openUpdateChatNameModal}
                  onClose={() => setOpenUpdateChatNameModal(false)}
                  chatRoom={currentChatRoomSummary?.chatRoom}
                  chatRoomInfo={currentChatRoomInfo} />
              </>

            }

          </div>

          <div className={styles['header-actions-container']}>
            <div className={styles['action']}>
              <IconButton onClick={handleClickMute}>
                {
                  currentChatRoomSummary?.userChatRoom.isMuted ? <NotificationsOffIcon color='primary' /> : <NotificationsIcon />
                }
              </IconButton>
              {currentChatRoomSummary?.userChatRoom.isMuted ? 'Unmute' : 'Mute'}
            </div>
            <div className={generateClassName(styles, ['action', ...currentChatRoomSummary?.chatRoom.chatRoomType === 'ONE' ? ['d-none'] : []])}>
              <IconButton onClick={() => setOpenAddPeopleToGroup(true)}>
                <PersonAddIcon />
              </IconButton>
              Add people
            </div>
            <AddGroupChatModal
              open={openAddPeopleToGroup}
              onClose={() => setOpenAddPeopleToGroup(false)}
              type='AddMember'
              members={currentChatRoomSummary?.users}
            />
          </div>
          {
            currentChatRoomSummary?.chatRoom.chatRoomType === 'MANY' && <div className={styles['chat-members-container']}>
              <Typography variant='h6'>Group members</Typography>
              <MenuList>
                <MenuItem onClick={() => setShowChatMembers(true)}>
                  <ListItemIcon >
                    <PeopleOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{`${currentChatRoomSummary?.users.length} members`}</ListItemText>
                </MenuItem>
              </MenuList>
            </div>

          }

          <MenuList className={styles['actions-container']}>
            <MenuItem>
              <ListItemIcon >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete messages</ListItemText>
            </MenuItem>

            {currentChatRoomSummary?.chatRoom.chatRoomType === 'MANY' && <MenuItem onClick={handleLeave}>
              <ListItemIcon >
                <ExitToAppOutlinedIcon fontSize="small" color='error' />
              </ListItemIcon>
              <ListItemText sx={{ color: 'red' }}>Leave chat room</ListItemText>
            </MenuItem>}

            {currentChatRoomSummary?.chatRoom.chatRoomType === 'MANY' && <MenuItem>
              <ListItemIcon >
                <DeleteOutlineOutlinedIcon fontSize="small" color='error' />
              </ListItemIcon>
              <ListItemText sx={{ color: 'red' }}>Delete chat room</ListItemText>
            </MenuItem>}
          </MenuList>

        </div>

      }

    </aside >
  )
}

export default ChatInfo