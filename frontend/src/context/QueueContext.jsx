import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { queueApi } from '../api/client';

const QueueContext = createContext(null);

export const QueueProvider = ({ children }) => {
    // 1. Staff Authentication State (starts logged out so user enters login form first)
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = sessionStorage.getItem('clinova_current_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // 2. Queues & Selected Queue
    const [queues, setQueues] = useState([]);
    const [selectedQueueId, setSelectedQueueId] = useState(null);

    // 3. Tokens List & Persistent Completed Consultations
    // Clean daily slate: starts from today's real completed consultations (0 initial)
    const [tokens, setTokens] = useState([]);
    const getTodayDateString = () => new Date().toISOString().slice(0, 10);

    const [completedTokensList, setCompletedTokensList] = useState(() => {
        try {
            const savedDate = localStorage.getItem('clinova_date');
            const today = getTodayDateString();
            if (savedDate !== today) {
                // New day: clean slate starting fresh from 0
                localStorage.setItem('clinova_date', today);
                localStorage.setItem('clinova_completed_consultations', JSON.stringify([]));
                return [];
            }
            const saved = localStorage.getItem('clinova_completed_consultations');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [completedCount, setCompletedCount] = useState(() => completedTokensList.length);

    // Keep completed consultations permanently synced to localStorage
    useEffect(() => {
        try {
            const today = getTodayDateString();
            localStorage.setItem('clinova_date', today);
            localStorage.setItem('clinova_completed_consultations', JSON.stringify(completedTokensList));
            setCompletedCount(completedTokensList.length);
        } catch (e) {
            console.error('Failed to sync completed consultations to localStorage:', e);
        }
    }, [completedTokensList]);

    // Fetch queues and all completed tokens from Django API on mount
    const fetchQueues = async () => {
        try {
            const res = await queueApi.getQueues();
            if (res.data && res.data.length > 0) {
                setQueues(res.data);
                if (!selectedQueueId) {
                    setSelectedQueueId(res.data[0].id);
                }
            }

            // Sync all completed tokens from backend DB so they never vanish
            try {
                const compRes = await queueApi.getAllCompleted();
                if (compRes.data && compRes.data.length > 0) {
                    setCompletedTokensList((prev) => {
                        const existingTokens = new Set(prev.map(p => p.token));
                        const incoming = compRes.data.filter(t => !existingTokens.has(t.token));
                        return [...prev, ...incoming];
                    });
                }
            } catch (errComp) {
                console.warn('Could not fetch backend completed tokens:', errComp);
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
        const userObj = {
            name: 'Neehari Soule',
            email: email || 'CN1021',
            station: 'OPD Department Desk 1',
            isLoggedIn: true,
        };
        try {
            sessionStorage.setItem('clinova_current_user', JSON.stringify(userObj));
        } catch (e) {}
        setCurrentUser(userObj);
    };

    const logout = () => {
        try {
            sessionStorage.removeItem('clinova_current_user');
        } catch (e) {}
        setCurrentUser(null);
    };

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

    // Requirement 3: Add new person / token with EXPLICIT user-assigned token number
    const addToken = async (patientName, age, gender = 'M', notes = '', targetQueueId = null, tokenNumber = '') => {
        const qId = targetQueueId || selectedQueueId;
        if (!qId) return;
        try {
            const payload = {
                patient_name: patientName,
                token_number: tokenNumber,
                age: Number(age) || 30,
                gender,
                notes,
            };
            const res = await queueApi.addToken(qId, payload);
            if (qId === selectedQueueId) {
                setTokens((prev) => [...prev, res.data]);
            }
            await fetchQueues();
            return res.data;
        } catch (err) {
            console.error('Error adding token in backend:', err);
            const targetQ = queues.find(q => q.id === qId);
            const dept = (targetQ?.department || '').toLowerCase();
            const prefix = dept.includes('ped') ? 'PED' : dept.includes('card') ? 'CARD' : dept.includes('ortho') ? 'ORT' : dept.includes('diag') || dept.includes('path') ? 'LAB' : 'GP';
            const nextPos = tokens.length + 1;
            const fallbackToken = {
                id: Date.now(),
                queue: qId,
                token_number: tokenNumber || `${prefix}28`,
                patient_name: patientName,
                age: Number(age) || 30,
                gender,
                notes,
                position: nextPos,
                status: 'WAITING',
            };
            if (qId === selectedQueueId) {
                setTokens((prev) => [...prev, fallbackToken]);
            }
            return fallbackToken;
        }
    };

    // Requirement 5: Move Token Up
    const moveTokenUp = async (tokenId) => {
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

    // Requirement 6: Assign Top Token for Service
    const serveNext = async (queueId = selectedQueueId) => {
        try {
            const res = await queueApi.serveNext(queueId);
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
            fetchQueues();
        } catch (err) {
            console.error('Error cancelling token in backend:', err);
        }
    };

    // Complete Active Consultation with Selected/Typed Prescription & Exact Attended Time
    const completeActiveConsultation = async (tokenId, customPrescription = '') => {
        if (currentlyServing) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            setCompletedTokensList((prev) => [
                {
                    token: currentlyServing.tokenNumber,
                    name: currentlyServing.patientName,
                    ageGender: `${currentlyServing.age} ${currentlyServing.gender}`,
                    doctor: activeQueue?.name || 'General OPD',
                    room: activeQueue?.room || 'Room 101',
                    attendedTime: timeStr,
                    prescription: customPrescription || 'Rx Generated & Pharmacy Order Dispatched',
                    status: 'COMPLETED'
                },
                ...prev
            ]);
        }
        setCompletedCount((prev) => prev + 1);
        await serveNext(selectedQueueId);
    };

    // Active Queue
    const activeQueue = useMemo(() => {
        return (
            queues.find((q) => q.id === selectedQueueId) ||
            queues[0] || {
                id: 1,
                name: 'Dr. Srikanth - General Physician (Room 201)',
                room: 'Room 201',
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

    // Analytics
    const analytics = useMemo(() => {
        const totalHospitalWaiting = queues.reduce((acc, q) => {
            const count = q.waiting_count !== undefined ? q.waiting_count : 0;
            return acc + count;
        }, 0);

        return {
            avgWaitMinutes: '8.4',
            totalServedCount: completedCount,
            waitingCount: totalHospitalWaiting,
            allQueues: queues,
            completedTokensList: completedTokensList
        };
    }, [queues, tokens, completedCount, completedTokensList]);

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
                fetchQueues
            }}
        >
            {children}
        </QueueContext.Provider>
    );
};

export const useQueue = () => {
    const context = useContext(QueueContext);
    if (!context) {
        throw new Error('useQueue must be used within a QueueProvider');
    }
    return context;
};
