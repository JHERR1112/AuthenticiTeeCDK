import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
import {Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Table} from "aws-cdk-lib/aws-dynamodb";

export interface LambdaStackProps extends cdk.StackProps {
  authCodesTable: Table
}

export class LambdaStack extends cdk.Stack {

  authCodeGeneratorLambda: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

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

    this.authCodeGeneratorLambda = new lambda.Function(this, `${idPrefix}-auth-code-generator`, {
      functionName: 'AuthCodeGeneratorLambdaV2',
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'authCodeGeneratorLambda.handler',
      logGroup: logGroup,
      role: iamRole
    });

    // authCodeGeneratorLambda.addToRolePolicy(metricsPolicyStatement);
  }
}
