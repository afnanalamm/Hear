
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { server } from './serverConfig';

interface AuthenticationProps {
    authenticationState?: {token: string | null; authenticated: boolean | null };
    onCreate_Account?: (emailAddress: string, password: string) => Promise<any>; 
    onLogin?: (emailAddress: string, password: string) => Promise<any>; 
    onFetchAllPosts?: () => Promise<any>;
    onVote?: (postID: string, reactionType: string) => Promise<any>;
    onCreatePost?: (postData: any) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const TOKEN_KEY = 'my-jwt';
const LOGIN_ENDPOINT = `${server}/check_login`
const CREATE_ACCOUNT_ENDPOINT = `${server}/create_account`
const FETCH_ALL_POSTS_ENDPOINT = `${server}/allposts`
const VOTE_ENDPOINT = `${server}/vote`
const CREATE_POST_ENDPOINT = `${server}/create_post`
const AuthenticationContext = createContext<AuthenticationProps>({});

export const useAuthentication = () => { 
    return useContext (AuthenticationContext);
};

export const AuthenticationProvider = ({children} : any ) => {
    const [authenticationState, setAuthenticationState] = useState<{
        token: string | null; 
        authenticated: boolean | null }>
        ({
        token: null,
        authenticated: null,
    });

    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            console.log('Loaded token: ', token);
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setAuthenticationState({ 
                    token: token, 
                    authenticated: true 
                });
            } else {
                setAuthenticationState({ 
                    token: token, 
                    authenticated: false 
                });
            }
        };
        loadToken();
    }, [])

    const create_account = async(emailAddress: string, password: string) => {
        try {
            return await axios.post(CREATE_ACCOUNT_ENDPOINT,{ emailAddress, password})
        } catch (e) {
            return {error: true, msg: (e as any).response.data.msg};
        }
    }

    const login = async(emailAddress: string, password: string) => {
        try {
            const response =  await axios.post(LOGIN_ENDPOINT,{ emailAddress, passwordHash: password})
            console.log("Response from server", response)

            const token = response.data.access_token;

            setAuthenticationState({ token, authenticated: true });
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await SecureStore.setItemAsync(TOKEN_KEY, token);

            return response;
        } catch (e) {
            return {error: true, msg: (e as any).response.data.msg};
        }
    }

    const fetchAllPosts = async() => {
        try {
            await SecureStore.getItemAsync(TOKEN_KEY);

            const response = await axios.get(FETCH_ALL_POSTS_ENDPOINT)
            console.log("Response from server", response)

            return response;

        } catch (e) {
            return {error: true, msg: (e as any).response.data.msg};
        }
    }

    const vote = async(postID: string, reactionType: string) => {
        try {
            await SecureStore.getItemAsync(TOKEN_KEY);

            const response =  await axios.post(VOTE_ENDPOINT, {postID, reactionType})
            console.log("Response from server", response)

            setAuthenticationState({
                token: response.data.token,
                authenticated: true
            });

            
            return response;
        } catch (e) {
            return {error: true, msg: (e as any).response.data.msg};
        }
    }

    const createPost = async(postData: any) => {
        try {
            await SecureStore.getItemAsync(TOKEN_KEY);

            const response =  await axios.post(CREATE_POST_ENDPOINT, {postData})
            console.log("Response from server", response)

            setAuthenticationState({
                token: response.data.token,
                authenticated: true
            });

            
            return response;
        } catch (e) {
            return {error: true, msg: (e as any).response.data.msg};
        }
    }

    const logout = async() => {
        await SecureStore.deleteItemAsync(TOKEN_KEY); // deleting token from storage
        axios.defaults.headers.common['Authorization'] = '';
        setAuthenticationState({
            token: null,
            authenticated: false
        })
    }


    const value = {
        onCreate_Account: create_account,
        onLogin: login,
        onLogout: logout,
        onFetchAllPosts: fetchAllPosts,
        onVote: vote,
        onCreatePost: createPost,
        authenticationState
    };

    return <AuthenticationContext.Provider value={value}>{children}</AuthenticationContext.Provider>

    }