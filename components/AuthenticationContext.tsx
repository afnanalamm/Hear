
import { createContext, useContext, useEffect, useState } from 'react'; // React hooks for context, state, and effects
import axios from 'axios'; // HTTP client for making API requests
import * as SecureStore from 'expo-secure-store'; // Secure storage for sensitive data like JWT tokens on mobile
import { server } from './serverConfig'; // Base server URL imported from config file

// Interface defining the shape of the authentication context value
interface AuthenticationProps {
    authenticationState?: {token: string | null; authenticated: boolean | null };
    onCreate_Account?: (emailAddress: string, password: string) => Promise<any>; 
    onLogin?: (emailAddress: string, password: string) => Promise<any>; 
    onFetchAllPosts?: () => Promise<any>;
    onVote?: (postID: string, reactionType: string) => Promise<any>;
    onFetchAllComments?: (postID: string) => Promise<any>;
    onCreateComment?: (commentData: any) => Promise<any>; // sending email address. Server will find userID from given emailAddress.
    onCreatePost?: (postData: any) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const TOKEN_KEY = 'my-jwt'; // Key used to store/retrieve the JWT in secure storage

// API endpoint constants constructed from the base server URL
const LOGIN_ENDPOINT = `${server}/check_login`
const CREATE_ACCOUNT_ENDPOINT = `${server}/create_account`
const FETCH_ALL_POSTS_ENDPOINT = `${server}/allposts`
const VOTE_ENDPOINT = `${server}/vote`
const FETCH_ALL_COMMENTS_ENDPOINT = `${server}/allcomments`
const CREATE_COMMENT_ENDPOINT = `${server}/create_comment`
const CREATE_POST_ENDPOINT = `${server}/create_post`

// Create the authentication context with a default empty object
const AuthenticationContext = createContext<AuthenticationProps>({});

// Custom hook to easily access the authentication context in components
export const useAuthentication = () => { 
    return useContext (AuthenticationContext);
};

// Provider component that wraps the app and supplies authentication state & methods
export const AuthenticationProvider = ({children} : any ) => {
    // Local state holding the current token and authentication status
    const [authenticationState, setAuthenticationState] = useState<{
        token: string | null; 
        authenticated: boolean | null }>
        ({
        token: null,
        authenticated: null,
    });

    // On mount, attempt to load a previously stored token from secure storage
    useEffect(() => {
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            console.log('Loaded token: ', token);
            if (token) {
                // If token exists, set it globally on axios and mark as authenticated
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setAuthenticationState({ 
                    token: token, 
                    authenticated: true 
                });
            } else {
                // No token → unauthenticated
                setAuthenticationState({ 
                    token: token, 
                    authenticated: false 
                });
            }
        };
        loadToken();
    }, []) // Empty dependency array → runs only once on mount

    // Function to create a new user account
    const create_account = async (accountData: any) => {
    try {
        const response = await axios.post(CREATE_ACCOUNT_ENDPOINT, accountData);
        console.log("Account creation response:", response.data);
        return response;
    } catch (e: any) {
        console.error("Account creation error:", e.response?.data || e.message);
        return {
            error: true,
            msg: e.response?.data?.message || e.message || "Failed to create account"
        };
    }
};

    // Login function – sends credentials and stores the returned JWT
    const login = async(emailAddress: string, password: string) => {
        try {
            const response =  await axios.post(LOGIN_ENDPOINT,{ emailAddress, passwordHash: password})
            console.log("Response from server", response)

            const token = response.data.access_token;

            // Update local state, set global axios header, and persist token
            setAuthenticationState({ token, authenticated: true });
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await SecureStore.setItemAsync(TOKEN_KEY, token);

            return response;
        } catch (e) {
            return {error: true, msg: (e as any).response.data.msg};
        }
    }

    // Fetch all posts – requires a valid token
    const fetchAllPosts = async () => {
    try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        
        if (!token) {
            throw new Error("No authentication token found");
        }

        // Explicitly set Authorization header for this request (more reliable than default)
        const response = await axios.get(FETCH_ALL_POSTS_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Response from server (fetch posts):", response);
        return response;

    } catch (e: any) {
        console.error("Fetch posts error:", e.response || e);
        return {
            error: true,
            msg: e.response?.data?.message || e.message || "Failed to fetch posts"
        };
    }
};  

    // Vote on a post (e.g., upvote/downvote)
    const vote = async(postID: string, reactionType: string) => {
        try {
            await SecureStore.getItemAsync(TOKEN_KEY); // Just checking existence (token should be in headers already)

            const response =  await axios.post(VOTE_ENDPOINT, {postID, reactionType})
            console.log("Response from server", response)

            // Some backends return a new token on certain actions – update if present
            setAuthenticationState({
                token: response.data.token,
                authenticated: true
            });

            
            return response;
        } catch (e) {
            return {error: true, msg: (e as any).response.data.msg};
        }
    }

    // Fetch all comments – requires a valid token
    const fetchAllComments = async (postID: any) => {
    try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        
        if (!token) {
            throw new Error("No authentication token found");
        }

        // Explicitly set Authorization header for this request (more reliable than default)
        const response = await axios.get(FETCH_ALL_COMMENTS_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                postID: postID  // to adds ?postID=whatever-the-post-id to  URL.
                // without the params prop, I was getting the error "postID query parameter is required"
                // from the server.
            }
        });

        console.log("Response from server (fetch comments):", response);
        return response;

    } catch (e: any) {
        console.error("Fetch comments error:", e.response || e);
        return {
            error: true,
            msg: e.response?.data?.message || e.message || "Failed to fetch comments"
        };
    }
};

    // Create a new comment for a post
    const create_comment = async (commentData: any) => {
        try {
            await SecureStore.getItemAsync(TOKEN_KEY); // Just checking existence (token should be in headers already)

            const response =  await axios.post(CREATE_COMMENT_ENDPOINT, commentData)
            console.log("Response from server", response)

            return response

        } catch (e) {
            return {error: true, msg: (e as any).response.data.msg};
        }
    }

    // Create a new post
    const createPost = async(postData: any) => {
        try {
            await SecureStore.getItemAsync(TOKEN_KEY); // Verify token exists (header already set globally)

            const response =  await axios.post(CREATE_POST_ENDPOINT, postData)
            console.log("Response from server", response)
            
            return response;
        } catch (e) {
            return {error: true, msg: (e as any).response.data.msg};
        }
    }

    // Logout – clears token from storage, headers, and state
    const logout = async() => {
        await SecureStore.deleteItemAsync(TOKEN_KEY); // deleting token from storage
        axios.defaults.headers.common['Authorization'] = '';
        setAuthenticationState({
            token: null,
            authenticated: false
        })
    }

    // Value object provided to consumers of the context
    const value = {
        onCreate_Account: create_account,
        onLogin: login,
        onLogout: logout,
        onFetchAllPosts: fetchAllPosts,
        onVote: vote,
        onCreatePost: createPost,
        onFetchAllComments: fetchAllComments,
        onCreateComment: create_comment,
        authenticationState
    };

    // Render the context provider with the computed value
    return <AuthenticationContext.Provider value={value}>{children}</AuthenticationContext.Provider>

    } // End of AuthenticationProvider