import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MsalProviderWrapper from "./context/MsalProviderWrapper";
import { msalInstance } from "./auth/msalConfig";

// Initialize MSAL instance properly
msalInstance.initialize().then(() => {
  // Handle redirect promise for popup/redirect flows
  msalInstance.handleRedirectPromise().then(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <MsalProviderWrapper>
          <App />
        </MsalProviderWrapper>
      </StrictMode>
    );
  });
}).catch(error => {
  console.error("MSAL initialization failed:", error);
  // Fallback render without MSAL if initialization fails
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});