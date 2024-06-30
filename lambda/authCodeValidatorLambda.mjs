import { DynamoDBClient, BatchWriteItemCommand, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

const TABLE_NAME = 'AuthCodesV2'

export const handler = async (event, context) => {
    let statusCode = 200;
    let responseBody;
    const headers = {
        "Content-Type": "application/json",
    };
    let isAlreadyAuthenticated = false;
    try {
        let authCodeToValidate = '';

        if (event.authCodeToValidate) {
            authCodeToValidate = event.authCodeToValidate;
        } else if (event.body !== null && event.body !== undefined) {
            const requestBody = JSON.parse(event.body);
            if (requestBody.authCodeToValidate) {
                authCodeToValidate = requestBody.authCodeToValidate;
            }
        }

        const getAuthCodeQuery = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: {
                uniqueAuthCode: { S:  authCodeToValidate }
            },
        });

        const authCode = await client.send(getAuthCodeQuery);

        if (authCode !== null && authCode !== undefined) {

            isAlreadyAuthenticated = authCode.Item.isAuthenticated.N === '1'

            const updateAuthCodeQuery = new UpdateItemCommand({
                TableName: TABLE_NAME,
                ReturnValues: 'ALL_NEW',
                Key: {
                    uniqueAuthCode: { S: authCodeToValidate }
                },
                ExpressionAttributeNames: {
                    "#isAuthAttr": "isAuthenticated",
                    "#authAttemptsAttr": "authenticationAttempts"
                },
                ExpressionAttributeValues: {
                    ":isAuthVal": {
                        N: '1',
                    },
                    ":authAttemptsVal": {
                        "N": (parseInt(authCode.Item.authenticationAttempts.N) + 1).toString()
                    }
                },
                UpdateExpression: "SET #isAuthAttr = :isAuthVal, #authAttemptsAttr = :authAttemptsVal"
            });
            await client.send(updateAuthCodeQuery);
        }

    } catch(err) {
        statusCode = 400;
        responseBody = err.message;
    }

    return {
        statusCode,
        body: {
            isAlreadyAuthenticated
        },
        headers,
    };
};