import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
export declare class AdminAuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        message: string;
        accessToken: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: "ADMIN";
        };
        expiresIn: string;
    }>;
    getProfile(req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
}
