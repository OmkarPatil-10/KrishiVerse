import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/i18n'; // Import i18n config
import { AuthProvider } from './context/AuthContext';
import { ProfileSidebarProvider } from './context/ProfileSidebarContext';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { StateContextProvider } from "./context/index";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThirdwebProvider activeChain="sepolia">
      <StateContextProvider>
        <AuthProvider>
          <ProfileSidebarProvider>
            <App />
          </ProfileSidebarProvider>
        </AuthProvider>
      </StateContextProvider>
    </ThirdwebProvider>
  </React.StrictMode>,
)

