import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteItemCommand } from "@aws-sdk/lib-dynamodb";

export class DynamoClient {

    readonly tableName: string;
    readonly client: DynamoDBDocumentClient;

    constructor(tableName: string) {
        this.tableName = tableName;
        this.client = new DynamoDBClient({});
    }

    async batchWrite(items: Array<any>) {
        const query = new BatchWriteItemCommand({
            RequestItems: {
                [this.tableName]: items.map((item: any) => {
                    return {
                        PutRequest: {
                            Item: item
                        }
                    }
                })
            }
        });

        try {
            return this.client.send(query);
        } catch (error) {
            console.log(JSON.stringify(error));
            throw new Error(JSON.stringify(error));
        }

    }

}