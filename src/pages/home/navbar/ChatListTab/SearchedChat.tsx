import styles from '../../../../styles/SearchedChat.module.scss';
import { ChatRoomInfo, ChatRoomSummary, User } from '../../../../types/dataType';
import { useEffect, useState } from 'react';
import { isChatRoomSummary, isUser } from '../../../../helper/checkType';
import { getChatRoomInfo } from '../../../../helper/chatRoomHelper';
import Avatar from '../../../../components/Avatar';
import { Typography } from '@mui/material';

function SearchedChat({ searchedResult, onClick }: SearchedChat) {
  const [chatNameAndPhoto, setChatNameAndPhoto] = useState<ChatRoomInfo | null>(null);
  useEffect(() => {
    if (isChatRoomSummary(searchedResult)) {
      setChatNameAndPhoto(getChatRoomInfo(searchedResult));
    }
    if (isUser(searchedResult)) {
      setChatNameAndPhoto({
        name: searchedResult.displayName,
        imgUrl: searchedResult.photoUrl,
        partners: [searchedResult]
      })
    }
  }, [searchedResult])

  async function handleOnClick() {
    onClick(searchedResult);
  }

  return (
    <div className={styles['searched-chat-container']} onClick={handleOnClick}>
      <Avatar name={chatNameAndPhoto?.name} imgUrl={chatNameAndPhoto?.imgUrl} />
      <div className={styles.info}>
        <Typography fontWeight={400} color={'black'} fontSize={'1rem'}>{chatNameAndPhoto?.name}</Typography>
      </div>
    </div>
  )
}

export default SearchedChat

type SearchedChat = {
  searchedResult: ChatRoomSummary | User,
  onClick: (searchedResult: User | ChatRoomSummary) => void
}
