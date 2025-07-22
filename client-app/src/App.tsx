import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConnectButton } from "thirdweb/react";
import { client, wallets } from "./config/thirdweb";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import ARExperiencePage from "./pages/ARExperiencePage";
import MyTicketsPage from "./pages/MyTicketsPage";
import ProfilePage from "./pages/ProfilePage";
// import MetaMaskTroubleshooter from "./components/MetaMaskTroubleshooter";
import EventsDebug from "./components/EventsDebug";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "thirdweb/react";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider client={client}>
        <ErrorBoundary>
          <Router>
            <div className="App">
              {/* ConnectButton provides wallet connection and social login */}
              <ConnectButton client={client} wallets={wallets} />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                <Route
                  path="/ar-experience/:eventId"
                  element={<ARExperiencePage />}
                />
                <Route path="/my-tickets" element={<MyTicketsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
              {/* <MetaMaskTroubleshooter /> */}
            </div>
          </Router>
        </ErrorBoundary>
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}

export default App;
