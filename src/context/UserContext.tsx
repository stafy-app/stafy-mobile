// src/context/UserContext.tsx

import React, {createContext, useEffect, useState} from 'react';
import {api} from "../services/api";
import {deleteItem, saveItem} from "@/src/services/storage";
import {Redirect, router} from "expo-router";
import {getItem} from "expo-secure-store";


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
    email?: string;
    password?: string;
    name?: string;
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

            setIsLoading(true);

            // create the form data
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            console.log("Sending login request with data: " +
                "\nEmail: " + formData.get('username'));

            // send data to backend
            const response = await api.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log("Response from backend: ", response.data);

            if (!response) {
                console.error("No response received from the server");
                throw new Error("No response received from the server");
            }

            // get data from backend
            const {id, access_token: token, token_type, role} = response.data;

            const userData = {id, email, role}

            // save user data in state
            setUser(userData)

            // save user and token in local storage
            await saveItem('@stafy_userData', JSON.stringify(userData));
            await saveItem('@stafy_token', token);


            // redirect to home page
            console.log("Redirecting to home page\nToken: ", token, "\nId: ", id, "\nUser: ", userData);
            router.replace("/attendance");

        } catch (error: any) {
            console.log(error.response.data.message)
            throw new Error(error.response.data.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function register(registerData: RegisterData) {

        try {
            setIsLoading(true);

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
            setIsLoading(false);

            return true
        } catch (error: any) {
            console.log(error.response.data.message)
            throw new Error(error.response.data.message);
        }

    }

    async function logout() {
        // remove user data from state
        setUser(null);
        await deleteItem('@stafy_id');
        await deleteItem('@stafy_token');
    }

    useEffect(() => {

        // check if user is logged in
        const authCheck = async () => {
            try {
                const storedUserData = await getItem('@stafy_id');
                const storedToken = await getItem('@stafy_token');

                // ToDO Finsih the useEffect
            } catch (error) {
                console.error("Error checking authentication:", error);
            }
        }

    }, [])

    return (
        <UserContext.Provider value={{user, isLoading, login, register, logout}}>
            {children}
        </UserContext.Provider>
    )
}