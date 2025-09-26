export interface RefreshToken {
    id: number;
    userId: number;
    token: string;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
    updatedAt: Date;
}
