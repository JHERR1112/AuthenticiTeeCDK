import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import {AuthCode} from "./models/AuthCode";
import {DynamoClient} from "./utils/DynamoClient";

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
        console.log(`Event: ${JSON.stringify(event)}`);
        console.log(`Context: ${JSON.stringify(context)}`);

        if (!isValidInput(event)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid Request'
                })
            }
        }

        const numberOfAuthCodesToGenerate = JSON.parse(<string> event.body).numberOfAuthCodes;

        const generatedAuthCodes = new Array<AuthCode>();
        for (let i = 0; i < numberOfAuthCodesToGenerate; i++) {
            generatedAuthCodes.push(new AuthCode());
        }

        const dynamoClient = new DynamoClient('AuthCodesV2');
        const savedAuthCodes = dynamoClient.batchWrite(generatedAuthCodes);
        console.log(`BatchWrite Completed: ${JSON.stringify(savedAuthCodes)}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Success: ${numberOfAuthCodesToGenerate} Auth Codes generated`,
            }),
        };

    } catch (error) {
        console.log(`Error: ${JSON.stringify(error)}`);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal Server Error',
            }),
        };
    }



};

function isValidInput(event: APIGatewayEvent): boolean {
    if (event.body === null) {
        console.log("Error: event body is missing");
        return false;
    }

    const requestBody = JSON.parse(event.body);
    if (!requestBody.numberOfAuthCodes) {
        console.log("Error: numberOfAuthCodes is missing from event body");
        return false;
    }

    const numberOfAuthCodesToGenerate = requestBody.numberOfAuthCodes;
    if (numberOfAuthCodesToGenerate <= 0) {
        console.log(`numberOfAuthCodesToGenerate must be greater than 0, numberOfAuthCodesToGenerate = ${numberOfAuthCodesToGenerate}`)
        return false;
    }

    return true;
}