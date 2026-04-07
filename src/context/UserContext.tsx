// src/context/UserContext.tsx

import React, { createContext, useState } from 'react';



interface User{
    id: string;
    email: string;
    password: string;
    name: string;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export default function UserProvider({children}: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function login(email: string, password: string) {
        console.log("Login, " + email);
        setUser({
            id: "1",
            email,
            password,
            name: "Angajat Stafy",
        });
    }

    async function register(email:string, password:string) {

    }

    async function logout() {

    }

    return (
        <UserContext.Provider value={{user, isLoading, login, register, logout}}>
            {children}
        </UserContext.Provider>
    )
}