/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import 'react-native-url-polyfill/auto';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { checkTransactionStatus, getUserRegistrationStatus, initiateTransaction, verifyOTP } from './Api';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [page, setPage] = useState<string>("home");
  const [otp, setOtp] = useState<string>("123456");
  const [upiCode, setUpiCode] = useState<string>("");
  const [payeeName, setPayeeName] = useState<string>("");
  const [payeeVPA, setPayeeVPA] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [transactionId, setTransactionId] = useState<string>("");

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    (async () => {
      const status = await getUserRegistrationStatus();
      console.log(status);
      if(status === "registered") {
        setPage("scan_qr");
      } else {
        setPage("otp_request");
      }
    })();
  }, []);

  const pollTransactionStatus = async () => {
    while (true) {
      const status = await checkTransactionStatus(transactionId);
      switch (status) {
        case "PENDING": {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await pollTransactionStatus();
          break;
        }
        case "SUCCESS": {
          setPage("txn_successful");
          break;
        }
        case "FAILURE": {
          setPage("txn_failure");
          break;
        }
      }
    }
  };

  useEffect(() => {
    if (transactionId) {
      setPage("txn_status_check");
    }
  }, [transactionId]);

  useEffect(() => {
    if (upiCode) {
      const uri = new URL(upiCode);
      setPayeeName(uri.searchParams.get("pn")!!);
      setPayeeVPA(uri.searchParams.get("pa")!!);
      setPage("amount_entry");
    }
  }, [upiCode]);
  let e = null;

  const checkOtp = () => {
    (async () => {
      const otpVerified = await verifyOTP(otp);
      if (otpVerified) {
        setPage("scan_qr");
      } else {
        setPage("error");
      }
    })();
  };

  const payToVpa = () => {
    (async () => {
      const res = await initiateTransaction(upiCode, Math.ceil(amount * 100));
      console.log(JSON.stringify(res));
      if (res.initiated) {
        setTransactionId(res.transactionId);
        setPage("txn_status_check");
      } else {
        setPage("error");
      }
    })();
  };

  useEffect(() => {
    console.log(page);
  }, [page]);
  useEffect(() => {
    if (otp.length === 6) {
      checkOtp();
    }
  }, [otp]);
  switch (page) {
    case "home": {
      console.log(1);
      e = (
        <Text>Loading...</Text>
      );
      break;
    }
    case "otp_request": {
      console.log(2);
      e = (
        <>
          <OTPInputView
            style={styles.otpView}
            autoFocusOnLoad
            codeInputFieldStyle={styles.underlineStyleBase}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
            code={otp}
            onCodeChanged={(code) => {
              setOtp(code);
            }}
            onCodeFilled={(code => {
              console.log(`Code is ${code}, you are good to go!`);
              setOtp(code);
            })}
            pinCount={4}
          />
          <Button title="Submit OTP" onPress={() => {

          }}></Button>
        </>
      );
      break;
    }
    case "scan_qr": {
      console.log(3);
      e = (
        <>
          <QRCodeScanner onRead={(res) => {
            console.log(res.data);
            setUpiCode(res.data);
          }}
            reactivate={false}
            reactivateTimeout={1000}
            flashMode={RNCamera.Constants.FlashMode.off}
            topContent={
              <Text style={styles.centerText}>
                Go to{' '}
                <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text> on
                your computer and scan the QR code.
              </Text>
            }
            bottomContent={
              <TouchableOpacity style={styles.buttonTouchable}>
                <Text style={styles.buttonText}>OK. Got it!</Text>
              </TouchableOpacity>
            } />
        </>
      );
      break;
    }
    case "amount_entry": {
      e = (
        <>
          <Text>Paying to {payeeName}</Text>
          <Text>{payeeVPA}</Text>
          <TextInput keyboardType='numeric' placeholder='100.00'
            value={(amount === 0) ? "" : amount.toString()} onChangeText={(v) => { (/\d+/.test(v)) ? setAmount(parseFloat(v)) : setAmount(0) }}></TextInput>
          <Button title='Pay' onPress={payToVpa}></Button>
        </>
      );
      break;
    }
    case "txn_status_check": {
      pollTransactionStatus();
      e = (<>
        <Text>Loading...</Text>
      </>);
      break;
    }
    case "txn_successful": {
      e = (<>
        <Text>Transaction Successful</Text>
      </>);
      break;
    }
    case "txn_failure": {
      e = (<>
        <Text>Transaction Failure</Text>
      </>);
      break;
    }
    case "error": {
      e = (
        <Text>Error</Text>
      );
      break;
    }
  }
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {e}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  otpView: {
    height: 100,
    width: 300
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  borderStyleBase: {
    width: 30,
    height: 45
  },

  borderStyleHighLighted: {
    borderColor: "#03DAC6",
  },

  underlineStyleBase: {
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1,
  },

  underlineStyleHighLighted: {
    borderColor: "#03DAC6",
  },
});

export default App;
