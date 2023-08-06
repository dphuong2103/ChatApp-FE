import { IconButton } from '@mui/material';
import { ArrowLeft } from 'phosphor-react';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import SearchBar from '../../../../components/SearchBar';
import styles from '../../../../styles/ContactTab.module.scss';
import { useState } from 'react';

import RadioButtons from '../../../../components/RadioButtons';
import RadioButton from '../../../../components/RadioButton';

const ContactViewOptions = {
  friends: 'Friends',
  groups: 'Groups',
  friendRequests: 'Friend Requests',
} as const;

type ContactSelection = keyof typeof ContactViewOptions;


function ContactTab() {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const [contactView, setContactView] = useState<ContactSelection>('friends');

  function handleChangeContactView(e: React.ChangeEvent<HTMLInputElement>) {
    setContactView(e.target.value as ContactSelection);
    let path = '/home/contact';
    switch (e.target.value as ContactSelection) {
      case 'friends': {
        path += '/friends';
        break;
      }
      case 'friendRequests': {
        path += '/friendrequests';
        break;
      }
      case 'groups': {
        path += '/groups';
        break;
      }
      default: break;
    }
    navigate(path);
  }

  function handleSearchInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchInput(e.target.value)
  }
  function handleSearchInputFocusIn() {
  }
  function handleOnSearchInputFocusOut() {
  }
  function handleBackClick() {
    navigate('/home/chatlist')
  }

  return (
    <div className={styles['contact-tab-container']}>
      <div className={styles['navgigation-container']}>
        <IconButton onClick={handleBackClick} >
          <ArrowLeft />
        </IconButton>
        <SearchBar
          handleFocusIn={handleSearchInputFocusIn}
          handleFocusOut={handleOnSearchInputFocusOut}
          value={searchInput}
          onChange={handleSearchInputChange} />
      </div>
      <RadioButtons>
        {Object.keys(ContactViewOptions).map(key => <RadioButton checked={contactView === key} onChange={handleChangeContactView} value={key} key={key}>{ContactViewOptions[key as ContactSelection]}</RadioButton>)}
      </RadioButtons>
      <Outlet context={{ searchInput, setSearchInput }} />

    </div >
  )
}

export default ContactTab

type OutletContextType = { searchInput: string, setSearchInput: (value: React.SetStateAction<string>) => void }
export function useSearchInput() {
  return useOutletContext<OutletContextType>();
}