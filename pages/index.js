import React, { Suspense, useEffect, useState } from "react";
import useSWR from 'swr'
import Head from 'next/head'
import { Center, Button, Link, RadioGroup, Radio, ChakraProvider } from '@chakra-ui/react'
import { Stack, HStack, VStack } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Spinner } from '@chakra-ui/react'
import { Image } from '@chakra-ui/react'
import { Text } from '@chakra-ui/react'
import { Divider } from '@chakra-ui/react'
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption } from '@chakra-ui/react'
import { IconButton } from '@chakra-ui/react'
import { MoonIcon, SunIcon, CheckCircleIcon } from '@chakra-ui/icons'
import { useColorMode } from '@chakra-ui/react'
import styles from '../styles/Home.module.css'
import FlipMove from "react-flip-move";
import { FirebaseApp } from "firebase/app";
import { initializeApp, increment, firebase } from "firebase/app";
import { getDatabase, ref, query, orderByChild, onValue, orderByValue, set } from "firebase/database";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";

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

  const [currentLap, setLap] = useState([]);
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */)
  const startTimeRef = query(ref(database, 'startTimestamp'));
 

  const { colorMode, toggleColorMode } = useColorMode()
  // const { data, error } = useSWR('/api/user', fetcher)
  const dataRef = query(ref(database, 'racers'));

  // onValue(dataRef, (snapshot) => {
  //   const data = snapshot.val();
  //   //updateStarCount(postElement, data);
  // });
  const [data, setData] = useState([]);

  useEffect(() => {
    onValue(dataRef, (snapshot) => {
      const result = snapshot.val();
      const list = Object.values(result).sort(function (x, y) { return y.checkpoint - x.checkpoint || x.timestamp - y.timestamp; });
      const updates = {}
      for (let a = 0; a < list.length; a++) {
        var difference = Math.abs(list[a].timestamp - startTimestamp);
        list[a].timestamp = Math.floor((difference / 1000) / 60);
        if (list[a].checkpoint == 4) {
          list[a].lap += 1;
          const ckey = list[a].key
          set(ref(database, 'racers/' + ckey + 'lap')), {
            lap: list[a].lap
          };
        }
      }
      setData(list);
    }
    );
  })

  const [startTimestamp, setStartTime] = useState(1);
  useEffect(() => {
    ref(database, 'startTimestamp');
    onValue(startTimeRef, (snapshot) => {
      const data = snapshot.val();
      setStartTime(data.timestamp);
    });
  })


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

    <div className={styles.container} >

      <Head>
        <title>RFID Leaderboard</title>
        <meta name="description" content="RFID Race Leaderboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <VStack>
          <IconButton onClick={toggleColorMode}>{colorMode === 'light' ? <MoonIcon /> : <SunIcon />}</IconButton>
          <Image
            boxSize="150px"
            src={colorMode === 'light' ? '/Front Logo.png' : '/Front Logo.png'}
            objectFit='cover'
            alt="enduropark logo"
          />
          <Stopwatch />
        </VStack>
        <h1 className={styles.title}>RFID Leaderboard</h1>
        <Divider />
        <Table variant="striped" size="sm">

          <Thead>
            <Tr>
              <Th>Rank</Th>
              <Th>Racer</Th>
              <Th>Checkpoint</Th>
              <Th>Lap</Th>
              <Th>CP Time</Th>
            </Tr>
          </Thead>
          <Tbody ref={parent}>
            {data.map((user, index) => (
              <Tr key={user.name}>
                <Td>{++index}</Td>
                <Td>{user.name}</Td>
                <Td>
                  <ProgressBar percent={(() => {
                    switch (user.checkpoint) {
                      case 1:
                        return 1;
                      case 2:
                        return 35;
                      case 3:
                        return 70;
                      case 4:
                        return 100;
                    }
                  })()}>
                    <Step transition="scale">
                      {({ accomplished, index }) => (
                        <div>
                          {accomplished ? <CheckCircleIcon /> : null}
                        </div>
                      )}
                    </Step>
                    <Step transition="scale">
                      {({ accomplished, index }) => (
                        <div
                          className={`indexedStep ${accomplished ? CheckCircleIcon : null}`}
                        >
                          {accomplished ? <CheckCircleIcon /> : null}
                        </div>
                      )}
                    </Step>
                    <Step transition="scale">
                      {({ accomplished, index }) => (
                        <div
                          className={`indexedStep ${accomplished ? CheckCircleIcon : null}`}
                        >
                          {accomplished ? <CheckCircleIcon /> : null}
                        </div>
                      )}
                    </Step>

                    <Step transition="scale">
                      {({ accomplished, index }) => (
                        <div
                          className={`indexedStep ${accomplished ? "accomplished" : null}`}
                        >
                          {accomplished ? <CheckCircleIcon /> : null}
                        </div>
                      )}
                    </Step>
                  </ProgressBar>
                </Td>
                <Td>{user.lap}</Td>
                <Td>{user.timestamp}</Td>
              </Tr>
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>Rank</Th>
              <Th>Racer</Th>
              <Th>Checkpoint</Th>
              <Th>Lap</Th>
              <Th>CP Time</Th>
            </Tr>
          </Tfoot>
        </Table>
      </main>
      <footer className={styles.footer}>
        <Text>
          mimdal
        </Text>
      </footer>
    </div>

  )
}
const Stopwatch = () => {

  function writeStartTime() {

    set(ref(database, 'startTimestamp'), {
      timestamp: Date.now()
    });
  }

  // state to store time
  const [time, setTime] = useState(0);

  // state to check stopwatch running or not
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      // setting time from 0 to 1 every 10 milisecond using javascript setInterval method
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, time]);

  // Hours calculation
  const hours = Math.floor(time / 360000);

  // Minutes calculation
  const minutes = Math.floor((time % 360000) / 6000);

  // Seconds calculation
  const seconds = Math.floor((time % 6000) / 100);

  // Milliseconds calculation
  const milliseconds = time % 100;

  // Method to start and stop timer
  const startAndStop = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      writeStartTime();
    } else {
      { reset }
    }
  };

  // Method to reset timer back to 0
  const reset = () => {
    setTime(0);
  };
  return (
    <div className="stopwatch-container">
      <p className="stopwatch-time">
        {hours}:{minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}:
        {milliseconds.toString().padStart(2, "0")}
      </p>
      <div className="stopwatch-buttons">
        <Button className="stopwatch-button" onClick={startAndStop} colorScheme={isRunning ? "red" : "green"}>
          {isRunning ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
};



