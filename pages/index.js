import React, { Suspense, useEffect, useState } from "react";
import Head from 'next/head'
import { Center, Button, Link, RadioGroup, Radio, ChakraProvider, Flex } from '@chakra-ui/react'
import { Stack, HStack, VStack } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Spinner } from '@chakra-ui/react'
import { Image } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import { Divider, Spacer, Box } from '@chakra-ui/react'
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption } from '@chakra-ui/react'
import { IconButton } from '@chakra-ui/react'
import { MoonIcon, SunIcon, CheckCircleIcon } from '@chakra-ui/icons'
import { useColorMode } from '@chakra-ui/react'
import styles from '../styles/Home.module.css'
import { FirebaseApp } from "firebase/app";
import { initializeApp, increment, firebase } from "firebase/app";
import { getDatabase, ref, query, orderByChild, onValue, orderByValue, set, update } from "firebase/database";
import { useAutoAnimate } from '@formkit/auto-animate/react'

// // TODO: Replace the following with your app's Firebase project configuration
// // See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  //   // ...
  //   // The value of `databaseURL` depends on the location of the database
  apiKey: "AIzaSyALgeoEXpEyYpKxSMdlgFuWjYutyBcVs00",
  authDomain: "rfiddatabase-925fe.firebaseapp.com",
  databaseURL: "https://rfiddatabase-925fe-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rfiddatabase-925fe",
  storageBucket: "rfiddatabase-925fe.appspot.com",
  messagingSenderId: "228694002634",
  appId: "1:228694002634:web:1ca2ddbb7054cb5f7ddd33",
  measurementId: "G-PV7LDNBHP9"
};

// // Initialize Firebase
const app = initializeApp(firebaseConfig);


// // Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);


//const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Home() {

  const [parent, enableAnimations] = useAutoAnimate(/* optional config */)


  const { colorMode, toggleColorMode } = useColorMode()
  // const { data, error } = useSWR('/api/user', fetcher)
  const dataRef = query(ref(database, 'racers'));

  // onValue(dataRef, (snapshot) => {
  //   const data = snapshot.val();
  //   //updateStarCount(postElement, data);
  // });
  const [data, setData] = useState([]);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const racersRef = ref(db, 'racers');

    const unsubscribe = onValue(racersRef, (snapshot) => {
      const racersData = snapshot.val();
      const racersArray = Object.keys(racersData || {})
        .filter(racerId => racersData[racerId].hasOwnProperty("name"))
        .map(key => ({
          ...racersData[key],
          rfid: key,
        }));

      racersArray.sort((a, b) => {
        // Compare lap count
        const lapDiff = parseInt(b.lap) - parseInt(a.lap);
        if (lapDiff !== 0) {
          return lapDiff;
        }

        // If lap count is the same, compare lap time
        if (a.lapTime === undefined || b.lapTime === undefined) {
          return a.lapTime === undefined ? 1 : -1; // Sort racers without lap time after racers with lap time
        } else {
          const lapTimeDiff = parseFloat(a.lapTime) - parseFloat(b.lapTime);
          if (lapTimeDiff !== 0) {
            return lapTimeDiff;
          }
        }

        // If lap time is the same, compare checkpoint count
        const checkpointDiff = parseInt(b.checkpoint) - parseInt(a.checkpoint);
        if (checkpointDiff !== 0) {
          return checkpointDiff;
        }

        // If checkpoint count is the same, compare timestamp
        return a.timestamp - b.timestamp;
      });

      // Find the first-place racer and their lap count and lap time
      const firstPlaceRacer = racersArray[0];
      const firstPlaceLap = parseInt(firstPlaceRacer.lap);
      const firstPlaceLapTime = parseFloat(firstPlaceRacer.lapTime);




      for (let i = 0; i < racersArray.length; i++) {

        if (racersArray[i].lap === firstPlaceLap) {
          racersArray[i].gap = '+' + (racersArray[i].lapTime - firstPlaceLapTime).toFixed(3);
        } else {
          racersArray[i].gap = `${firstPlaceLap - racersArray[i].lap} lap(s)`;
        }

      }

      setData(racersArray);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const [startTimestamp, setStartTime] = useState(null);
  useEffect(() => {
    const databaseRef = ref(database, 'startTimestamp');
    const unsubscribe = onValue(databaseRef, (snapshot) => {
      setStartTime(snapshot.val());
    });

    // Return a cleanup function to remove the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);



  // if (error) return <div>Failed to load</div>
  if (!data) {
    return (
      <div className={styles.loading}>
        <Spinner size="xl" />
        <Text as="h2">Fetching data...</Text>
        <Text as="h4">This can take up to 20 seconds</Text>
      </div>
    )
  }
  // Sort the leaderboard data in descending order based on the score
  //const sortedLeaderboard = leaderboard.sort((a, b) => b.score - a.score);
  return (
    <Box w='100%' minHeight='100vh' overflowX="auto" backgroundImage="url('/grid pattern.svg')" bgPosition="center"
    bgRepeat="no-repeat" bgSize="cover">
      <Flex
        flexDirection="column"
        justify="center"
        align="center">

        <Spacer />

        {/* <IconButton onClick={toggleColorMode}>{colorMode === 'light' ? <MoonIcon /> : <SunIcon />}</IconButton> */}
        <Image
          boxSize="150px"
          src={colorMode === 'light' ? '/Front Logo.png' : '/Front Logo.png'}
          objectFit='cover'
          alt="enduropark logo"
          marginTop="20px"
        />
        <Stopwatch startTimestamp={startTimestamp} />

        <h1 className={styles.title}>AdvX Race Leaderboard</h1>

        <Divider />
      </Flex>
      <Table variant="striped" size="sm" colorScheme="gray">
        <Thead>
          <Tr>
            <Th>Rank</Th>
            <Th>Rider /{"\n"} Checkpoint</Th>
            <Th>Last Lap Time /{"\n"} Lap</Th>
            <Th>Total Time /{"\n"}Gap</Th>
          </Tr>
        </Thead>
        <Tbody ref={parent}>
          {data.map((user, index) => (
            <Tr key={index}>
              <Td>{++index}</Td>
              <Td>
                <Box>
                <Text>
                {user.name}
                </Text>
                <Box marginTop='3px' marginBottom='2px'>
                <StepProgressIndicator currentStep={user.checkpoint}>
                </StepProgressIndicator>
                </Box>
                </Box>
              </Td>
              <Td>
                <Box>
                  <TimeDifference startTime={user.lastLapTime} endTime={user.lapTime}>
                  </TimeDifference>
                  <Text>
                  {user.lap} laps
                  </Text>
                </Box></Td>
              <Td>
                <Box>
                <TimeDifference startTime={startTimestamp} endTime={user.lapTime}>
                </TimeDifference>
                <Text>
                {user.gap}
                </Text>
                </Box></Td>
            </Tr>
          ))}
        </Tbody>
        <Tfoot>
          <Tr>
            <Th>Rank</Th>
            <Th>Rider /{"\n"} Checkpoint</Th>
            <Th>Last Lap Time /{"\n"} Lap</Th>
            <Th>Total Time /{"\n"}Gap</Th>
          </Tr>
        </Tfoot>
      </Table>

    </Box>
  )
}

const StepProgressIndicator = ({ currentStep }) => {
  const steps = [1, 2];
  return (
    <div style={{ display: 'flex' }}>
      {steps.map((step) => (
        <div
          key={step}
          style={{
            height: '10px',
            width: '25%',
            backgroundColor: step <= currentStep ? 'darkorange' : 'lightgray',
            margin: '0 2px',
            borderRadius: '3px',
          }}
        />
      ))}
    </div>
  );
};

const TimeDifference = ({ startTime, endTime }) => {

  if (startTime === null) {
    return <span>N/A</span>;
  }
  // Parse the start and checkpoint times as Date objects
  const startDate = new Date(startTime);
  const checkpointDate = new Date(endTime);

  // Check that the start and checkpoint times are valid
  if (isNaN(startDate.getTime()) || isNaN(checkpointDate.getTime())) {
    console.log('Invalid start or checkpoint time');
    return <span>N/A</span>;
  }

  // Calculate the time difference between the checkpoint time and the race start time
  const timeDifference = checkpointDate.getTime() - startDate.getTime();

  // Check that the checkpoint time is after the start time
  if (timeDifference < 0) {
    console.log('Checkpoint time is before start time');
    return <span>N/A</span>;
  }

  // Convert the time difference to minutes and seconds
  const hours = Math.floor(timeDifference / 3600000);
  const minutes = Math.floor((timeDifference / 3600000)/60000);
  const seconds = ((timeDifference % 60000) / 1000).toFixed(0);

  // Return the time difference in minutes and seconds format
  return (
    <span>
      {`${Math.abs(hours).toString().padStart(2, '0')}:${Math.abs(minutes).toString().padStart(2, '0')}:${Math.abs(seconds).toString().padStart(2, '0')}`}
    </span>
  );
};

const Time = ({ time }) => {
  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time /3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


// const Stopwatch = (serverTime) => {

//   function writeStartTime() {

//     set(ref(database, 'startTimestamp'), {
//       timestamp: Date.now()
//     });
//   }

//   // state to store time
//   const [time, setTime] = useState(0);

//   // state to check stopwatch running or not
//   const [isRunning, setIsRunning] = useState(false);

//   useEffect(() => {
//     let intervalId;
//     if (isRunning) {
//       // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
//       intervalId = setInterval(() => setTime(time + 1), 10);
//     }
//     return () => clearInterval(intervalId);
//   }, [isRunning, time]);

//   // Hours calculation
//   const hours = Math.floor(time / 360000);

//   // Minutes calculation
//   const minutes = Math.floor((time % 360000) / 6000);

//   // Seconds calculation
//   const seconds = Math.floor((time % 6000) / 100);

//   // Milliseconds calculation
//   const milliseconds = time % 100;

//   // Method to start and stop timer
//   const startAndStop = () => {
//     setIsRunning(!isRunning);
//     if (!isRunning) {
//       writeStartTime();
//     } else {
//       { reset }
//     }
//   };

//   // Method to reset timer back to 0
//   const reset = () => {
//     setTime(0);
//   };
//   return (
//     <div className="stopwatch-container">
//       <p className="stopwatch-time">
//         {hours}:{minutes.toString().padStart(2, "0")}:
//         {seconds.toString().padStart(2, "0")}:
//         {milliseconds.toString().padStart(2, "0")}
//       </p>
//       <div className="stopwatch-buttons">
//         <Button className="stopwatch-button" onClick={startAndStop} colorScheme={isRunning ? "red" : "green"}>
//           {isRunning ? "Stop" : "Start"}
//         </Button>
//       </div>
//     </div>
//   );
// };

function Stopwatch(props) {
  const { startTimestamp } = props;
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (startTimestamp) {
      setIsRunning(true);
      setElapsedTime(Date.now() - startTimestamp);
    }
  }, [startTimestamp]);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 10);
      }, 10);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning]);

  const handleStart = () => {
    const timestamp = Date.now();
    update(ref(getDatabase()), { startTimestamp: timestamp })
      .then(() => {
        setIsRunning(true);
        setElapsedTime(0);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleReset = () => {
    update(ref(getDatabase()), { startTimestamp: null })
      .then(() => {
        setIsRunning(false);
        setElapsedTime(0);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div>
      <div>{formatTime(elapsedTime)}</div>
    </div>
  );
}