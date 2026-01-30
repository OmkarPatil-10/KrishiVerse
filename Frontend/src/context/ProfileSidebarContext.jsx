import { createContext, useContext, useState } from 'react';

const ProfileSidebarContext = createContext();

export const useProfileSidebar = () => {
    const context = useContext(ProfileSidebarContext);
    if (!context) {
        throw new Error('useProfileSidebar must be used within ProfileSidebarProvider');
    }
    return context;
};

export const ProfileSidebarProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openSidebar = () => setIsOpen(true);
    const closeSidebar = () => setIsOpen(false);
    const toggleSidebar = () => setIsOpen(prev => !prev);

    return (
        <ProfileSidebarContext.Provider value={{ isOpen, openSidebar, closeSidebar, toggleSidebar }}>
            {children}
        </ProfileSidebarContext.Provider>
    );
};

