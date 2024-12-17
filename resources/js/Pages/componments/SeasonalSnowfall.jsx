// SeasonalSnowfall.js
import React, { useEffect, useState } from 'react';
import Snowfall from 'react-snowfall';

const SeasonalSnowfall = () => {
  const [snowflakeCount, setSnowflakeCount] = useState(0);

  useEffect(() => {
    const updateSnowfall = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const start = new Date(currentYear, 11, 1); // December 1st
      const peak = new Date(currentYear, 11, 25); // December 24th
      const end = new Date(currentYear, 11, 31); // December 31st

      if (now >= start && now <= end) {
        let count = 0;
        if (now <= peak) {
          // Increase snowflake count from December 1st to 25th
          const daysSinceStart = (now - start) / (1000 * 60 * 60 * 24);
          count = Math.min(200, Math.floor((daysSinceStart / 24) * 200));
        } else {
          // Decrease snowflake count from December 26th to 31st
          const daysUntilEnd = (end - now) / (1000 * 60 * 60 * 24);
          count = Math.max(0, Math.floor((daysUntilEnd / 6) * 200));
        }
        setSnowflakeCount(count);
      } else {
        setSnowflakeCount(0);
      }
    };

    updateSnowfall();
    const interval = setInterval(updateSnowfall, 60 * 60 * 1000); // Update every hour

    return () => clearInterval(interval);
  }, []);

  if (snowflakeCount === 0) return null;

  return (
    <Snowfall
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        zIndex: 2,
      }}
      color='#fff'
      snowflakeCount={snowflakeCount}
    />
  );
};

export default SeasonalSnowfall;
