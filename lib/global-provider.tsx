import { createContext, ReactNode, useContext } from "react";
import { useAppwrite } from "./useAppwrite";
import { getCurrentUser } from "./appwrite";
import { View, Text } from 'react-native'; // Import React Native components

interface User {
    $id: string;
    name: string;
    email: string;
    avatar: string;
}

interface GlobalContextType {
    isLoggedIn: boolean;
    user: User | null;
    loading: boolean;
    refetch: (newParams?: Record<string, string|number>) => Promise<void>;
    // refetch: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
    children: ReactNode;
}

export const GlobalProvider = ({children}: GlobalProviderProps) => {
    const {
        data:user,
        loading,
        error,
        refetch
    } = useAppwrite({    
        fn: getCurrentUser,
    
    })

    const isLoggedIn = !!user;
    
    if (loading) {
        return <View><Text>Loading...</Text></View>; // Add a loading state
    }
    
    if (error) {
        return <View><Text>Error: {error}</Text></View>; // Add error handling
    }

    return (
        <GlobalContext.Provider value ={{
            isLoggedIn,
            user,
            loading,
            refetch,
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = (): GlobalContextType => {
    const context = useContext(GlobalContext);
    if(!context) {
        throw new Error('useGlobalContext must be used within a GlobalProvider');
    }
    return context;
}

export default GlobalProvider;