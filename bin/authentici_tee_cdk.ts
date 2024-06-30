#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../stacks/lambda';
import {ApiGWStack} from "../stacks/apigw";
import {DynamoStack} from "../stacks/dynamo";

const AWS_ACCOUNT = '017490024687';
const AWS_REGION = 'us-east-2';

const app = new cdk.App();

const dynamoStack = new DynamoStack(app, 'dynamo-stack', {
    env: { account: AWS_ACCOUNT, region: AWS_REGION },
});

const lambdaStack = new LambdaStack(app, 'lambda-stack', {
    env: { account: AWS_ACCOUNT, region: AWS_REGION },
    authCodesTable: dynamoStack.authCodesTable
});

new ApiGWStack(app, 'apigw-stack', {
    env: { account: AWS_ACCOUNT, region: AWS_REGION },
    lambdaMap: lambdaStack.lambdaMap
});