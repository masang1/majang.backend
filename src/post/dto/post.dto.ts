import { Post } from "@prisma/client";

export class PostDto {
    postId: number;

    static of(post: Post): PostDto {
        return {
            postId: post.id,
        }
    }
}