import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        }).catch((error) => {
            console.warn('Supabase not configured or error loading session:', error);
            setLoading(false);
        });

        // Listen for changes on auth state (sign in, sign out, etc.)
        try {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    loadProfile(session.user.id);
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            });

            return () => subscription.unsubscribe();
        } catch (error) {
            console.warn('Auth state listener not initialized');
            return () => { };
        }
    }, []);

    const loadProfile = async (userId) => {
        try {
            // Try to load from users table first (customer)
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (userData) {
                setProfile({ ...userData, type: 'customer' });
                setLoading(false);
                return;
            }

            // If not a customer, try merchant
            const { data: merchantData, error: merchantError } = await supabase
                .from('merchants')
                .select('*')
                .eq('id', userId)
                .single();

            if (merchantData) {
                setProfile({ ...merchantData, type: 'merchant' });
            } else {
                setProfile(null);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email, password, userData, isMerchant = false) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Create profile in appropriate table
            if (data.user) {
                const profileData = {
                    id: data.user.id,
                    email,
                    ...userData,
                };

                const table = isMerchant ? 'merchants' : 'users';
                const { error: profileError } = await supabase
                    .from(table)
                    .insert([profileData]);

                if (profileError) throw profileError;
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) {
            setUser(null);
            setProfile(null);
        }
        return { error };
    };

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
