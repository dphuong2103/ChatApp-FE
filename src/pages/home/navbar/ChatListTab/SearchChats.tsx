import { useEffect, useState } from 'react';
import styles from '../../../../styles/SearchChats.module.scss';
import { useSearchInput } from './ChatListTab';
import { useChatRoomSummaryContext, useCurrentChatRoomContext } from '../../../../helper/getContext';
import SearchedChat from './SearchedChat';
import { ChatRoomSummary, User } from '../../../../types/dataType';
import { isValidEmail } from '../../../../helper/checkString';
import { UserAPI } from '../../../../api';
import { useDebounce } from '../../../../hooks/useDounceSearch';
import { filterChatRoom, removeDuplicateChat } from '../../../../helper/chatRoomHelper';
import { isUser, isChatRoomSummary } from '../../../../helper/checkType';
function SearchChats() {
  const { searchInput } = useSearchInput();
  const [searchResult, setSearchResult] = useState<(ChatRoomSummary | User)[]>([]);
  const { chatRoomSummaries } = useChatRoomSummaryContext();
  const searchInputDebounce = useDebounce(searchInput, 400);
  const { handleSetCurrentChatRoomSummary, handleNewChatSelect } = useCurrentChatRoomContext();

  useEffect(() => {
    const abortController = new AbortController();
    searchAndFilter();
    async function searchAndFilter() {
      if (searchInputDebounce === '') {
      setSearchResult([]);
        return;
      }

      var filterAndSearchResults: (ChatRoomSummary | User)[] = filterChatRoom(chatRoomSummaries, searchInputDebounce);
      if (isValidEmail(searchInputDebounce)) {
        var searchedUsersByEmail = await searchUserByEmail();
        filterAndSearchResults = removeDuplicateChat(filterAndSearchResults, searchedUsersByEmail);
      }
      setSearchResult([...filterAndSearchResults])
    }

    async function searchUserByEmail() {
      const searchResponse = await UserAPI.searchUser(searchInputDebounce, abortController);
      return searchResponse.data;
    }

    return () => { setSearchResult([]), abortController.abort() }
  }, [searchInputDebounce])

  async function handleSearchedChatClick(searchedResult: ChatRoomSummary | User) {
    if (isUser(searchedResult)) {
      handleNewChatSelect(searchedResult);
    } else if (isChatRoomSummary(searchedResult)) {
      handleSetCurrentChatRoomSummary(searchedResult);
    }
  }

  return (
    <div className={styles['search-user-tab-container']}>
      {searchResult.map(sr => <SearchedChat searchedResult={sr} key={(sr as ChatRoomSummary).chatRoom?.id || (sr as User).id} onClick={handleSearchedChatClick} />)}
    </div>
  )

}

export default SearchChats
