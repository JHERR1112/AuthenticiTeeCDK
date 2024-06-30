import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
import {Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Table} from "aws-cdk-lib/aws-dynamodb";
import {API_ENDPOINTS, ApiEndpointDefinition} from "../config/api_config";

export interface LambdaStackProps extends cdk.StackProps {
  authCodesTable: Table
}

export class LambdaStack extends cdk.Stack {

  lambdaMap: Map<string, lambda.Function>;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);
    this.lambdaMap = new Map<string, lambda.Function>();

    const idPrefix = "us-east-2-lambda";

    const logGroup = new LogGroup(this, `${idPrefix}-logs`, {
      retention: RetentionDays.ONE_MONTH
    });

    const dynamoPolicy = new ManagedPolicy(this, `${idPrefix}-dynamo-policy`, {
      statements: [new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:UpdateItem",
          "dynamodb:BatchWriteItem"
        ],
        resources: [props.authCodesTable.tableArn]
      })]
    })

    const iamRole = new Role(this, `${idPrefix}-execution-role`, {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      roleName: `${idPrefix}-execution-role`,
      managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
          dynamoPolicy
      ]
    });

    // const metricsPolicyStatement = new PolicyStatement({
    //   actions: ['cloudwatch:GetMetricData', 'cloudwatch:PutMetricData'],
    //   resources: ['*'],
    //   effect: Effect.ALLOW
    // });

    API_ENDPOINTS.forEach((endpoint: ApiEndpointDefinition) => {
      const lambdaFunction = new lambda.Function(this, `${idPrefix}-${endpoint.path}-lambda`, {
        functionName: endpoint.functionName,
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: `${endpoint.handler}.handler`,
        logGroup: logGroup,
        role: iamRole
      });

      this.lambdaMap.set(endpoint.operationName, lambdaFunction);

    });
    // authCodeGeneratorLambda.addToRolePolicy(metricsPolicyStatement);
  }
}
