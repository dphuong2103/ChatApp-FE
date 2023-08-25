import { Button, Dialog, DialogActions, DialogTitle, IconButton, ListItemIcon, ListItemText, MenuItem, MenuList, Typography } from '@mui/material';
import Avatar from '../../../../components/Avatar';
import { useChatContext, useChatRoomSummaryContext, useCurrentChatRoomContext } from '@helper/getContext';
import styles from '@styles/ChatInfo.module.scss';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import { generateClassName } from '@helper//generateClassName';
import { ArrowLeft } from 'phosphor-react';
import { ChatRoomSummaryActionType, SetMutedDTO } from '@data-type';
import { UserChatRoomAPI } from '@api';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import AddGroupChatModal from '../../../../components/AddGroupChatModal/AddGroupChatModal';
import { useEffect, useState } from 'react';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ChatMembers from './ChatMembers';
import UpdateChatRoomNameModal from '../UpdateChangeRoomNameModal';
import UserInfoModal from '../../../../components/UserInfoModal';
import UploadAvatar from '../../../../components/UploadAvatar';
import { toast } from 'react-toastify';

function ChatInfo() {
  const { currentChatRoomSummary, currentChatRoomInfo } = useCurrentChatRoomContext();
  const { dispatchChatRoomSummary } = useChatRoomSummaryContext();
  const { showChatInfo, setShowChatInfo } = useChatContext();
  const [openAddPeopleToGroup, setOpenAddPeopleToGroup] = useState(false);
  const [showChatMembers, setShowChatMembers] = useState(false);
  const [openUpdateChatNameModal, setOpenUpdateChatNameModal] = useState(false);
  const [openUserInfoModal, setOpenUserInfoModal] = useState(false);
  const [openUploadAvatar, setOpenUploadAvatar] = useState(false);
  const [openLeaveChatDialog, setOpenLeaveChatDialog] = useState(false);

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

  async function handleLeave() {
    if (!currentChatRoomSummary?.userChatRoom.id) return;
    try {
      await UserChatRoomAPI.leavechatroom(currentChatRoomSummary.userChatRoom.id);
    } catch (err) {
      toast.error("Error leaving chat room, please try again later!");
      console.log(err);
    } finally {
      setOpenLeaveChatDialog(true);
    }
  }

  function handleClickBack() {
    if (showChatMembers) {
      setShowChatMembers(false);
    }
    else {
      setShowChatInfo(false)
    }
  }

  function handleClickAvatar() {
    if (currentChatRoomSummary?.chatRoom.chatRoomType === 'ONE') {
      setOpenUserInfoModal(true)
    }
    else if (currentChatRoomSummary?.chatRoom.chatRoomType === 'MANY') {
      setOpenUploadAvatar(true);
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
            <Avatar imgUrl={currentChatRoomInfo?.imgUrl} name={currentChatRoomInfo?.name} size={5} onClick={handleClickAvatar} />
            <UploadAvatar open={openUploadAvatar} handleClose={() => setOpenUploadAvatar(false)} type='ChatRoomAvatar' />
          </div>
          <UserInfoModal
            open={openUserInfoModal}
            userId={currentChatRoomInfo?.partners[0] ? currentChatRoomInfo?.partners[0].id : undefined}
            relationship={currentChatRoomInfo?.relationship ? currentChatRoomInfo?.relationship : undefined}
            onClose={() => setOpenUserInfoModal(false)}
          />
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
            <MenuItem onClick={() => { toast.error('Function is underdevelopment!') }}>
              <ListItemIcon >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete messages</ListItemText>
            </MenuItem>

            {currentChatRoomSummary?.chatRoom.chatRoomType === 'MANY' && <MenuItem onClick={() => setOpenLeaveChatDialog(true)}>
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
          <Dialog
            open={openLeaveChatDialog}
            onClose={() => setOpenLeaveChatDialog(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Are you sure you want to leave this chat room?"}
            </DialogTitle>
            <DialogActions>
              <Button onClick={() => setOpenLeaveChatDialog(false)}>Cancel</Button>
              <Button onClick={handleLeave} autoFocus color='error' >
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      }

    </aside >
  )
}

export default ChatInfo