import React from 'react';

const baseUrl = "https://b0oj88biwb.execute-api.ap-south-1.amazonaws.com";
const baseHeaders = {
    "Authorization": "Bearer testing-upi-credit",
    "Content-Type": "application/json"
};

export const getUserRegistrationStatus = async () => {
    const res = await fetch(`${baseUrl}/user/registration/status`, {
        headers: {
            ...baseHeaders
        },
        method: "GET"
    });
    return (await res.json()).status;
};

export const requestOTP = async () => {
    const res = await fetch(`${baseUrl}/user/registration}/otp/request`, {
        headers: {
            ...baseHeaders
        },
        method: "POST"
    });
    return (await res.json()).otpSent as boolean;
};

export const verifyOTP = async (otp: string) => {
    const res = await fetch(`${baseUrl}/user/registration/otp/verify`, {
        headers: {
            ...baseHeaders
        },
        method: "POST",
        body: JSON.stringify({
            otp
        })
    });
    return (await res.json()).verified as boolean;
};

export const initiateTransaction = async (qrData: string, amount: number) => {
    const res = await fetch(`${baseUrl}/user/transactions/new`, {
        headers: {
            ...baseHeaders
        },
        method: "POST",
        body: JSON.stringify({
            qr: qrData,
            amount
        })
    });
    const resB = await res.json();
    return { initiated: resB.merchantTransactionId!!, transactionId: resB.merchantTransactionId };
};

export const checkTransactionStatus = async (transactionId: string) => {
    const res = await fetch(`${baseUrl}/user/transactions/${transactionId}`, {
        headers: {
            ...baseHeaders
        },
        method: "GET",
    });
    return (await res.json()).status;
};
