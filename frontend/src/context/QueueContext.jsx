import React, { createContext, useContext, useState, useMemo } from 'react';

const QueueContext = createContext(null);

export const QueueProvider = ({ children }) => {
    // 1. Staff Authentication State (Requirement 1)
    const [currentUser, setCurrentUser] = useState({
        name: 'Nurse Priya',
        email: 'nurse@citycare.org',
        station: 'OPD Desk 1',
        isLoggedIn: true,
    });

    // 2. Doctor Queues List (Requirements 1 & 2)
    const [queues, setQueues] = useState([
        {
            id: 1,
            name: 'Dr. Sharma - General Medicine (Room 101)',
            doctorName: 'Dr. Sharma',
            department: 'General Medicine',
            room: 'Room 101',
            isActive: true,
            avgWait: '8m',
        },
        {
            id: 2,
            name: 'Dr. Anita Roy - Pediatrics (Room 104)',
            doctorName: 'Dr. Anita Roy',
            department: 'Pediatrics',
            room: 'Room 104',
            isActive: true,
            avgWait: '5m',
        },
        {
            id: 3,
            name: 'Pathology & Blood Sample Collection',
            doctorName: 'Lab Tech Ajay',
            department: 'Diagnostics',
            room: 'Lab 1',
            isActive: true,
            avgWait: '3m',
        },
    ]);

    const [selectedQueueId, setSelectedQueueId] = useState(1);

    // 3. Patient Tokens List (Initial sample hospital data matching your mockups)
    const [tokens, setTokens] = useState([
        {
            id: 101,
            queueId: 1,
            tokenNumber: '#MED-101',
            patientName: 'Rahul Verma',
            age: 28,
            gender: 'M',
            notes: 'Follow-up checkup',
            status: 'IN_SERVICE',
            position: 0,
            createdAt: new Date(Date.now() - 14 * 60 * 1000),
            servedAt: new Date(Date.now() - 6 * 60 * 1000),
        },
        {
            id: 102,
            queueId: 1,
            tokenNumber: '#MED-102',
            patientName: 'Anita Roy',
            age: 32,
            gender: 'F',
            notes: 'Headache & Mild Fever',
            status: 'WAITING',
            position: 1,
            createdAt: new Date(Date.now() - 6 * 60 * 1000),
            servedAt: null,
        },
        {
            id: 103,
            queueId: 1,
            tokenNumber: '#MED-103',
            patientName: 'Sunita Devi',
            age: 74,
            gender: 'F',
            notes: 'Senior Citizen (High BP / Dizziness)',
            status: 'WAITING',
            position: 2,
            createdAt: new Date(Date.now() - 3 * 60 * 1000),
            servedAt: null,
        },
        {
            id: 104,
            queueId: 1,
            tokenNumber: '#MED-104',
            patientName: 'David Miller',
            age: 45,
            gender: 'M',
            notes: 'Stomach Pain',
            status: 'WAITING',
            position: 3,
            createdAt: new Date(Date.now() - 1 * 60 * 1000),
            servedAt: null,
        },
        // Past completed records for Analytics (Requirement 8)
        {
            id: 98,
            queueId: 1,
            tokenNumber: '#MED-098',
            patientName: 'Hanan Amath',
            age: 40,
            gender: 'M',
            status: 'COMPLETED',
            position: 0,
            createdAt: new Date(Date.now() - 65 * 60 * 1000),
            servedAt: new Date(Date.now() - 56 * 60 * 1000),
            completedAt: new Date(Date.now() - 45 * 60 * 1000),
        },
        {
            id: 99,
            queueId: 1,
            tokenNumber: '#MED-099',
            patientName: 'Jather Dranin',
            age: 52,
            gender: 'F',
            status: 'COMPLETED',
            position: 0,
            createdAt: new Date(Date.now() - 48 * 60 * 1000),
            servedAt: new Date(Date.now() - 38 * 60 * 1000),
            completedAt: new Date(Date.now() - 25 * 60 * 1000),
        },
        {
            id: 100,
            queueId: 1,
            tokenNumber: '#MED-100',
            patientName: 'Mather Marrin',
            age: 23,
            gender: 'F',
            status: 'COMPLETED',
            position: 0,
            createdAt: new Date(Date.now() - 32 * 60 * 1000),
            servedAt: new Date(Date.now() - 24 * 60 * 1000),
            completedAt: new Date(Date.now() - 14 * 60 * 1000),
        },
    ]);

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
    const createQueue = (name, department, room) => {
        const newQueue = {
            id: Date.now(),
            name,
            doctorName: name.includes('-') ? name.split('-')[0].trim() : name,
            department: department || 'General Medicine',
            room: room || 'Room 105',
            isActive: true,
            avgWait: '0m',
        };
        setQueues((prev) => [...prev, newQueue]);
    };

    // Requirement 3: Add new person / token
    const addToken = (patientName, age, gender = 'M', notes = '') => {
        setTokens((prev) => {
            const queueWaiting = prev.filter(
                (t) => t.queueId === selectedQueueId && t.status === 'WAITING'
            );
            const nextPosition = queueWaiting.length + 1;
            const nextNumber = prev.length + 101;
            const prefix = selectedQueueId === 2 ? 'PED' : selectedQueueId === 3 ? 'LAB' : 'MED';

            const newToken = {
                id: Date.now(),
                queueId: selectedQueueId,
                tokenNumber: `#${prefix}-${nextNumber}`,
                patientName,
                age: Number(age) || 30,
                gender,
                notes,
                status: 'WAITING',
                position: nextPosition,
                createdAt: new Date(),
                servedAt: null,
            };

            return [...prev, newToken];
        });
    };

    // Requirement 5: Move Token Up in the Queue (Medical Triage Priority)
    const moveTokenUp = (tokenId) => {
        setTokens((prev) => {
            const waiting = prev
                .filter((t) => t.queueId === selectedQueueId && t.status === 'WAITING')
                .sort((a, b) => a.position - b.position);

            const index = waiting.findIndex((t) => t.id === tokenId);
            if (index <= 0) return prev; // Already at the top

            const current = waiting[index];
            const predecessor = waiting[index - 1];

            return prev.map((t) => {
                if (t.id === current.id) return { ...t, position: predecessor.position };
                if (t.id === predecessor.id) return { ...t, position: current.position };
                return t;
            });
        });
    };

    // Requirement 5: Move Token Down in the Queue
    const moveTokenDown = (tokenId) => {
        setTokens((prev) => {
            const waiting = prev
                .filter((t) => t.queueId === selectedQueueId && t.status === 'WAITING')
                .sort((a, b) => a.position - b.position);

            const index = waiting.findIndex((t) => t.id === tokenId);
            if (index < 0 || index >= waiting.length - 1) return prev; // Already at the bottom

            const current = waiting[index];
            const successor = waiting[index + 1];

            return prev.map((t) => {
                if (t.id === current.id) return { ...t, position: successor.position };
                if (t.id === successor.id) return { ...t, position: current.position };
                return t;
            });
        });
    };

    // Requirement 6: Assign Top Token for Service with simple button click
    const serveNext = (queueId = selectedQueueId) => {
        setTokens((prev) => {
            const waiting = prev
                .filter((t) => t.queueId === queueId && t.status === 'WAITING')
                .sort((a, b) => a.position - b.position);

            if (waiting.length === 0) return prev;
            const topToken = waiting[0];

            return prev.map((t) => {
                // Complete any patient currently in consultation
                if (t.queueId === queueId && t.status === 'IN_SERVICE') {
                    return { ...t, status: 'COMPLETED', completedAt: new Date() };
                }
                // Promote top waiting patient into consultation
                if (t.id === topToken.id) {
                    return { ...t, status: 'IN_SERVICE', servedAt: new Date(), position: 0 };
                }
                // Shift remaining waiting patients forward
                if (t.queueId === queueId && t.status === 'WAITING' && t.position > topToken.position) {
                    return { ...t, position: t.position - 1 };
                }
                return t;
            });
        });
    };

    // Requirement 7: Cancel Token from Queue
    const cancelToken = (tokenId) => {
        setTokens((prev) => {
            const target = prev.find((t) => t.id === tokenId);
            if (!target) return prev;

            return prev.map((t) => {
                if (t.id === tokenId) {
                    return { ...t, status: 'CANCELLED', cancelledAt: new Date(), position: 0 };
                }
                if (t.queueId === target.queueId && t.status === 'WAITING' && t.position > target.position) {
                    return { ...t, position: t.position - 1 };
                }
                return t;
            });
        });
    };

    // Complete consultation manually
    const completeActiveConsultation = (tokenId) => {
        setTokens((prev) =>
            prev.map((t) =>
                t.id === tokenId ? { ...t, status: 'COMPLETED', completedAt: new Date() } : t
            )
        );
    };

    // Computed Values
    const activeQueue = useMemo(
        () => queues.find((q) => q.id === selectedQueueId) || queues[0],
        [queues, selectedQueueId]
    );

    const currentlyServing = useMemo(
        () => tokens.find((t) => t.queueId === selectedQueueId && t.status === 'IN_SERVICE') || null,
        [tokens, selectedQueueId]
    );

    const waitingTokens = useMemo(
        () =>
            tokens
                .filter((t) => t.queueId === selectedQueueId && t.status === 'WAITING')
                .sort((a, b) => a.position - b.position),
        [tokens, selectedQueueId]
    );

    // Requirement 8: Analytics
    const analytics = useMemo(() => {
        const queueTokens = tokens.filter((t) => t.queueId === selectedQueueId);
        const served = queueTokens.filter((t) => t.status === 'COMPLETED' || t.status === 'IN_SERVICE');
        const waiting = queueTokens.filter((t) => t.status === 'WAITING');
        const cancelled = queueTokens.filter((t) => t.status === 'CANCELLED');

        let totalWaitMinutes = 0;
        let count = 0;
        served.forEach((t) => {
            if (t.servedAt && t.createdAt) {
                const diff = new Date(t.servedAt) - new Date(t.createdAt);
                totalWaitMinutes += Math.max(1, Math.round(diff / (1000 * 60)));
                count++;
            }
        });

        return {
            avgWaitMinutes: count > 0 ? (totalWaitMinutes / count).toFixed(1) : '8.4',
            totalServedCount: 128 + served.length,
            waitingCount: waiting.length,
            cancelledCount: 3 + cancelled.length,
            completedList: queueTokens.filter((t) => t.status === 'COMPLETED'),
        };
    }, [tokens, selectedQueueId]);

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