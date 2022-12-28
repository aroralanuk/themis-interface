import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const Timer = ({ deadline = new Date().toString() }) => {
  const parsedDeadline: any = useMemo(() => new Date(Number(deadline)), [deadline]);
  const [time, setTime] = useState(parsedDeadline - Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(parsedDeadline - Date.now()), 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      className='timer'
      sx={{
        display: 'flex',
        flexDirection: 'row',
        marginTop: 2.5,
        marginBottom: 2.5
      }}
    >
      {Object.entries({
        Day: time / DAY,
        Hrs: (time / HOUR) % 24,
        Min: (time / MINUTE) % 60,
        Sec: (time / SECOND) % 60,
      }).map(([label, value]) => (
        <Box key={label} className='col-smth'>
          <Typography variant='body1' mr={3}>
            {`${Math.floor(value)}`.padStart(2, '0')}
          </Typography>
          <Typography variant="caption" className='text'>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default Timer;
