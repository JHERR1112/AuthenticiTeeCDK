import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event, context) => {
    let statusCode = 200;
    let body = 'SUCCESS';
    const headers = {
        "Content-Type": "application/json",
    };

    try {
        let numberOfCodesToGenerate = 0;

        if (event.numberOfCodes) {
            numberOfCodesToGenerate = event.numberOfCodes;
        } else if (event.body !== null && event.body !== undefined) {
            const body = JSON.parse(event.body);
            if (body.numberOfCodes) {
                numberOfCodesToGenerate = body.numberOfCodes;
            }
        }
        console.log("Number of codes: " + numberOfCodesToGenerate);
        const generatedCodes = [];
        for(var i = 0; i < numberOfCodesToGenerate; i++) {
            generatedCodes.push(generateUniqueCode());
        }

        const ddbParams = new BatchWriteItemCommand({
            RequestItems: {
                AuthCodesV2: generatedCodes.map(code => {
                    return {
                        PutRequest: {
                            Item: {
                                uniqueAuthCode: { S: code },
                                isAuthenticated: { N: '0' },
                                authenticationAttempts: { N: '0' }
                            }
                        }
                    };
                })
            }
        });

        console.log("DDB Params: " + JSON.stringify(ddbParams));

        await client.send(ddbParams);
    } catch(err) {
        statusCode = 400;
        body = err.message;
    }

    return {
        statusCode,
        body,
        headers,
    };
};

function generateUniqueCode() {
    const length = 10;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}