import React, { useEffect, useState } from 'react';

import { Alert, AlertIcon, Button, Center, Container, Grid, GridItem } from '@chakra-ui/react';
import { ethers } from 'ethers';

import Head from 'next/head';

import abi from '../utils/GmPortal.json';

import Header from '../components/header';
import Footer from '../components/footer';

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [totalGms, setTotalGms] = useState(0);
  const [allGms, setAllGms] = useState([]);
  const contractAddress = '0xB1d267C6bCF1a7955C071428fd4020CeB2dc7E0E';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      // Check we're authorised on the user's wallet
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length > 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        getAllGms();
      } else {
        console.log('No authorised account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const gm = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gmPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const gmTxn = await gmPortalContract.gm('gm', { gasLimit: 300000 });

        await gmTxn.wait();

        let count = await gmPortalContract.getTotalGms();
        setTotalGms(count.toNumber());
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllGms = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gmPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const gms = await gmPortalContract.getAllGms();

        let gmsCleaned = [];
        gms.forEach((gm) => {
          gmsCleaned.push({
            address: gm.gmer,
            timestamp: new Date(gm.timestamp * 1000),
            message: gm.message,
          });
        });

        setAllGms(gmsCleaned);
        setTotalGms(gmsCleaned.length);
      } else {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    let gmPortalContract;

    const onNewGm = (from, timestamp, message) => {
      setAllGms((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      gmPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      gmPortalContract.on('NewGm', onNewGm);
    }

    return () => {
      if (gmPortalContract) {
        gmPortalContract.off('NewGm', onNewGm);
      }
    };
  }, []);

  return (
    <Container>
      <Head>
        <title>gm portal</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Grid templateRows="repeat(4, 1fr)" minHeight="100vh">
        <Header />

        <GridItem rowStart={2} rowEnd={2}>
          <Center>
            {!currentAccount && (
              <Button size="lg" onClick={connectWallet}>
                Connect Wallet
              </Button>
            )}
            {currentAccount && (
              <Button size="lg" onClick={gm}>
                gm
              </Button>
            )}
          </Center>
        </GridItem>
        {currentAccount && (
          <GridItem rowStart={3} rowEnd={3}>
            <Alert status="success">
              <AlertIcon />
              {totalGms && totalGms} gms have been gmed
            </Alert>
          </GridItem>
        )}

        {currentAccount && (
          <GridItem rowStart={4} rowEnd={4}>
            {allGms.map((gm, index) => {
              return (
                <div key={index}>
                  <div>Address: {gm.address}</div>
                  <div>Time: {gm.timestamp.toString()}</div>
                  <div>Message: {gm.message}</div>
                  <br />
                </div>
              );
            })}
          </GridItem>
        )}
      </Grid>

      <Footer />
    </Container>
  );
}
