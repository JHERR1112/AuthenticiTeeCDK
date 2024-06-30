import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import {Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {
    EndpointType,
    LambdaIntegration,
    PassthroughBehavior,
    RestApi
} from 'aws-cdk-lib/aws-apigateway';
import {API_ENDPOINTS} from "../config/api_config";

export interface ApiGWStackProps extends cdk.StackProps {
    lambdaMap: Map<string, lambda.Function>;
}

export class ApiGWStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiGWStackProps) {
        super(scope, id, props);

        const idPrefix = "us-east-2-apigw";

        const apiRole = new Role(this, `${idPrefix}-iam-role`, {
           roleName: `${idPrefix}-iam-role`,
           assumedBy: new ServicePrincipal('apigateway.amazonaws.com')
        });

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

        API_ENDPOINTS.forEach(endpoint => {
           const requestModel = api.addModel( `${idPrefix}-${endpoint.path}-request-model` , endpoint.requestModelSchema);
           const lambdaFunction = <lambda.Function> props.lambdaMap.get(endpoint.operationName);
           const lambdaFunctionAlias = lambda.Function.fromFunctionAttributes(this, `${idPrefix}-${endpoint.path}-alias`, {
               functionArn: `${lambdaFunction.functionArn}`,
               sameEnvironment: true
           });
            const lambdaIntegration = new LambdaIntegration(lambdaFunctionAlias, {
                proxy: true,
                allowTestInvoke: true,
                passthroughBehavior: PassthroughBehavior.NEVER,
                credentialsRole: apiRole,
            });
            api.root.addResource(endpoint.path)
                .addMethod(endpoint.httpMethod, lambdaIntegration, {
                    operationName: endpoint.operationName,
                    requestModels: { 'application/json' : requestModel }
                });
            lambdaFunctionAlias.grantInvoke(apiRole);
        });
    }
}