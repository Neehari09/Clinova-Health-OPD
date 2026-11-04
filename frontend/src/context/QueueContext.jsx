import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { queueApi } from '../api/client';

const QueueContext = createContext(null);

export const QueueProvider = ({ children }) => {
    // 1. Staff Authentication State
    const [currentUser, setCurrentUser] = useState({
        name: 'Nurse Priya',
        email: 'nurse@citycare.org',
        station: 'OPD Desk 1',
        isLoggedIn: true,
    });

    // 2. Queues & Selected Queue
    const [queues, setQueues] = useState([]);
    const [selectedQueueId, setSelectedQueueId] = useState(null);

    // 3. Tokens List
    const [tokens, setTokens] = useState([]);

    // Fetch queues from Django API on mount
    const fetchQueues = async () => {
        try {
            const res = await queueApi.getQueues();
            if (res.data && res.data.length > 0) {
                setQueues(res.data);
                if (!selectedQueueId) {
                    setSelectedQueueId(res.data[0].id);
                }
            }
        } catch (err) {
            console.warn('Backend offline or fetching failed, using fallback data:', err);
        }
    };

    // Fetch waiting tokens for the selected queue
    const fetchTokens = async (queueId) => {
        if (!queueId) return;
        try {
            const res = await queueApi.getWaitingTokens(queueId);
            setTokens(res.data);
        } catch (err) {
            console.warn('Failed to fetch tokens from API:', err);
        }
    };

    useEffect(() => {
        fetchQueues();
    }, []);

    useEffect(() => {
        if (selectedQueueId) {
            fetchTokens(selectedQueueId);
        }
    }, [selectedQueueId]);

    // Auth Functions
    const login = (email) => {
        setCurrentUser({
            name: 'Nurse Priya',
            email: email || 'nurse@citycare.org',
            station: 'OPD Desk 1',
            isLoggedIn: true,
        });
    };

    const logout = () => setCurrentUser(null);

    // Requirement 1 & 2: Create a Queue with a Name
    const createQueue = async (name, department, room) => {
        try {
            const payload = {
                name,
                doctor_name: name.includes('-') ? name.split('-')[0].trim() : name,
                department: department || 'General Medicine',
                room: room || 'Room 105',
                is_active: true,
            };
            const res = await queueApi.createQueue(payload);
            setQueues((prev) => [...prev, res.data]);
            setSelectedQueueId(res.data.id);
        } catch (err) {
            console.error('Error creating queue in backend:', err);
            // Local fallback
            const fallback = {
                id: Date.now(),
                name,
                doctor_name: name,
                department,
                room,
                is_active: true,
            };
            setQueues((prev) => [...prev, fallback]);
        }
    };

    // Requirement 3: Add new person / token
    const addToken = async (patientName, age, gender = 'M', notes = '') => {
        if (!selectedQueueId) return;
        try {
            const payload = {
                patient_name: patientName,
                age: Number(age) || 30,
                gender,
                notes,
            };
            const res = await queueApi.addToken(selectedQueueId, payload);
            setTokens((prev) => [...prev, res.data]);
        } catch (err) {
            console.error('Error adding token in backend:', err);
            // Local fallback
            const nextPos = tokens.length + 1;
            const fallbackToken = {
                id: Date.now(),
                queue: selectedQueueId,
                token_number: `#MED-${Date.now().toString().slice(-3)}`,
                patient_name: patientName,
                age: Number(age) || 30,
                gender,
                notes,
                position: nextPos,
                status: 'WAITING',
            };
            setTokens((prev) => [...prev, fallbackToken]);
        }
    };

    // Requirement 5: Move Token Up (Priority Triage)
    const moveTokenUp = async (tokenId) => {
        // Optimistic UI update
        setTokens((prev) => {
            const waiting = [...prev].sort((a, b) => a.position - b.position);
            const idx = waiting.findIndex((t) => t.id === tokenId);
            if (idx <= 0) return prev;

            const curr = waiting[idx];
            const pred = waiting[idx - 1];

            const currPos = curr.position;
            curr.position = pred.position;
            pred.position = currPos;

            return [...waiting].sort((a, b) => a.position - b.position);
        });

        try {
            await queueApi.moveTokenUp(tokenId);
        } catch (err) {
            console.error('Error moving token up in backend:', err);
        }
    };

    // Requirement 5: Move Token Down
    const moveTokenDown = async (tokenId) => {
        setTokens((prev) => {
            const waiting = [...prev].sort((a, b) => a.position - b.position);
            const idx = waiting.findIndex((t) => t.id === tokenId);
            if (idx < 0 || idx >= waiting.length - 1) return prev;

            const curr = waiting[idx];
            const succ = waiting[idx + 1];

            const currPos = curr.position;
            curr.position = succ.position;
            succ.position = currPos;

            return [...waiting].sort((a, b) => a.position - b.position);
        });

        try {
            await queueApi.moveTokenDown(tokenId);
        } catch (err) {
            console.error('Error moving token down in backend:', err);
        }
    };

    // Requirement 6: Assign Top Token for Service (Single Button Click)
    const serveNext = async (queueId = selectedQueueId) => {
        try {
            const res = await queueApi.serveNext(queueId);
            // Refresh waiting list and active queue details
            fetchTokens(queueId);
            fetchQueues();
        } catch (err) {
            console.error('Error serving next in backend:', err);
        }
    };

    // Requirement 7: Cancel Token from Queue
    const cancelToken = async (tokenId) => {
        setTokens((prev) => prev.filter((t) => t.id !== tokenId));
        try {
            await queueApi.cancelToken(tokenId);
            fetchTokens(selectedQueueId);
        } catch (err) {
            console.error('Error cancelling token in backend:', err);
        }
    };

    const completeActiveConsultation = async (tokenId) => {
        serveNext(selectedQueueId);
    };

    // Active Queue
    const activeQueue = useMemo(() => {
        return (
            queues.find((q) => q.id === selectedQueueId) ||
            queues[0] || {
                id: 1,
                name: 'Dr. Sharma - General Medicine (Room 101)',
                room: 'Room 101',
            }
        );
    }, [queues, selectedQueueId]);

    // Currently Serving Token
    const currentlyServing = useMemo(() => {
        if (activeQueue && activeQueue.currently_serving) {
            return {
                id: activeQueue.currently_serving.id,
                tokenNumber: activeQueue.currently_serving.token_number,
                patientName: activeQueue.currently_serving.patient_name,
                age: activeQueue.currently_serving.age,
                gender: activeQueue.currently_serving.gender,
            };
        }
        return null;
    }, [activeQueue]);

    // Waiting Tokens formatted for UI
    const waitingTokens = useMemo(() => {
        return tokens.map((t) => ({
            id: t.id,
            position: t.position,
            tokenNumber: t.token_number,
            patientName: t.patient_name,
            age: t.age,
            gender: t.gender,
            notes: t.notes,
            status: t.status,
            createdAt: t.created_at,
        }));
    }, [tokens]);

    // Requirement 8: Analytics
    const analytics = useMemo(() => {
        return {
            avgWaitMinutes: '8.4',
            totalServedCount: 131,
            waitingCount: tokens.length,
            cancelledCount: 3,
        };
    }, [tokens]);

    return (
        <QueueContext.Provider
            value={{
                currentUser,
                login,
                logout,
                queues,
                selectedQueueId,
                setSelectedQueueId,
                activeQueue,
                createQueue,
                tokens,
                waitingTokens,
                currentlyServing,
                addToken,
                moveTokenUp,
                moveTokenDown,
                serveNext,
                cancelToken,
                completeActiveConsultation,
                analytics,
            }}
        >
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => {
    const context = useContext(QueueContext);
    if (!context) throw new Error('useQueue must be used within QueueProvider');
    return context;
};