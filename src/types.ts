import { Document, Filter, UpdateFilter, FindOptions } from "mongodb";

// MongoDB Atlas Data API compatible request types
export interface DataApiRequest {
  dataSource: string;
  database: string;
  collection: string;
}

export interface FindOneRequest extends DataApiRequest {
  filter?: Filter<Document>;
  projection?: Document;
}

export interface FindRequest extends DataApiRequest {
  filter?: Filter<Document>;
  projection?: Document;
  sort?: Document;
  limit?: number;
  skip?: number;
}

export interface InsertOneRequest extends DataApiRequest {
  document: Document;
}

export interface InsertManyRequest extends DataApiRequest {
  documents: Document[];
}

export interface UpdateOneRequest extends DataApiRequest {
  filter: Filter<Document>;
  update: UpdateFilter<Document>;
  upsert?: boolean;
}

export interface UpdateManyRequest extends DataApiRequest {
  filter: Filter<Document>;
  update: UpdateFilter<Document>;
  upsert?: boolean;
}

export interface DeleteOneRequest extends DataApiRequest {
  filter: Filter<Document>;
}

export interface DeleteManyRequest extends DataApiRequest {
  filter: Filter<Document>;
}

export interface AggregateRequest extends DataApiRequest {
  pipeline: Document[];
}

// Response types matching MongoDB Atlas Data API format
export interface DataApiResponse<T = any> {
  document?: T;
  documents?: T[];
  insertedId?: string;
  insertedIds?: string[];
  matchedCount?: number;
  modifiedCount?: number;
  deletedCount?: number;
  upsertedId?: string;
}

export interface ErrorResponse {
  error: string;
  error_code?: string;
  link?: string;
}

// Action types
export type ActionType =
  | "findOne"
  | "find"
  | "insertOne"
  | "insertMany"
  | "updateOne"
  | "updateMany"
  | "deleteOne"
  | "deleteMany"
  | "aggregate";

export interface ActionRequest {
  action: ActionType;
  dataSource: string;
  database: string;
  collection: string;
  [key: string]: any;
}
