import { useEffect, useRef, useState } from 'react';
import { useChatRoomSummaryContext, useCurrentChatRoomContext } from '@helper/getContext';
import styles from '@styles/ChatContent.module.scss';
import Message from './message/Message';
import { IconButton } from '@mui/material';
import { ArrowDown } from 'phosphor-react';
import { generateClassName } from '@helper/generateClassName';
import { User, UserWithRelationship } from '@data-type';
import { getRelationship } from '@helper/relationshipHelper';
import { useAppSelector } from '../../../../redux/store';
import UserInfoModal from '../../../../components/UserInfoModal';
function ChatContent() {
  const containerScrollableRef = useRef<HTMLDivElement>(null);
  const chatContentContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastMessageRef = useRef<Element | null>(null);
  const { messages, getMessagesPageByChatRoomId, currentChatRoomSummary } = useCurrentChatRoomContext();
  const { relationships } = useChatRoomSummaryContext();
  const currentUser = useAppSelector(state => state.auth.user?.id);
  const [selectedUserWithRelationship, setSelectedUserWithRelationship] = useState<UserWithRelationship | null>(null);
  const [openUserInfoModal, setOpenUserInfoModal] = useState(false);

  useEffect(() => {
    if (!isScrolling) {
      chatContentContainerRef.current?.scrollIntoView(
        {
          block: 'end',
          inline: 'nearest',
        })
      setIsScrolling(false);
    }
  }, [messages]);

  useEffect(() => {
    setIsScrolling(false);
  }, [currentChatRoomSummary])

  const handleOnScroll = async () => {
    const eligibleToGetNewMessages = containerScrollableRef.current?.scrollTop == 0
      && chatContentContainerRef.current?.clientHeight
      && containerScrollableRef.current.clientHeight
      && chatContentContainerRef.current?.clientHeight > (containerScrollableRef.current.clientHeight)
      && isScrolling;

    if (eligibleToGetNewMessages) {
      lastMessageRef.current = chatContentContainerRef.current.children[0];
      await getMessagesPageByChatRoomId();
      setTimeout(() => { lastMessageRef.current?.scrollIntoView({ block: "start", inline: "nearest" }); }, 100)
    };

    if (containerScrollableRef
      && containerScrollableRef.current!.scrollHeight <= containerScrollableRef.current!.scrollTop + containerScrollableRef.current!.clientHeight * 1.1) {
      setIsScrolling(false);

    } else {
      setIsScrolling(true);
    };
  };

  const bottomBtnClassName = isScrolling ? generateClassName(styles, ['btn-to-bottom-container']) : generateClassName(styles, ['btn-to-bottom-container', 'd-none']);

  function handleToBottomClick() {
    chatContentContainerRef.current?.scrollIntoView(
      {
        block: 'end',
        inline: 'nearest',
        behavior: 'smooth'
      })
  }

  function handleOnLoad() {
    if (!isScrolling) {
      setTimeout(() => {
        chatContentContainerRef.current?.scrollIntoView(
          {
            block: 'end',
            inline: 'nearest',
          })
      }, 100)
    }
  }

  function handleAvatarSelect(user: User) {
    if (!currentUser) return;
    const relationship = getRelationship(currentUser, user.id, relationships);
    setSelectedUserWithRelationship({ relationship: relationship ?? undefined, user: user });
    setOpenUserInfoModal(true);
  }

  return (
    <div className={styles['chat-content-wrapper']}>
      <div className={styles['container-scrollable']} ref={containerScrollableRef} onScroll={handleOnScroll} onLoad={handleOnLoad}>
        <div className={styles['chat-content-container']} ref={chatContentContainerRef}>
          {messages.map((message) => <Message message={message} key={message.id} onAvatarClick={() => handleAvatarSelect(message.sender)} />)}
        </div>
      </div>

      <div className={bottomBtnClassName}>
        <IconButton className={styles['btn-to-bottom']} onClick={handleToBottomClick} >
          <ArrowDown />
        </IconButton>
      </div>
      {
        selectedUserWithRelationship?.user.id && <UserInfoModal open={openUserInfoModal} onClose={() => setOpenUserInfoModal(false)} relationship={selectedUserWithRelationship?.relationship} userId={selectedUserWithRelationship.user.id} />
      }
    </div>
  )
}

export default ChatContent

