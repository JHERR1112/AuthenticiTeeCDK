import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import {Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
// import {EndpointType, LogGroupLogDestination, MethodLoggingLevel, RestApi} from "aws-cdk-lib/aws-apigateway";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {
    EndpointType,
    LambdaIntegration,
    LogGroupLogDestination,
    MethodLoggingLevel,
    PassthroughBehavior,
    RestApi
} from 'aws-cdk-lib/aws-apigateway';

export interface DynamoStackProps extends cdk.StackProps {
    authCodeGeneratorLambda: lambda.Function
}

export class ApiGWStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: DynamoStackProps) {
        super(scope, id, props);

        const idPrefix = "us-east-2-apigw";

        const apiRole = new Role(this, `${idPrefix}-iam-role`, {
           roleName: `${idPrefix}-iam-role`,
           assumedBy: new ServicePrincipal('apigateway.amazonaws.com')
        });

        const logGroup = new LogGroup(this, `${idPrefix}-log-groups`, {
            retention: RetentionDays.ONE_MONTH
        });

        // const api = new RestApi(this, `${idPrefix}-rest-api`, {
        //    restApiName: 'AuthenticiTee REST API',
        //    deployOptions: {
        //        stageName: 'PROD',
        //        loggingLevel: MethodLoggingLevel.ERROR,
        //        metricsEnabled: true,
        //        accessLogDestination: new LogGroupLogDestination(logGroup)
        //    },
        //    endpointConfiguration: {
        //        types: [EndpointType.REGIONAL]
        //    },
        //    deploy: true
        // });

        const api = new RestApi(this, `${idPrefix}-rest-api`, {
            restApiName: 'AuthenticiTee API',
            deployOptions: {
                stageName: 'PROD',
            },
            endpointConfiguration: {
                types: [EndpointType.REGIONAL],
            },
            deploy: true
        });

        // const api = new apigateway.LambdaRestApi(this, `${idPrefix}-rest-api`, {
        //     handler: props.authCodeGeneratorLambda,
        //     proxy: true,
        // });

        // const generateAuthCodeResource = api.root.addResource('generate-auth-code');

        const requestModel = api.addModel(`${idPrefix}-generate-auth-code-request-model`, {
            modelName: 'GenerateAuthCodeRequestModel',
            contentType: 'application/json',
            schema: {
                type: apigateway.JsonSchemaType.OBJECT,
                properties: {
                    numberOfCodes: { type: apigateway.JsonSchemaType.NUMBER }
                }
            }
        });

        const lambdaFunctionAlias = lambda.Function.fromFunctionAttributes(this, `${idPrefix}-generate-auth-code-alias`, {
            functionArn: `${props.authCodeGeneratorLambda.functionArn}:live`,
            sameEnvironment: true
        });

        const lambdaIntegration = new LambdaIntegration(lambdaFunctionAlias, {
            proxy: true,
            allowTestInvoke: true,
            passthroughBehavior: PassthroughBehavior.NEVER,
            credentialsRole: apiRole,
        });

        // generateAuthCodeResource.addMethod('POST', undefined, {
        //     requestModels: { 'application/json' : requestModel }
        // });

        lambdaFunctionAlias.grantInvoke(apiRole);

        api.root.addResource('generate-auth-codes')
            .addMethod('POST', lambdaIntegration, {
                requestModels: { 'application/json' : requestModel }
            });
    }
}