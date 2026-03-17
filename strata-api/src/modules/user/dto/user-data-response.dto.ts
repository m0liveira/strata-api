export interface UserProfileResponse {
    user_id: number;
    username: string;
    email: string;
    name: string;
    photo: string | null;
    pending_friends: number[];
    friends: number[];
    following: number[];
    followers: number[];
    trips: any[];
}