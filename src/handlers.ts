import { Collection, Document } from "mongodb";
import { dbManager } from "./database.js";
import {
  DataApiResponse,
  FindOneRequest,
  FindRequest,
  InsertOneRequest,
  InsertManyRequest,
  UpdateOneRequest,
  UpdateManyRequest,
  DeleteOneRequest,
  DeleteManyRequest,
  AggregateRequest,
  ErrorResponse,
} from "./types.js";

export class DataApiHandlers {
  private getCollection(
    database: string,
    collection: string
  ): Collection<Document> {
    const db = dbManager.getDatabase(database);
    return db.collection(collection);
  }

  async findOne(
    request: FindOneRequest
  ): Promise<DataApiResponse | ErrorResponse> {
    try {
      const collection = this.getCollection(
        request.database,
        request.collection
      );
      const document = await collection.findOne(request.filter || {}, {
        projection: request.projection,
      });

      return { document };
    } catch (error) {
      return {
        error: `Failed to find document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error_code: "FIND_ONE_ERROR",
      };
    }
  }

  async find(request: FindRequest): Promise<DataApiResponse | ErrorResponse> {
    try {
      const collection = this.getCollection(
        request.database,
        request.collection
      );
      let cursor = collection.find(request.filter || {});

      if (request.projection) {
        cursor = cursor.project(request.projection);
      }
      if (request.sort) {
        cursor = cursor.sort(request.sort);
      }
      if (request.skip) {
        cursor = cursor.skip(request.skip);
      }
      if (request.limit) {
        cursor = cursor.limit(request.limit);
      }

      const documents = await cursor.toArray();
      return { documents };
    } catch (error) {
      return {
        error: `Failed to find documents: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error_code: "FIND_ERROR",
      };
    }
  }

  async insertOne(
    request: InsertOneRequest
  ): Promise<DataApiResponse | ErrorResponse> {
    try {
      const collection = this.getCollection(
        request.database,
        request.collection
      );
      const result = await collection.insertOne(request.document);

      return { insertedId: result.insertedId.toString() };
    } catch (error) {
      return {
        error: `Failed to insert document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error_code: "INSERT_ONE_ERROR",
      };
    }
  }

  async insertMany(
    request: InsertManyRequest
  ): Promise<DataApiResponse | ErrorResponse> {
    try {
      const collection = this.getCollection(
        request.database,
        request.collection
      );
      const result = await collection.insertMany(request.documents);

      const insertedIds = Object.values(result.insertedIds).map((id) =>
        id.toString()
      );
      return { insertedIds };
    } catch (error) {
      return {
        error: `Failed to insert documents: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error_code: "INSERT_MANY_ERROR",
      };
    }
  }

  async updateOne(
    request: UpdateOneRequest
  ): Promise<DataApiResponse | ErrorResponse> {
    try {
      const collection = this.getCollection(
        request.database,
        request.collection
      );
      const result = await collection.updateOne(
        request.filter,
        request.update,
        { upsert: request.upsert || false }
      );

      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedId: result.upsertedId?.toString(),
      };
    } catch (error) {
      return {
        error: `Failed to update document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error_code: "UPDATE_ONE_ERROR",
      };
    }
  }

  async updateMany(
    request: UpdateManyRequest
  ): Promise<DataApiResponse | ErrorResponse> {
    try {
      const collection = this.getCollection(
        request.database,
        request.collection
      );
      const result = await collection.updateMany(
        request.filter,
        request.update,
        { upsert: request.upsert || false }
      );

      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedId: result.upsertedId?.toString(),
      };
    } catch (error) {
      return {
        error: `Failed to update documents: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error_code: "UPDATE_MANY_ERROR",
      };
    }
  }

  async deleteOne(
    request: DeleteOneRequest
  ): Promise<DataApiResponse | ErrorResponse> {
    try {
      const collection = this.getCollection(
        request.database,
        request.collection
      );
      const result = await collection.deleteOne(request.filter);

      return { deletedCount: result.deletedCount };
    } catch (error) {
      return {
        error: `Failed to delete document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error_code: "DELETE_ONE_ERROR",
      };
    }
  }

  async deleteMany(
    request: DeleteManyRequest
  ): Promise<DataApiResponse | ErrorResponse> {
    try {
      const collection = this.getCollection(
        request.database,
        request.collection
      );
      const result = await collection.deleteMany(request.filter);

      return { deletedCount: result.deletedCount };
    } catch (error) {
      return {
        error: `Failed to delete documents: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error_code: "DELETE_MANY_ERROR",
      };
    }
  }

  async aggregate(
    request: AggregateRequest
  ): Promise<DataApiResponse | ErrorResponse> {
    try {
      const collection = this.getCollection(
        request.database,
        request.collection
      );
      const documents = await collection.aggregate(request.pipeline).toArray();

      return { documents };
    } catch (error) {
      return {
        error: `Failed to aggregate documents: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error_code: "AGGREGATE_ERROR",
      };
    }
  }
}
