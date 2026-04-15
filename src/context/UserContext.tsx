// src/context/UserContext.tsx

import React, {createContext, useState} from 'react';
import {api} from "../services/api";
import {saveItem} from "@/src/services/storage";
import {Redirect} from "expo-router";


interface RegisterData {
    name: string;
    surname: string;
    email: string;
    phone?: string;
    role: string;
    password: string;
}

interface User {
    id: string;
    email: string;
    password: string;
    name: string;
}

interface UserContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (registerData: RegisterData) => Promise<boolean>;
    logout: () => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export default function UserProvider({children}: { children: React.ReactNode }) {

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function login(email: string, password: string) {

        try {

            // create the form data
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            console.log("Sending login request with data: ", formData);

            // send data to backend
            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log("Response from backend: ", response.data);

            // get data from backend
            const {id, access_token: token} = response.data;

            // save user and token in local storage
            await saveItem('@stafy_id', JSON.stringify(user));
            await saveItem('@stafy_token', token);

            // set user in state
            setUser(user);


            // redirect to home page
            console.log("Redirecting to home page\nToken: ", token, "\nId: ", id);
        } catch (error: any) {
            console.log(error.response.data.message)
            throw new Error(error.response.data.message);
        }
    }

    async function register(registerData: RegisterData) {

        try{

            // send data to backend
            const response = await api.post('/auth/register', {
                'first_name': registerData.name,
                'last_name': registerData.surname,
                'email': registerData.email,
                //'phone': registerData.phone, // will be implemented later
                'role': registerData.role,
                'password': registerData.password,
            });

            console.log("Response from backend: ", response.data);

            return true
        } catch (error: any) {
            console.log(error.response.data.message)
            throw new Error(error.response.data.message);
        }

    }

    async function logout() {

    }

    return (
        <UserContext.Provider value={{user, isLoading, login, register, logout}}>
            {children}
        </UserContext.Provider>
    )
}