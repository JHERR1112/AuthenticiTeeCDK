import * as cdk from "aws-cdk-lib";
import {Construct} from "constructs";
import {AttributeType, BillingMode, Table} from "aws-cdk-lib/aws-dynamodb";

export class DynamoStack extends cdk.Stack {

    readonly authCodesTable: Table;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const idPrefix = "us-east-2-dynamo";

        this.authCodesTable = new Table(this, `${idPrefix}`, {
           tableName: 'AuthCodesV2',
           partitionKey:{ name: 'uniqueAuthCode', type: AttributeType.STRING },
           billingMode: BillingMode.PAY_PER_REQUEST
        });
    }
}