import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/global.scss';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store.ts';
import "react-toastify/dist/ReactToastify.css";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>

)
