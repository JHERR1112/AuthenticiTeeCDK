import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {ModelOptions} from "aws-cdk-lib/aws-apigateway";

export type HttpMethod = 'GET' | 'POST';

export interface ApiEndpointDefinition {
    operationName: string;
    path: string;
    httpMethod: HttpMethod;
    functionName: string;
    handler: string;
    requestModelSchema: ModelOptions;
}

export const API_ENDPOINTS: Array<ApiEndpointDefinition> = [
    {
        operationName: 'Generate Authentication Code',
        path: 'generate-auth-codes',
        httpMethod: 'POST',
        functionName: 'AuthCodeGeneratorLambdaV2',
        handler: 'AuthCodeGenerator',
        requestModelSchema: {
            modelName: 'GenerateAuthCodeRequestModel',
            contentType: 'application/json',
            schema: {
                type: apigateway.JsonSchemaType.OBJECT,
                properties: {
                    numberOfAuthCodes: { type: apigateway.JsonSchemaType.NUMBER }
                }
            }
        }
    },
    {
        operationName: 'Validate Authentication Code',
        path: 'validate-auth-code',
        httpMethod: 'POST',
        functionName: 'AuthCodeValidatorLambda',
        handler: 'authCodeValidatorLambda',
        requestModelSchema: {
            modelName: 'ValidateAuthCodeRequestModel',
            contentType: 'application/json',
            schema: {
                type: apigateway.JsonSchemaType.OBJECT,
                properties: {
                    authCodeToValidate: { type: apigateway.JsonSchemaType.STRING }
                }
            }
        }
    }
]