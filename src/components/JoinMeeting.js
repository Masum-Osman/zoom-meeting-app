import React, { useState, useEffect } from 'react';

const JoinMeeting = () => {
    const [meetingId, setMeetingId] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Check if ZoomMtg is defined
    const loadZoomSdk = () => {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (window.ZoomMtg) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100); // Check every 100ms
        });
    };

    const handleJoinMeeting = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!meetingId || !name) {
            setError('Please enter both Meeting ID and your name.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/join', { // Your backend URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ meetingId, password, name }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Something went wrong');

            const { sdkKey, signature, zakToken } = data;

            // Wait for the Zoom SDK to load
            await loadZoomSdk();

            ZoomMtg.init({
                leaveUrl: 'https://example.com/thanks-for-joining', // Adjust as necessary
                success: () => {
                    ZoomMtg.join({
                        sdkKey,
                        signature,
                        meetingNumber: meetingId,
                        password: password,
                        userName: name,
                        zak: zakToken,
                        success: (success) => {
                            console.log('Successfully joined the meeting:', success);
                            setSuccess('Successfully joined the meeting!');
                        },
                        error: (error) => {
                            console.error('Error joining the meeting:', error);
                            setError('Failed to join the meeting.');
                        }
                    });
                },
                error: (error) => {
                    console.error('Error initializing Zoom:', error);
                    setError('Failed to initialize Zoom SDK.');
                }
            });
        } catch (err) {
            setError('Failed to retrieve Zoom meeting credentials. Please try again.');
        }
    };

    return (
        <div className="join-meeting">
            <h2>Join a Zoom Meeting</h2>
            <form onSubmit={handleJoinMeeting}>
                <input
                    type="text"
                    placeholder="Meeting ID"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Password (optional)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button type="submit">Join Meeting</button>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
            </form>
        </div>
    );
};

export default JoinMeeting;
