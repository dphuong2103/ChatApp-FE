import Login from './pages/auth/Login'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import SignUp from './pages/auth/SignUp';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/auth/Auth';
import { useAppSelector } from './redux/store';
import ResetPassword from './pages/auth/ResetPassword';
import LoadingSpinner from './app/LoadingSpinner';
import { ToastContainer } from 'react-toastify';
import ChatListTab from './pages/home/navbar/ChatListTab/ChatListTab';
import ChatRooms from './pages/home/ChatRooms';
import SearchChats from './pages/home/navbar/ChatListTab/SearchChats';
import React from 'react';
import Friends from './pages/home/navbar/ContactsTab.tsx/Friends';
import FriendRequests from './pages/home/navbar/ContactsTab.tsx/FriendRequests';
import Groups from './pages/home/navbar/ContactsTab.tsx/Groups';
const LazyProfile = React.lazy(() => import('./pages/home/navbar/ProfileTab/ProfileTab'));
const LazyHomepage = React.lazy(() => import('./pages/home/HomepageWrapper'))
const LazyContact = React.lazy(() => import('./pages/home/navbar/ContactsTab.tsx/ContactTab'));
function App() {
  const useSelector = useAppSelector;
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const showLoadingSpinner = useSelector(state => state.loadingSpinner);
  return (
    <>
      <ToastContainer position='bottom-center' autoClose={2000} pauseOnHover={false} pauseOnFocusLoss={false} style={{ fontSize: '0.9rem' }} />
      {showLoadingSpinner && <LoadingSpinner />}
      <Routes>
        <Route path='/' element={isLoggedIn ? <Navigate to='/home' /> : <Navigate to='/auth' />} />
        <Route path='/auth' element={isLoggedIn ? <Navigate to='/home' /> : <Auth />}>
          <Route index element={<Navigate to='/auth/login' />} />
          <Route path='/auth/login' element={<Login />} />
          <Route path='/auth/signup' element={<SignUp />} />
          <Route path='/auth/resetpassword' element={<ResetPassword />} />
        </Route>
        <Route path='/home' element={isLoggedIn ? <React.Suspense fallback='Loading homepage...'>
          <LazyHomepage />
        </React.Suspense>
          : <Navigate to='/auth' />} >
          <Route index element={<Navigate to='/home/chatlist/chatrooms' />} />
          <Route path='/home/chatlist' element={<ChatListTab />} >
            <Route index element={<ChatRooms />} />
            <Route path='/home/chatlist/chatrooms' element={<ChatRooms />} />
            <Route path='/home/chatlist/search' element={<SearchChats />} />
          </Route>
          <Route path='/home/profile' element={
            <React.Suspense fallback='Loading...'>
              <LazyProfile />
            </React.Suspense>
          } />
          <Route path='/home/contact'
            element={<React.Suspense fallback='...loading'>
              <LazyContact />
            </React.Suspense>}>
            <Route index element={<Friends />} />
            <Route path='/home/contact/friends' element={<Friends />} />
            <Route path='/home/contact/friendrequests' element={<FriendRequests />} />
            <Route path='/home/contact/groups' element={<Groups />} />
          </Route>

        </Route>
      </Routes>
    </>
  )
}

export default App


