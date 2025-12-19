// post-aggregate.interface.ts
import { Types } from 'mongoose';

export interface AggregatedReaction {
  likes: number;
  dislikes: number;
}

export interface AggregatedReply {
  _id: Types.ObjectId;
  content: string;
  user: {
    _id: Types.ObjectId;
    name: string;
    username: string;
  };
  reactions: AggregatedReaction;
}

export interface AggregatedComment {
  _id: Types.ObjectId;
  content: string;
  user: {
    _id: Types.ObjectId;
    name: string;
    username: string;
  };
  reactions: AggregatedReaction;
  replies: AggregatedReply[];
}

export interface AggregatedPost {
  _id: Types.ObjectId;
  postTitle: string;
  postDescription: string;
  user: {
    _id: Types.ObjectId;
    name: string;
    username: string;
  };
  reactions: AggregatedReaction;
  comments: AggregatedComment[];
}
