import React, { useState, useEffect } from 'react';
import TopLoadingBar from 'react-top-loading-bar';

const LoadingIndicator = ({ loading }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const increaseProgress = () => {
            setProgress(prevProgress => {
                const newProgress = prevProgress + 10;
                return newProgress > 100 ? 100 : newProgress;
            });
        };

        const decreaseProgress = () => {
            setProgress(prevProgress => {
                const newProgress = prevProgress - 10;
                return newProgress < 0 ? 0 : newProgress;
            });
        };

        const interval = setInterval(() => {
            increaseProgress();
        }, 200); // You can adjust the interval time as needed

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <TopLoadingBar
            progress={progress}
            style={{ visibility: loading ? "visible" : "hidden" }}
            color="#ff0000" // Customize the color if needed
            onLoaderFinished={() => setProgress(0)}
        />
    );
};

export default LoadingIndicator;
